# ADR-003: Goal-First Flow for Chat Onboarding

**Date**: 2026-01-12
**Status**: Accepted

## Context

The original chat flow required users to:

1. Discover credentials (what tools are connected)
2. Fill 3-step questionnaire (goal, trigger, tools)
3. Start chat

This was problematic because:

- Users often don't know what tools they need upfront
- The questionnaire felt like friction before value
- Tool selection required guessing without context

User feedback: "Sometimes I don't know what I want, then I create tools afterwards"

## Decision

Implement a **goal-first flow** where:

1. User enters goal immediately (single field)
2. AI researches and suggests 3-5 tools with reasons
3. User selects tools from AI recommendations
4. Credential check shows gaps (not blockers)
5. Chat generates workflow

## Consequences

### Positive

- Lower friction to start (one field vs three steps)
- AI-guided tool discovery (smarter recommendations)
- User sees value faster (tool suggestions feel like assistance)
- Credential issues shown as warnings, not blockers

### Negative

- Extra API call for research phase (~1-2s latency)
- More complex state machine (5 phases vs 3)
- Research prompt may fail (need fallback)

### Trade-offs

- Chose card-based selector over Tinder-style swipe (simpler MVP)
- Deferred favorites system to v2
- Credential check allows "continue anyway" (user can fix later)
