from mcp_use.client import MCPClient
from mcp_use.adapters.langchain_adapter import LangChainAdapter
from .models import AgentActivityLog, AgentMetric
from django.utils.timezone import now
from asgiref.sync import sync_to_async

async def get_tools(mcp_servers):
    """
    Fetch tools from the specified MCP servers.
    Args:
        mcp_servers (dict): A dictionary of MCP server configurations.
    Returns:
        list: A list of tools created from the MCP servers.
    """
    client = MCPClient.from_dict({'mcpServers': mcp_servers})
    adapter = LangChainAdapter()
    return await adapter.create_tools(client)

def log_activity(agent, action, description="", metadata=None):
    AgentActivityLog.objects.create(
        agent=agent,
        action=action,
        description=description,
        metadata=metadata or {}
    )

def update_metrics(agent, success: bool, response_time_ms: int):
    today = now().date()

    metric, _ = AgentMetric.objects.get_or_create(agent=agent, date=today)
    metric.total_requests += 1
    if success:
        metric.total_success += 1
    else:
        metric.total_failures += 1
    metric.total_response_time_ms += response_time_ms
    metric.save()

@sync_to_async(thread_sensitive=False)
def log_activity_async(agent, action, description, metadata=None):
    log_activity(
        agent=agent,
        action=action,
        description=description,
        metadata=metadata
    )

@sync_to_async(thread_sensitive=False)
def update_metrics_async(agent, success: bool, response_time_ms: int):
    update_metrics(
        agent=agent,
        success=success,
        response_time_ms=response_time_ms
    )
