import asyncio
import logging
from django.conf import settings
from langchain.agents import  AgentExecutor, create_tool_calling_agent
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage

from .utils import get_tools


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
#         "args": ["E:/AgentDoc/backend/agents/mcp_servers/calculator.py"],
#     },
#     "filesystem": {
#       "command": "npx",
#       "args": [
#         "-y",
#         "@modelcontextprotocol/server-filesystem",
#         "E:/AgentDoc/backend/agents",
#       ]
#     }
#   }
# }

def get_llm_from_config(agent_config: dict):
    """
    Returns an initialized LLM instance based on the agent configuration and provider.
    Fetches API keys from Django settings.
    """
    provider = agent_config.get("provider", "groq").lower()

    # Get API key from settings
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

    # Build kwargs with defaults
    llm_kwargs = {
        "model": agent_config.get("model", "llama-3.1-8b-instant" if provider == "groq" else "gpt-3.5-turbo"),
        "api_key": api_key,
        "max_tokens": agent_config.get("max_tokens", 500),
        "temperature": agent_config.get("temperature", 0.0),
        "timeout": agent_config.get("timeout", 10),
        "max_retries": agent_config.get("max_retries", 2),
    }

    return llm_class(**llm_kwargs)

async def run_client(query: str, mcp_servers: dict, agent_config: dict):

    llm = get_llm_from_config(agent_config)

    tools = await get_tools(mcp_servers)

    template = """You are a helpful assistant with access to tools.
                Use tools when needed. After getting the required result from a tool,
                Return the final answer to the user and end your response. Do not call the tool again
                If you are unsure about the answer, ask the user for clarification.
                Make sure the answer is related to the question and formatted correctly."""
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(
            content=agent_config.get(
                "system_message",
                template
            )
        ),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(
            variable_name="agent_scratchpad",
            n_messages=agent_config.get("n_messages", 5),
            optional=True
        ),
    ])

    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)

    logger.info(f"Agent created successfully: {agent}")

    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        return_intermediate_steps=False
    )

    result = await executor.ainvoke({"input": query})

    logger.info(f"Agent result: {result}")
    
    return result

def agent_executor(query: str, mcp_servers: dict, agent_config: dict):
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
