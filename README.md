# 🧠 ConnectForge

A powerful hub for interacting with tools and services through a conversational **LLM interface**, seamlessly integrated with the **Model Context Protocol (MCP)** ecosystem.  
ConnectForge enables you to chat naturally while executing tasks via connected MCP servers—such as GitHub automation, math computations, file operations, web search, and more—through a modular and extensible **multi-agent architecture**.

### 🔧 Environment Setup (Backend)

To get started, first **clone the repository**:

Before running the backend, make sure to configure your environment variables in a `.env` file inside the `backend` folder. Refer to the `.env-example` file for the correct structure. You **must** provide the following values:

- `DATABASE_URL`: This should point to the PostgreSQL database using the credentials defined in your Docker setup. Example:

```bash
  DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

- `GROQ_API_KEY`: Your Groq API key to use LangChain Groq LLM provider (preferred)

- `OPENAI_API_KEY`: Your OpenAI API key to use LangChain OpenAI LLM Provider

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
    }
  }
}
```

## ✅ Getting Started: Working Examples

Here are tested and working examples of `mcpServers` configurations that you can regsiter via the UI directly when registering/editing the agents.
Click to expand each section and copy-paste directly into your configuration JSON.

### Github Agent

  <details> <summary> GitHub </summary>

```json
"mcpServers": {
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
    }
  },
  "github-summarizer": {
    "command": "python",
    "args": ["/absolute/path/to/backend/app/mcp/servers/github.py"]
  }
}
```

> Make sure to replace provide your `GITHUB_PERSONAL_ACCESS_TOKEN`

  </details>

### Github-Extended Agent

  <details> <summary> GitHub Extended </summary>
  We have implemented a custom PR summarizer in our backend code which can be used to extend the tools of GitHub mcp server above by simply extending the mcpServers dictionary in UI when adding/editing the agent config as explained below:

```json
"mcpServers": {
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
    }
  },
  "github-summarizer": {
    "command": "python",
    "args": ["{REPO_BASE_PATH}/backend/app/mcp/servers/github.py"]
  }
}
```

> Note: Make sure to replace the `REPO_BASE_PATH` in "args" to enable it

  </details>

### PostgreSQL Agent

  <details> <summary> PostgreSQL</summary>

```json
"mcpServers": {
  "postgres": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-postgres",
      "postgresql://localhost/mydb"
    ]
  }
}

```

> Make sure the database connection string points to a valid running PostgreSQL instance.

  </details>

### Sequential Thinking Agent

  <details> <summary>Sequential Thinking</summary>

```json

"mcpServers": {
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  }
}

```

  </details>

### Filesystem Agent

  <details> <summary>Filesystem</summary>

```json
"mcpServers": {
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/username/Desktop",
      "/path/to/other/allowed/dir"
    ]
  }
}

```

> Make sure to replace `/Users/username/Desktop`, `/path/to/other/allowed/dir` with actual paths. Otherwise, it won't regsiter the tool successfully

  </details>

For more such examples, you can test available servers at: [Model Context Protocol (MCP) Servers]https://github.com/modelcontextprotocol/servers
However, do note that not all would work as expected.

# 🚀 Key Features

- **Agent Registration**: Easily register agents using a configurable JSON structure compatible with Claude Desktop or any external MCP server.

- **Multi-Agent Support**: Combine multiple MCP server configurations to extend functionality or run multiple agents concurrently.

- **Dashboard Monitoring**: Track agent interactions and system performance via a dedicated UI.

- **Chat History**: View historical conversations (single-agent only).

- **Extendable Tools**: Add custom external tools by updating the `mcpServers` configuration block.

- **Tool Chaining Support**: Supported in the MCP Chat Client.

# 🛠 Tech Stack

| Layer                 | Technology                 |
| --------------------- | -------------------------- |
| **Frontend**          | React                      |
| **Backend API**       | Django REST Framework      |
| **Agent Core**        | Python (`mcp-use` library) |
| **LLM Orchestration** | LangChain                  |

# 🌐 MCP Server Types Supported

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
- ✅ Currently supports `npx`, `uv`, `python`-based MCP tool connectors.

## 📖 Resources

- [Model Context Protocol (MCP) Servers](https://github.com/modelcontextprotocol/servers)
- [mcp-use Python Library](https://github.com/mcp-use/mcp-use)
