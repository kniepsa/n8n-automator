# n8n-automator

> Chat-to-workflow builder for n8n. Type what you want, get a working automation.

## The Graph

User Chat → Next.js API → Claude + n8n MCP → User's n8n Instance → Workflow Created

## Invariants (NEVER Break)

- TypeScript strict mode always
- Auth check before any mutation
- RLS policies on all Supabase tables
- Server components for data fetching
- Never store n8n API keys in plain text
- Prices as cents (integer), never float

## Stack

- Frontend: Next.js 14+ (App Router), React, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL + RLS + Auth)
- AI: Claude API via Vercel AI SDK
- n8n: MCP Server integration
- Package manager: pnpm
- Deploy: Vercel

## Gotchas (Add as discovered)

- Supabase RLS requires .select() after .insert() to return data
- Next.js caches aggressively - use revalidatePath()
- n8n MCP server uses stdio transport - may need HTTP wrapper for cloud
- **AI SDK v6**: `useChat` from `@ai-sdk/react`, use `DefaultChatTransport({ api: '/api/chat' })`
- **AI SDK v6**: `Message` → `UIMessage` with `parts` array, use `convertToModelMessages()` in API route
- **AI SDK v6**: `toDataStreamResponse()` → `toUIMessageStreamResponse()` for streaming
- **AI SDK v6**: `sendMessage({ text: input })` instead of `handleSubmit(e)` pattern
- n8n Native AI Builder is Cloud-only - NOT available for self-hosted n8n
- create-next-app conflicts with existing files - backup/restore needed
- Claude + MCP produces better workflows than n8n Native (1-2 vs 4-5 iterations)
- shadcn init with Tailwind v4 requires manual npm install (pnpm not found on some systems)
- n8n Chrome extensions fragmented market: n8n Master (5K users), Vibe n8n (2K), AgentCraft (737)
- macOS without Homebrew: download gh CLI binary from GitHub releases, extract to ~/bin/
- ESLint flat config: add `ignores: ['.next/**', 'node_modules/**']` as first item to avoid linting build artifacts
- **MCP n8n-builder**: N8N_HOST must be base URL without `/api/v1` (e.g., `https://n8n.example.com`)
- **AI SDK v6 tools**: Use `inputSchema` not `parameters`, and `stopWhen: stepCountIs(5)` not `maxSteps`
- **AI SDK v6 transport**: Pass extra body params via `DefaultChatTransport({ api: '/api/chat', body: { mode } })`
- **Context7 MCP**: n8n docs at `/n8n-io/n8n-docs` (811 snippets, benchmark 74.6) - good for node JSON examples
- **executeMCPTool signature**: Requires client as first arg: `executeMCPTool(client, toolName, args)`, returns `MCPToolResult` with `data` not `content`
- **Template wizard**: Use `currentStepData &&` guard in JSX when accessing `template.steps[state.currentStep]` (possibly undefined)
- **Target users**: Non-technical (marketing & ops) → template wizard; Technical → chat interface
- **Next.js 16**: `middleware.ts` is deprecated, shows warning to use "proxy" instead (still works)
- **Supabase API Keys**: New dashboard shows publishable/secret keys; use "Legacy anon, service_role" link for traditional anon key
- **useSearchParams()**: Must wrap component using this hook in `<Suspense>` boundary or build fails
- **AES-256-GCM encryption**: Requires `ENCRYPTION_SECRET` env var (generate with `openssl rand -hex 32`)
- **Prompt strategy**: Use "propose-first, deploy later" - Claude outputs JSON for preview, only calls create_workflow after user approval
- **Credential wall**: Non-technical users hit "credentials not found" errors - must discover credentials BEFORE workflow generation
- **Target niche**: "Non-technical self-hosted n8n users" - only segment without AI workflow builder option (cloud-only)
- **Goal-first flow**: 5 phases (goal → research → tools → credentials → chat) - AI suggests tools before user picks them
- **Research prompt**: Must output strict JSON format; use `parseResearchResult()` to extract from markdown code blocks
- **YSIYG principle**: Users need to SEE workflows visually before deploy (React Flow), not JSON - reduces trust gap
- **React Flow v12**: Package is now `@xyflow/react` not `react-flow-renderer`
- **React Flow v12 types**: Data interfaces must `extend Record<string, unknown>`; use `Node<Data, 'type'>` not just `NodeProps<Data>`
- **React Flow v12 icons**: Can't dynamically import Lucide icons via `Icons[name]`; use explicit ICON_MAP constant
- **N8n Nerd Process**: 7-step internal quality system (see ADR-004) - invisible to users, produces production-ready workflows
- **Prompt injection first principles**: Only inject semantic guidance (Steps 1-4) into prompts; don't duplicate layout/validation rules that exist in code
- **Supabase strict mode**: `data` property is `any`; avoid destructuring `{ data }`, instead use `result.data as Type` to satisfy strict ESLint
- **AI SDK v6 messages**: Use `messages:` not `initialMessages:` option in `useChat()` hook for initial messages

## Commands

- dev: `pnpm dev`
- build: `pnpm build`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`

## API Error Handling

- ALWAYS return full validation error details in API responses (status 400)
- Validation errors are INPUT feedback, not security-sensitive
- DO log validation errors with console.error()

## Code Quality

- `strict: true` always in tsconfig
- NO `any` - use `unknown` + type guards
- Explicit return types on exported functions
- ESLint with @typescript-eslint strict rules
- Prettier for formatting

## Notion Integration

Teamspace: TBD
Rock ID: TBD
