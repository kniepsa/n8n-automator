# ADR-001: Tech Stack Selection

## Status

Accepted

## Context

We need to build a chat-to-workflow application that allows non-technical users to create n8n workflows through natural language. The application needs:

- Real-time streaming chat interface
- Integration with Claude AI
- Connection to user's n8n instances via MCP
- User authentication and data persistence
- Fast deployment and iteration

## Decision

We will use the following tech stack:

| Layer               | Technology              | Reason                                 |
| ------------------- | ----------------------- | -------------------------------------- |
| **Framework**       | Next.js 14 (App Router) | Best DX, SSR, API routes               |
| **AI SDK**          | Vercel AI SDK           | First-class Next.js support, streaming |
| **LLM**             | Claude (Anthropic)      | Best for tool use, MCP native          |
| **Database**        | Supabase (PostgreSQL)   | Auth + DB + RLS in one                 |
| **Auth**            | Supabase Auth           | Integrated, OAuth ready                |
| **UI**              | shadcn/ui + Tailwind    | Flexible, accessible                   |
| **Deploy**          | Vercel                  | Zero-config Next.js hosting            |
| **Package Manager** | pnpm                    | Fast, disk efficient                   |

## Consequences

### Positive

- **Developer velocity**: Familiar stack, extensive documentation
- **Type safety**: Full TypeScript throughout
- **Security**: Supabase RLS provides row-level security out of the box
- **Streaming**: Vercel AI SDK handles streaming complexity
- **Cost effective**: Generous free tiers for MVP

### Negative

- **Vendor coupling**: Tied to Vercel/Supabase ecosystem
- **Cold starts**: Serverless functions have cold start latency
- **MCP complexity**: n8n MCP server adds deployment complexity

### Neutral

- Learning curve for team members unfamiliar with App Router
- Supabase requires separate project setup

## Alternatives Considered

### Option A: Dify

Open-source LLMOps platform with built-in chat UI.

**Pros:**

- Faster initial setup (2-4 weeks)
- Built-in multi-tenancy
- 120K GitHub stars

**Cons:**

- Python backend (different from our stack)
- Less control over UX
- Enterprise license for white-label

### Option B: Flowise

Node.js visual LLM flow builder.

**Pros:**

- Node.js (familiar)
- Visual flow building
- MCP support

**Cons:**

- No multi-tenancy
- Limited customization
- Docker deployment complexity

### Option C: Custom Express + React

Build from scratch with Express backend.

**Pros:**

- Maximum flexibility
- No framework constraints

**Cons:**

- Longer development time (8-16 weeks)
- Must build streaming, auth, etc. manually
- More maintenance burden

## References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [n8n MCP Server](https://github.com/leosepulveda/mcp-n8n)
