# ADR-002: Quality Modes for Workflow Generation

## Status

Accepted

## Date

2026-01-09

## Context

When generating n8n workflows from natural language, Claude can produce varying quality results depending on how much context it has about n8n node parameters and JSON structure. We needed to decide how to provide this context.

Options considered:

1. **Runtime MCP access** - Call Context7/Serper during generation for live docs
2. **Pre-baked examples** - Embed node JSON examples directly in system prompt
3. **No enhancement** - Rely purely on Claude's training knowledge

## Decision

Implement **pre-baked examples** with a **quality mode selector**:

- **Fast mode**: Base prompt only (~500 tokens) - relies on Claude's training
- **Thorough mode**: Includes JSON examples for 9 common n8n nodes (~2000 tokens)

Runtime MCP access (Context7/Serper) deferred to F-009 as a potential paid feature.

## Rationale

- **Simplicity**: No runtime dependencies or additional latency
- **Cost-effective**: No extra API calls per request
- **Predictable**: Same examples every time, easy to test/debug
- **Ship faster**: Can implement immediately without MCP infrastructure

## Consequences

### Positive

- Zero additional latency for workflow generation
- No external service dependencies for core functionality
- Clear upgrade path (Fast → Thorough → Live in future)
- Easier to maintain and debug

### Negative

- Pre-baked examples may become outdated if n8n changes
- Limited to documented nodes (9 currently)
- Users with unusual integrations may need Live mode (future F-009)

## Related

- F-003: Workflow Generation
- F-009: Live MCP Access (future)
