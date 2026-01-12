# Next Actions

## Now

- [ ] Iterate with feedback ("add X", "remove Y" updates workflow)

## Up Next

- [ ] Favorites system (localStorage) for tool preferences

## Backlog

- [ ] Verify MCP list_credentials tool works (currently returns error)
- [ ] Google OAuth configuration (Supabase Dashboard + Google Cloud Console)
- [ ] Swipe gestures for tool selector (v2)
- [ ] Supabase sync for favorites (v2)
- [ ] Live MCP Access - Context7/Serper (F-009) - Potential paid feature
- [ ] Custom template builder for power users
- [ ] Template marketplace (user submissions)

## Done (2026-01)

- [x] **Conversation History (F-006)** - Persistent chat sessions with sidebar
  - Supabase tables: `conversations`, `messages` with RLS
  - Auto-save with 500ms debounce after streaming
  - Collapsible sidebar with conversation list
  - Resume existing conversations at `/chat/[id]`
  - Auto-generated titles from first user message
- [x] **N8n Nerd Process (ADR-004)** - Inject Steps 1-4 into system prompt (first principles: only semantic guidance, trust existing code for layout/validation)
- [x] **F-010: Visual Workflow Preview (YSIYG)** - React Flow visual preview (9/9 criteria)
  - React Flow node graph with dagre auto-layout
  - N8n-style nodes with category colors (trigger/action/logic/transform)
  - Plain English summary ("What this does" section)
  - Validation warnings and credential requirements
  - Zoom/pan controls, minimap for complex flows
  - See: `.claude/features/F-010-visual-workflow-preview.md`
- [x] **Goal-First Flow (MLP v2)** - Complete redesign of chat onboarding:
  - Goal Input component (`goal-input.tsx`) - single-field entry with examples
  - Research API (`/api/chat/research`) - Claude suggests 3-5 tools with reasons
  - Tool Selector (`tool-selector.tsx`) - card-based UI with importance badges
  - Credential Gap Check (`credential-gap-check.tsx`) - shows connected vs missing
  - Research Prompt (`prompts.ts`) - tool discovery system prompt + JSON parsing
  - 5-phase flow: goal → research → tools → credentials → chat
- [x] **Credential Onboarding (10-star)** - Full credential discovery before chat:
  - Credential discovery API (`/api/n8n/credentials`)
  - Pre-chat UI showing connected tools (Slack ✓, Sheets ✓)
  - Questionnaire pre-filters tools by available credentials
  - Claude constrained to only suggest workflows using connected tools
  - No "credentials not found" errors after deploy
- [x] **Chat Experience 10x Fix** - Propose-first strategy:
  - Claude outputs JSON for preview (doesn't auto-deploy)
  - User approves before deploy
  - Post-deploy links to n8n instance
  - Trigger-specific test instructions
- [x] **Chat Experience MLP** - Strategic pivot from templates to chat-first:
  - Context questionnaire (goal, trigger, tools) before chat
  - Enhanced prompts (5-7 node limit, tool constraints, phased complexity)
  - Workflow visual preview card in chat (not just JSON)
  - 1-click deploy from chat interface
  - Workflow JSON validator
- [x] **Tier 1 Templates** - 3 simple "First Win" templates (Webhook→Slack, Form→Airtable, Sheets Summary)
- [x] **Tier 2 Templates** - 3 sophisticated templates (Lead Scoring, Health Monitor, Content Pipeline)
- [x] **F-005 n8n Connection** - Settings page with URL/API key, test connection, AES-256 encryption
- [x] **F-004 Authentication** - Supabase Auth with email/password, Google OAuth, protected routes
- [x] **Vercel Deploy** - Production at https://n8n-automator.vercel.app
- [x] **Template MVP** - 3 sophisticated templates, wizard UI, visual preview, one-click deploy
- [x] **F-003 Workflow Generation** - Fast/Thorough modes, pre-baked node examples
- [x] **F-002 n8n MCP Integration** - Claude can list/create/update workflows via MCP
- [x] **F-001 Chat Interface** - Streaming chat with Claude AI (7/7 criteria)
