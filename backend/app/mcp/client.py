from argparse import Action
import asyncio
import logging
from math import log
import time
from django.conf import settings
from langchain.agents import  AgentExecutor, create_tool_calling_agent
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage

from ..models import ActivityEvents, AgentConfig, ChatHistory

from ..utils import get_tools, log_activity, log_activity_async, update_metrics

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
    2. **Tool Usage:** Use tools only when necessary. Don’t call tools unless you're sure of the answer or need more data. Stop execution and return final response if any task is beyond your capabilities.
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
def get_chat_history(agent, n_history_messages):
    return list(ChatHistory.objects.filter(agent=agent).order_by('-timestamp')[:n_history_messages])

@sync_to_async
def save_messages(agent, user_message, ai_message):
    ChatHistory.objects.create(agent=agent, message=user_message, role="human")
    ChatHistory.objects.create(agent=agent, message=ai_message, role="ai")
    logger.info(f"Saved messages for agent {agent.agent_name}: User: {user_message}, AI: {ai_message}")

async def run_client(query: str, agent: AgentConfig):
    start_time = time.time()
    duration_ms = 0

    agent_id = agent.id
    agent_name = agent.agent_name
    mcp_servers = agent.mcp_server or {}
    llm_config = agent.llm

    agent_config = {
        "provider": llm_config.provider,
        "model": llm_config.model,
        "api_key": llm_config.api_key,
        "max_tokens": llm_config.max_tokens,
        "temperature": llm_config.temperature,
        "timeout": llm_config.timeout,
        "max_retries": llm_config.max_retries,
        "system_message": agent.system_message,
        "n_history_messages": agent.n_history_messages,
    }

    await log_activity_async(
        agent=agent,
        action=ActivityEvents.CHAT_STARTED,
        description="Chat started with agent",
        metadata={"query": query}
    )

    try:
        llm = get_llm_from_config(agent_config)
        tools = await get_tools(mcp_servers)

        try:
            history = await get_chat_history(agent, n_history_messages=agent_config.get("n_history_messages", 4))
            chat_history = [(msg.role, msg.message) for msg in history] if history else []
            logger.info(f"[{agent_name}] Retrieved chat history: {chat_history}")
        except Exception as e:
            logger.exception(f"[{agent_name}] Error retrieving chat history")
            chat_history = []

        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=agent_config.get("system_message", DEFAULT_TEMPLATE)),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad", optional=True),
        ])

        agent_instance = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)
        executor = AgentExecutor(agent=agent_instance, tools=tools, verbose=True, handle_parsing_errors=True, return_intermediate_steps=False)

        logger.info(f"[{agent_name}] Executing agent query: {query}")
        result = await executor.ainvoke({"input": query, "chat_history": chat_history})

        await save_messages(agent, query, result["output"])

        return result

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        error_msg = str(e)

        logger.exception(f"[{agent_name}] Error during agent execution")

        await log_activity_async(
            agent=agent,
            action=ActivityEvents.ERROR_OCCURRED,
            description="An error occurred during agent execution",
            metadata={"error": error_msg, "duration_ms": duration_ms}
        )
        update_metrics(agent, success=False, response_time_ms=duration_ms)

        return {"error": error_msg}

def agent_executor(query, agent):
    try:
        return asyncio.run(run_client(query, agent))
    except RuntimeError as e:
        if "event loop is closed" in str(e) or "cannot be called from a running event loop" in str(e):
            import nest_asyncio
            nest_asyncio.apply()
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(run_client(query, agent))
        logger.exception("Runtime error in agent_executor")
        return {"error": str(e)}
    except Exception as e:
        logger.exception("Unexpected error in agent_executor")
        return {"error": str(e)}