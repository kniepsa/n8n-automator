# Architecture Overview

## Strategic Direction

**Chat-first approach**: The core differentiator is that non-technical users can describe what they want and get a working custom workflow. Templates are a quick-win path, but chat-to-deploy is the main feature.

## The Graph (Goal-First Flow)

```
                         ┌─────────────────┐
                         │   /templates    │  (quick wins)
                         │   Template Grid │
                         └────────┬────────┘
                                  │
[User] ─┬─> [Goal Input] ──> [AI Research] ──> [Tool Selector] ──> [Credential Check] ──> [Chat UI]
        │   "What to      (/api/chat/research)  (card-based)    (/api/n8n/credentials)      ↓
        │    automate?"        ↓                    ↓                    ↓             [Workflow Card]
        │                 [3-5 tools +        [User selects]      [Shows gaps]              ↓
        │                  reasons]            essential tools    [Continue anyway]     [Deploy]
        │                                                                                   ↓
        └─> [Template Wizard] ──> [/api/templates/deploy] ─────────────────────────> [n8n Instance]
```

## Key Services

### Goal-First Flow (New)

- **Goal Input** (`chat/goal-input.tsx`): Single-field goal entry with examples
- **Research API** (`/api/chat/research`): Claude analyzes goal, suggests 3-5 tools with reasons
- **Tool Selector** (`chat/tool-selector.tsx`): Card-based selection with importance badges
- **Credential Gap Check** (`chat/credential-gap-check.tsx`): Shows connected vs missing tools
- **Research Prompt** (`lib/n8n/prompts.ts`): Tool discovery system prompt + JSON parsing

### Core Services

- **Chat Interface** (`/chat`): 5-phase flow: goal → research → tools → credentials → chat
- **Workflow Card** (`chat/workflow-card.tsx`): Visual preview + 1-click deploy in chat
- **Chat API** (`/api/chat`): Claude with n8n MCP tools, context injection, quality mode
- **Credentials API** (`/api/n8n/credentials`): Lists credentials from n8n via MCP
- **Workflow Validator** (`lib/n8n/validator.ts`): Validates workflow JSON with node-level warnings
- **n8n MCP Client** (`lib/n8n/mcp-client.ts`): Manages MCP connection to n8n-builder
- **Prompts** (`lib/n8n/prompts.ts`): System prompts with constraints + context injection

### Conversation History (F-006)

- **Conversations API** (`/api/conversations`): List, create, update, delete conversations
- **Messages API** (`/api/conversations/[id]/messages`): Batch message persistence
- **Conversation Sidebar** (`components/layout/conversation-sidebar.tsx`): Collapsible list with delete
- **Auto-Save Hook** (`lib/conversations/use-auto-save.ts`): Debounced (500ms) message persistence
- **Chat Layout** (`app/chat/layout.tsx`): Flex layout with sidebar + main content
- **Conversation Types** (`lib/conversations/types.ts`): ChatPhase, Conversation, StoredMessage

### Visual Preview (F-010)

- **WorkflowPreview** (`workflow-preview/WorkflowPreview.tsx`): React Flow container with zoom/pan/minimap
- **N8nNode** (`workflow-preview/N8nNode.tsx`): Custom node with category colors and icons
- **N8nEdge** (`workflow-preview/N8nEdge.tsx`): Bezier curve edges with conditional styling
- **WorkflowSummary** (`workflow-preview/WorkflowSummary.tsx`): Plain English step descriptions
- **ValidationWarnings** (`workflow-preview/ValidationWarnings.tsx`): Warning/error badges
- **convert-to-reactflow** (`lib/workflow/convert-to-reactflow.ts`): N8n JSON → React Flow format
- **auto-layout** (`lib/workflow/auto-layout.ts`): Dagre-based left-to-right layout
- **node-icons** (`lib/workflow/node-icons.ts`): Icon and category color mappings
- **summarize** (`lib/workflow/summarize.ts`): BFS traversal for plain English descriptions

### Templates (Quick Wins)

