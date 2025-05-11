from mcp_use.client import MCPClient
from mcp_use.adapters.langchain_adapter import LangChainAdapter

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