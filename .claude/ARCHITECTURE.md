# Architecture Overview

## The Graph

```
                    ┌─────────────────┐
                    │   /templates    │  (non-technical users)
                    │   Template Grid │
                    └────────┬────────┘
                             │
[User] ──┬──> [Chat UI] ─────┼──> [/api/chat] ──> [Claude + MCP] ──> [n8n Instance]
         │    (developers)   │         ↓
         │                   │   [System Prompts]
         │                   │   (fast/thorough)
         │                   │
         └──> [Template      │
              Wizard] ───────┴──> [/api/templates/deploy] ──> [MCP create_workflow]
              (non-techies)
```

## Key Services

- **Chat Interface** (`/chat`): Streaming chat with mode selector (Fast/Thorough)
- **Chat API** (`/api/chat`): Claude with n8n MCP tools, quality mode support
- **Template System** (`/templates`): Browse + wizard for non-technical users
- **Template Wizard** (`/templates/[id]`): Step-by-step configuration, visual preview
- **Deploy API** (`/api/templates/deploy`): Direct MCP workflow creation from templates
- **n8n MCP Client** (`lib/n8n/mcp-client.ts`): Manages MCP connection to n8n-builder
- **Prompts** (`lib/n8n/prompts.ts`): System prompts with pre-baked node examples

## External Integrations

- **Claude API**: Via Vercel AI SDK (claude-sonnet-4-20250514)
- **n8n MCP Server**: mcp-n8n-builder via stdio transport
- **Supabase**: Database + Auth (PostgreSQL + RLS + @supabase/ssr)

## Authentication

- **Auth Middleware** (`src/middleware.ts`): Protects /chat, /templates/_, /api/_ routes
- **Supabase Clients**: Browser (`lib/supabase/client.ts`), Server (`server.ts`), Middleware (`middleware.ts`)
- **Auth Pages**: Login, Signup with email/password + Google OAuth
- **User Menu**: Avatar dropdown with logout in header
- **Profiles Table**: Auto-created on signup via trigger, RLS-protected

## Data Flow

### Chat Flow (Developers)

1. User types automation request in chat
2. Frontend sends to /api/chat with quality mode
3. Claude interprets intent using system prompt
4. Claude calls n8n MCP tools (create_workflow, etc.)
5. MCP client executes against user's n8n instance
6. Response streamed back to user

### Template Flow (Non-Techies)

1. User browses templates by category (marketing, ops, sales)
2. Selects template → wizard opens
3. Steps through configuration fields
4. Visual preview shows workflow diagram
5. Deploy button → /api/templates/deploy
6. MCP creates workflow in n8n instance

## Templates

| Template                | Category  | Complexity   | Nodes                        |
| ----------------------- | --------- | ------------ | ---------------------------- |
| Lead Scoring & Routing  | Marketing | Intermediate | Webhook → Score → IF → Slack |
| Customer Health Monitor | Ops       | Intermediate | Cron → HTTP → IF → Slack     |
| Content Distribution    | Marketing | Simple       | RSS → OpenAI → Slack         |

## Quality Modes

| Mode     | Tokens | Content                        |
| -------- | ------ | ------------------------------ |
| Fast     | ~500   | Base prompt only               |
| Thorough | ~2000  | + pre-baked node JSON examples |

_Last updated: 2026-01-11_
