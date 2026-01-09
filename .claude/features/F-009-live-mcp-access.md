# F-009: Live MCP Access (Context7/Serper)

## Overview

Enable real-time MCP server access for Claude to query live documentation and search results when generating workflows.

## Priority

P2 - Nice to Have (Potential Paid Feature)

## User Story

As a user, I want Claude to have access to live documentation so it can generate more accurate workflows for uncommon or recently updated integrations.

## Acceptance Criteria

- [ ] Claude can query Context7 for n8n node documentation
- [ ] Claude can use Serper for web search (edge cases, community solutions)
- [ ] Mode selector: Fast / Thorough / Live
- [ ] Live mode clearly indicates it uses external services
- [ ] Graceful fallback if MCP services unavailable

## Technical Implementation

### MCP Servers to Integrate

| Server       | Purpose               | Use Case                                         |
| ------------ | --------------------- | ------------------------------------------------ |
| **Context7** | Library documentation | n8n node parameters, JSON structure              |
| **Serper**   | Web search            | Community solutions, edge cases, troubleshooting |

### Architecture Options

**Option A: Server-side MCP Client**

- Next.js API route spawns MCP client
- Queries Context7/Serper before calling Claude
- Prepends documentation to system prompt
- Pros: Simple, no tool changes
- Cons: Slower, additional latency

**Option B: Claude Tool Access**

- Add `query_docs` and `web_search` as tools alongside n8n tools
- Claude decides when to look up documentation
- Pros: More intelligent usage, Claude-driven
- Cons: More complex, requires MCP-over-HTTP or proxy

### Recommended: Option A (Server-side)

```typescript
// In thorough-live mode:
const nodeDocs = await queryContext7(userIntent);
const systemPrompt = getSystemPrompt('thorough') + `\n\n## Live Documentation\n${nodeDocs}`;
```

### Quality Modes (Updated)

| Mode         | System Prompt    | External Calls  | Target    |
| ------------ | ---------------- | --------------- | --------- |
| **Fast**     | ~500 tokens      | None            | Free tier |
| **Thorough** | ~2000 tokens     | None            | Free tier |
| **Live**     | ~500 + live docs | Context7/Serper | Paid tier |

## Files to Create/Modify

- `src/lib/mcp/context7-client.ts` - CREATE
- `src/lib/mcp/serper-client.ts` - CREATE
- `src/app/api/chat/route.ts` - MODIFY (add live mode)
- `src/components/chat/chat-interface.tsx` - MODIFY (add Live option)

## Monetization Consideration

Live mode incurs:

- MCP server hosting/calls
- Additional latency
- Higher Claude token usage

Potential pricing:

- Free: Fast + Thorough modes
- Pro: Live mode access

## Dependencies

- F-003: Workflow Generation (base prompts)
- F-004: Authentication (user tier check)
- MCP server hosting solution

## Research Notes

### Context7 Library IDs

- `/n8n-io/n8n-docs` - 811 snippets, benchmark 74.6
- `/n8n-io/n8n` - 1241 snippets, benchmark 68.2
- `/llmstxt/n8n_io_llms-full_txt` - 45,694 snippets (comprehensive)

### Serper Use Cases

- "n8n [node] configuration parameters"
- "n8n [integration] authentication setup"
- "n8n error [message] solution"
- "n8n [use-case] workflow best practices"