- **Template System** (`/templates`): Browse + wizard for quick wins
- **Template Wizard** (`/templates/[id]`): Step-by-step configuration, visual preview
- **Deploy API** (`/api/templates/deploy`): Direct MCP workflow creation

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

### Goal-First Chat Flow (Main Path)

1. **Goal Input**: User describes what they want to automate
2. **AI Research**: `/api/chat/research` → Claude suggests 3-5 tools with reasons
3. **Tool Selection**: User picks from recommended tools (card UI)
4. **Credential Check**: Show connected vs missing credentials
5. **Chat**: Goal auto-sent, Claude generates workflow with selected tools
6. **WorkflowCard**: Visual preview rendered from JSON
7. **Deploy**: One-click → `/api/templates/deploy`
8. **n8n**: MCP creates workflow in user's instance

### Template Flow (Quick Wins)

1. User browses templates by category (marketing, ops, sales)
2. Selects template → wizard opens
3. Steps through configuration fields
4. Visual preview shows workflow diagram
5. Deploy button → /api/templates/deploy
6. MCP creates workflow in n8n instance

## Templates

### Tier 1: "First Win" (Simple)

| Template              | Category | Nodes                 |
| --------------------- | -------- | --------------------- |
| Webhook → Slack Alert | Ops      | Webhook → Slack       |
| Form to Airtable      | Sales    | Webhook → Airtable    |
| Daily Sheets Summary  | Ops      | Cron → Sheets → Slack |

### Tier 2+: Sophisticated

| Template                | Category  | Nodes                        |
| ----------------------- | --------- | ---------------------------- |
| Lead Scoring & Routing  | Sales     | Webhook → Score → IF → Slack |
| Customer Health Monitor | Ops       | Cron → HTTP → IF → Slack     |
| Content Distribution    | Marketing | RSS → OpenAI → Slack         |

## Quality Modes

| Mode     | Tokens | Content                                                |
| -------- | ------ | ------------------------------------------------------ |
| Fast     | ~580   | Base prompt + N8n Nerd Process (condensed, ~80 tokens) |
| Thorough | ~2200  | + N8n Nerd Process (full, ~200 tokens) + Node examples |

### N8n Nerd Process (ADR-004)

Injected into system prompt - Steps 1-4 only (semantic guidance):

1. **Intent**: Parse trigger type, inputs, outputs
2. **Decompose**: [TRIGGER] → [TRANSFORM?] → [CONDITION?] → [ACTION] → [OUTPUT?]
3. **Node Select**: Native > HTTP Request > Code
4. **Error Armor**: Complexity-based (2-3 nodes: none, 4-5: error output, 6+: try/catch)

Steps 5-7 handled by existing code:

- **Layout**: `auto-layout.ts` (dagre)
- **Validate**: `validator.ts`
- **Output**: Existing prompt format

## Target User

**Non-technical person using SELF-HOSTED n8n** - the only segment without an AI workflow builder option (n8n native AI is cloud-only).

## Future Direction: n8n Concierge (Option A)

<!--
STRATEGIC NOTE (2026-01-12 Joe Gebbia Critique):

Current approach challenges:
- "Non-technical + self-hosted" is a small intersection (~5-10K users)
- Claude Desktop + n8n MCP gives same core value for free
- 8 steps before value (sign up → connect → goal → tools → creds → chat → preview → deploy)
- No retention hook (one-time tool, not habit-forming)

Future pivot opportunity - "n8n Concierge for teams without DevOps":
1. Done-for-you n8n hosting (Railway one-click)
2. Credential setup wizard (OAuth hand-holding)
3. Pre-built workflow library (not templates, working workflows)
4. Monitoring dashboard (failure alerts)
5. Managed upgrades (n8n version updates)

USP: "n8n without the DevOps. We host, configure, and maintain. You just automate."
Pricing: $49/mo (vs n8n Cloud $24/mo for convenience)

This creates:
- Real recurring value (hosting + maintenance)
- Defensible moat (operational expertise, not just AI)
- Truly non-technical users (because WE handle technical parts)

For now: Ship current chat-first approach, validate with users, then consider pivot.
-->

_Last updated: 2026-01-12 (F-006 Conversation History verified)_
