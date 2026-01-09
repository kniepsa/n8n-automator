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
- Vercel AI SDK useChat() requires 'ai' package not '@ai-sdk/react'
- n8n Native AI Builder is Cloud-only - NOT available for self-hosted n8n
- create-next-app conflicts with existing files - backup/restore needed
- Claude + MCP produces better workflows than n8n Native (1-2 vs 4-5 iterations)
- shadcn init with Tailwind v4 requires manual npm install (pnpm not found on some systems)
- n8n Chrome extensions fragmented market: n8n Master (5K users), Vibe n8n (2K), AgentCraft (737)

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
