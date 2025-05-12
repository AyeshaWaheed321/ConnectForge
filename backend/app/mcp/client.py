import asyncio
import logging
from math import log
from django.conf import settings
from langchain.agents import  AgentExecutor, create_tool_calling_agent
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage

from ..models import AgentConfig, ChatHistory

from ..utils import get_tools

from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)

# servers = {
#   "mcpServers": {
#     "github": {
#       "command": "npx",
#       "args": [
#         "-y",
#         "@modelcontextprotocol/server-github"
#       ],
#       "env": {
#         "GITHUB_PERSONAL_ACCESS_TOKEN": "your_key"
#       }
#     },
#     "math": {
#         "command": "python",
#         "args": ["E:/AgentDoc/backend/app/mcp_servers/calculator.py"],
#     },
#     "filesystem": {
#       "command": "npx",
#       "args": [
#         "-y",
#         "@modelcontextprotocol/server-filesystem",
#         "E:/AgentDoc/backend/app",
#       ]
#     }
#   }
# }
# 
DEFAULT_TEMPLATE = """
    You are a capable AI assistant with access to following tools. Your goal is to provide accurate, concise answers based on the context.

    1. **Understand Context:** Analyze the conversation and ask for clarification if more info is needed.
    2. **Tool Usage:** Use tools only when necessary. Don’t call tools unless you're sure of the answer or need more data.
    3. **Error Handling:** If a tool fails, provide a clear error message and ask for clarification or suggest retrying.
    4. **Response:** Always give a direct, clear answer. If unsure, ask for more details. Don't repeat tool calls unless new info is given.

    Prioritize clarity and helpfulness.
"""

def get_llm_from_config(agent_config: dict):
    provider = agent_config.get("provider", "groq").lower()

    if provider == "groq":
        api_key = settings.GROQ_API_KEY
        llm_class = ChatGroq
    elif provider == "openai":
        api_key = settings.OPENAI_API_KEY
        llm_class = ChatOpenAI
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

    if not api_key:
        raise ValueError(f"API key for provider '{provider}' is missing in settings.")

    llm_kwargs = {
        "model": agent_config.get("model", "llama-3.1-8b-instant" if provider == "groq" else "gpt-3.5-turbo"),
        "api_key": api_key,
        "max_tokens": agent_config.get("max_tokens", 1000),
        "temperature": agent_config.get("temperature", 0),
        "timeout": agent_config.get("timeout", 10),
        "max_retries": agent_config.get("max_retries", 2),
    }

    return llm_class(**llm_kwargs)

@sync_to_async
def get_chat_history(agent_id, n_history_messages):
    agent = AgentConfig.objects.get(id=agent_id)
    return list(ChatHistory.objects.filter(agent=agent).order_by('-timestamp')[:n_history_messages])

@sync_to_async
def save_messages(agent_id, user_message, ai_message):
    agent = AgentConfig.objects.get(id=agent_id)
    ChatHistory.objects.create(agent=agent, message=user_message, role="human")
    ChatHistory.objects.create(agent=agent, message=ai_message, role="ai")
    logger.info(f"Saved messages for agent {agent_id}: User: {user_message}, AI: {ai_message}")

async def run_client(query: str, mcp_servers: dict, agent_config: dict):

    agent_id = agent_config.get("agent_id")

    logger.info(f"Initiating agent execution with agent: {agent_id}")

    llm = get_llm_from_config(agent_config)
    tools = await get_tools(mcp_servers)

    try:
        history = await get_chat_history(agent_id, n_history_messages=agent_config.get("n_history_messages", 4))
        chat_history = [(msg.role, msg.message) for msg in history] if history else []

        logger.info(f"Retrieved chat history for agent {agent_id}: {chat_history}")

    except Exception as e:
        logger.error(f"Error retrieving history for agent {agent_id}: {str(e)}")
        chat_history = []

    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=agent_config.get("system_message", DEFAULT_TEMPLATE)),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad", optional=True),
    ])

    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)

    executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True, return_intermediate_steps=False)

    logger.info(f"Executing agent with query: {query}")
    
    try:
        result = await executor.ainvoke({"input": query, "chat_history": chat_history})
        
        await save_messages(agent_id, query, result["output"])
        return result
    except Exception as e:
        logger.error(f"Error during agent execution: {str(e)}")
        return {"error": str(e)}

def agent_executor(query, mcp_servers, agent_config):
    try:
        result = asyncio.run(run_client(query, mcp_servers, agent_config))
        return result
    except RuntimeError as e:
        if "event loop is closed" in str(e) or "cannot be called from a running event loop" in str(e):
            import nest_asyncio
            nest_asyncio.apply()
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(run_client(query, mcp_servers, agent_config))
        return {"error": str(e)}
    except Exception as e:
        return {"error": str(e)}
