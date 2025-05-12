import os
from mcp.server.fastmcp import FastMCP
import requests

mcp = FastMCP("github")

GITHUB_API_BASE = "https://api.github.com/repos"
GITHUB_TOKEN = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN")
if not GITHUB_TOKEN:
    raise EnvironmentError("❌ GITHUB_PERSONAL_ACCESS_TOKEN not set in environment.")

HEADERS = {"Authorization": f"Bearer {GITHUB_TOKEN}"}

def parse_repo_url(repo_url: str):
    parts = repo_url.rstrip("/").split("/")
    if len(parts) < 5:
        return None, None
    return parts[-2], parts[-1]


def handle_api_response(response):
    if response.status_code != 200:
        return None, f"❌ Error {response.status_code}: {response.text}"
    try:
        return response.json(), None
    except Exception as e:
        return None, f"❌ Failed to parse response: {str(e)}"


@mcp.tool()
def get_commit_history(repo_url: str) -> str:
    """Get commit history from GitHub."""
    owner, repo = parse_repo_url(repo_url)
    if not owner:
        return "Invalid GitHub repo URL format."

    url = f"{GITHUB_API_BASE}/{owner}/{repo}/commits"
    response = requests.get(url, headers=HEADERS)
    data, error = handle_api_response(response)
    if error:
        return error
    if not isinstance(data, list):
        return "Unexpected API response structure."

    formatted = [
        f"{c.get('sha', '')[:7]} by {c.get('commit', {}).get('author', {}).get('name', 'Unknown')}: "
        f"{c.get('commit', {}).get('message', 'No message')}"
        for c in data[:5]
    ]
    return "\n".join(formatted)


@mcp.tool()
def get_repo_details(repo_url: str) -> str:
    """Get repository details from GitHub."""
    owner, repo = parse_repo_url(repo_url)
    if not owner:
        return "Invalid GitHub repo URL format."

    url = f"{GITHUB_API_BASE}/{owner}/{repo}"
    response = requests.get(url, headers=HEADERS)
    data, error = handle_api_response(response)
    if error:
        return error

    return (
        f"📘 **{data.get('full_name', 'N/A')}**\n"
        f"📝 Description: {data.get('description', 'No description')}\n"
        f"⭐ Stars: {data.get('stargazers_count', 0)}\n"
        f"🍴 Forks: {data.get('forks_count', 0)}\n"
        f"🐛 Open Issues: {data.get('open_issues_count', 0)}\n"
        f"🕒 Last Updated: {data.get('updated_at', 'N/A')}\n"
        f"🔗 URL: {data.get('html_url', repo_url)}"
    )


@mcp.tool()
def summarize_pull_requests(repo_url: str) -> str:
    """Get open pull requests from GitHub and summarize them."""
    owner, repo = parse_repo_url(repo_url)
    if not owner:
        return "Invalid GitHub repo URL format."

    url = f"{GITHUB_API_BASE}/{owner}/{repo}/pulls"
    response = requests.get(url, headers=HEADERS, params={"state": "open"})
    data, error = handle_api_response(response)
    if error:
        return error
    if not data:
        return "No open pull requests found."

    summaries = [
        f"🔃 PR #{pr.get('number')} by {pr.get('user', {}).get('login', 'unknown')} on {pr.get('created_at', '')}:\n"
        f"➡️ {pr.get('title', 'No title')}\n🔗 {pr.get('html_url', '')}\n"
        for pr in data[:5]
    ]
    return "\n".join(summaries)


if __name__ == "__main__":
    mcp.run(transport="stdio")
