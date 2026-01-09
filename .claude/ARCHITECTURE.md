# Architecture Overview

## The Graph

```
[User] → [Chat UI] → [/api/chat] → [Claude + MCP Tools] → [n8n Instance]
                          ↓
                   [System Prompts]
                   (fast/thorough modes)
```

## Key Services

- **Chat Interface** (`/chat`): Streaming chat with mode selector (Fast/Thorough)
- **Chat API** (`/api/chat`): Claude with n8n MCP tools, quality mode support
- **n8n MCP Client** (`lib/n8n/mcp-client.ts`): Manages MCP connection to n8n-builder
- **Prompts** (`lib/n8n/prompts.ts`): System prompts with pre-baked node examples

## External Integrations

- **Claude API**: Via Vercel AI SDK (claude-sonnet-4-20250514)
- **n8n MCP Server**: mcp-n8n-builder via stdio transport
- **Supabase**: Database + Auth (planned)

## Data Flow

1. User types automation request in chat
2. Frontend sends to /api/chat with quality mode
3. Claude interprets intent using system prompt
4. Claude calls n8n MCP tools (create_workflow, etc.)
5. MCP client executes against user's n8n instance
6. Response streamed back to user

## Quality Modes

| Mode     | Tokens | Content                        |
| -------- | ------ | ------------------------------ |
| Fast     | ~500   | Base prompt only               |
| Thorough | ~2000  | + pre-baked node JSON examples |

_Last updated: 2026-01-09_
