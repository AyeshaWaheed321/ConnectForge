# 🧠 ConnectForge

A powerful hub for interacting with tools and services through a conversational **LLM interface**, seamlessly integrated with the **Model Context Protocol (MCP)** ecosystem.  
ConnectForge enables you to chat naturally while executing tasks via connected MCP servers—such as GitHub automation, math computations, file operations, web search, and more—through a modular and extensible **multi-agent architecture**.

### 🔧 Environment Setup (Backend)

To get started, first **clone the repository**:

Before running the backend, make sure to configure your environment variables in a `.env` file inside the `backend` folder. Refer to the `.env-example` file for the correct structure. You **must** provide the following values:

- `DATABASE_URL`: This should point to the PostgreSQL database using the credentials defined in your Docker setup. Example:

```bash
  DATABASE_URL=postgres://<user>:<password>@database:5432/<db-name>
```

- `OPENAI_API_KEY`: Your OpenAI API key.

- `GROQ_API_KEY`: Your Groq API key.

Ensure all these variables are properly set before starting the backend services.

### 🚀 Running the Project with Docker

This project includes both backend and frontend services, and you can run them together using Docker. Follow these steps:

1. **Navigate to the project root directory**.

2. **Bring down any running Docker containers**:

   ```bash
   docker compose down
   ```

3. **Build the Docker images**:

   ```bash
   docker compose build
   ```

4. **Start the containers**:

   ```bash
   docker compose up
   ```

Once the containers are up, you can access the project on your local machine by going to: `backend`
This will run both the backend and frontend services on localhost using the Docker setup.

## 🚀 Key Features

- **Agent Registration**: Easily register agents using a configurable JSON structure compatible with Claude Desktop or any external MCP server.

- **Multi-Agent Support**: Combine multiple MCP server configurations to extend functionality or run multiple agents concurrently.

- **Dashboard Monitoring**: Track agent interactions and system performance via a dedicated UI.

- **Chat History**: View historical conversations (single-agent only).

- **Extendable Tools**: Add custom external tools by updating the `mcpServers` configuration block.

- **Tool Chaining Support**: Supported in the MCP Chat Client.

## 🛠 Tech Stack

| Layer                 | Technology                 |
| --------------------- | -------------------------- |
| **Frontend**          | React                      |
| **Backend API**       | Django REST Framework      |
| **Agent Core**        | Python (`mcp-use` library) |
| **LLM Orchestration** | LangChain                  |

# 🧩 Agent Configuration

The agent is configured using a JSON block similar to the example below.  
You can also view the full configuration example in [`sample_config.txt`](./sample_config.txt) in the project root with detailed description of each key.

```json
{
  "agentConfig": {
    "agent_name": "GitHub AI Assistant",
    "description": "An AI-powered assistant that can perform GitHub actions, math calculations, and access local files.",
    "tags": ["code", "productivity"],
    "llm": {
      "provider": "groq",
      "model": "llama-3.1-8b-instant",
      "max_tokens": 1000,
      "temperature": 0,
      "timeout": 10,
      "max_retries": 2,
      "n_history_messages": 4
    },
    "prompt": {
      "system_message": "You are a helpful assistant with access to tools..."
    }
  },
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    },
    "web-search": {
      "url": "https://example.com/api",
      "headers": {
        "Authorization": "Bearer my_api_key"
      },
      "auth_token": "my_api_key"
    },
    "realtime-agent": {
      "ws_url": "wss://agent.example.com/ws",
      "headers": {
        "x-agent-id": "agent123"
      },
      "auth_token": "my_ws_token"
    }
  }
}
```

## 🌐 MCP Server Types Supported

- **Stdio Connectors**: Run via tools like `npx`, `uv`, or `python3`.

- **HTTP Connectors**: Integrate REST APIs by specifying base URLs and authorization headers.

- **WebSocket Connectors**: Enable real-time tool interactions using `ws_url`.

## ➕ Adding New Tools

To add or extend tools:

- Update the `mcpServers` section in your agent config.
- Ensure the tool is compatible with the MCP protocol (Stdio, HTTP, or WebSocket).
- Provide necessary environment variables and authentication tokens.

## ⚠️ Limitations

- ❌ Multi-agent chat history is not yet supported.
- ⚠️ Free-tier LLMs may sometimes result in failed responses.
- 🔄 System prompt tuning may be necessary for consistent results.
- 🧪 Toolchain compatibility has not been verified with all open-source MCP servers.
- ✅ Currently supports `npx`, `uv`, and `python`-based MCP tool connectors.

## 📖 Resources

- [Model Context Protocol (MCP) Servers](https://github.com/modelcontextprotocol/servers)
- [mcp-use Python Library](https://github.com/mcp-use/mcp-use)
