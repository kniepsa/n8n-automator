# n8n-automator Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                  │
│  "Create a workflow that sends Slack when Stripe fails"     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     FRONTEND                                 │
│  Next.js 14 + useChat() + shadcn/ui                         │
│  • Streaming chat interface                                  │
│  • Workflow preview (JSON/visual)                           │
│  • Settings (n8n connection)                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ POST /api/chat
┌─────────────────────────▼───────────────────────────────────┐
│                     API LAYER                                │
│  /api/chat/route.ts                                         │
│  • Vercel AI SDK streamText()                               │
│  • Claude claude-sonnet-4-20250514                                    │
│  • n8n MCP tools injected                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   n8n MCP SERVER                             │
│  Tools available:                                           │
│  • list_workflows - Get user's existing workflows           │
│  • get_workflow - Get workflow details                      │
│  • create_workflow - Create new workflow JSON               │
│  • update_workflow - Modify existing workflow               │
│  • activate_workflow - Turn on a workflow                   │
│  • get_node_documentation - Get n8n node docs               │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  USER'S n8n INSTANCE                         │
│  • Self-hosted or n8n Cloud                                 │
│  • Connected via API key                                    │
│  • Workflows created/updated directly                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. User types natural language request in chat
2. Frontend sends message to /api/chat via useChat() hook
3. API route creates Claude stream with n8n MCP tools available
4. Claude interprets user intent, calls appropriate MCP tools
5. MCP tools interact with user's n8n instance via API
6. Response streams back to frontend in real-time
7. User sees workflow created/modified with preview

## Security Model

### Authentication

- **Supabase Auth**: JWT-based authentication
- **Session Validation**: All API routes verify Supabase session

### Data Isolation

- **RLS Policies**: All tables use Row Level Security
- **User Scoping**: All queries filtered by `auth.uid()`

### Credential Security

- **n8n API Keys**: Encrypted at rest using AES-256-GCM
- **Encryption Key**: `ENCRYPTION_SECRET` env var (256-bit)
- **Never Exposed**: Keys never sent to frontend (only `has_api_key` boolean)
- **Per-Request**: Keys decrypted only when calling n8n API

## Database Schema

### Tables

```sql
profiles (
  id uuid PRIMARY KEY,
  email text,
  n8n_url text,
  n8n_api_key text ENCRYPTED,
  created_at timestamptz
)

conversations (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  title text,
  created_at timestamptz,
  updated_at timestamptz
)

messages (
  id uuid PRIMARY KEY,
  conversation_id uuid REFERENCES conversations,
  role text, -- 'user' | 'assistant'
  content text,
  created_at timestamptz
)

workflows (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  conversation_id uuid REFERENCES conversations,
  name text,
  workflow_json jsonb,
  n8n_workflow_id text,
  deployed boolean,
  created_at timestamptz
)
```

## API Routes

| Route                 | Method     | Purpose                           |
| --------------------- | ---------- | --------------------------------- |
| `/api/chat`           | POST       | Main chat endpoint with streaming |
| `/api/workflows`      | GET        | List user's saved workflows       |
| `/api/workflows/[id]` | GET/DELETE | Get or delete specific workflow   |
| `/api/settings/n8n`   | GET/PUT    | Manage n8n connection             |

## Key Components

### Frontend

- `ChatInterface` - Main chat UI with useChat()
- `MessageList` - Renders conversation history
- `MessageInput` - User input with send button
- `WorkflowPreview` - Visual workflow display (React Flow) - F-010
- `SettingsPanel` - n8n connection configuration
- `GoalInput` - Single-field goal entry with examples
- `ToolSelector` - Card-based tool selection UI
- `CredentialGapCheck` - Shows connected vs missing tools

### Backend

- `n8n/mcp-client.ts` - MCP client for n8n tools
- `n8n/tools.ts` - Tool definitions for Claude
- `supabase/client.ts` - Browser Supabase client
- `supabase/server.ts` - Server Supabase client

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Technology Decisions

See `/decisions/` for rationale:

- ADR-001: Tech Stack (Next.js, Supabase, Vercel AI SDK, Claude)
- ADR-002: Quality Modes (Fast vs Thorough prompts)
- ADR-003: Goal-First Flow (5-phase onboarding)
- ADR-004: N8n Nerd Process (7-step workflow generation)

## Planned Components (F-010)

- `WorkflowPreview` - React Flow visual preview (@xyflow/react)
- `N8nNode` - Custom node component matching n8n aesthetic
- `N8nEdge` - Animated connection lines
- `WorkflowStats` - Node count, trigger type badge

_Last updated: 2026-01-12_
