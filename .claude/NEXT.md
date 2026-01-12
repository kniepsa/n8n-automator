# Next Actions

## Now

- [ ] **F-010: Visual Workflow Preview (YSIYG)** - React Flow preview before deploy
  - Users SEE the workflow visually (not JSON)
  - Node graph with icons, connections, branch labels
  - Sleek n8n-style aesthetic
  - "Trust what you see" before deploying
  - See: `.claude/features/F-010-visual-workflow-preview.md`

## Up Next

- [ ] **N8n Nerd Process** - Internal quality system (invisible to users)
  - 7-step systematic generation: Intent → Decompose → Node Select → Error Armor → Layout → Validate → Output
  - Produces production-ready workflows, not prototypes
  - Users see simple explanations, Claude does the heavy lifting
  - See: `.claude/decisions/004-n8n-nerd-process.md`
- [ ] Conversation history (F-006) - Save/resume chat sessions
- [ ] Iterate with feedback ("add X", "remove Y" updates workflow)
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
