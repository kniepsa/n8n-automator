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
