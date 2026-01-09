# F-003: Workflow Generation

## Overview

Natural language to n8n workflow JSON conversion using Claude with n8n MCP tools.

## Priority

P0 - MVP Required

## Status

**COMPLETED** - Implemented in F-002 + F-003

## User Story

As a user, I want to describe my automation needs in plain English and receive a working n8n workflow that I can deploy immediately.

## Acceptance Criteria

- [x] Parse natural language intent accurately (Claude via system prompt)
- [x] Generate valid n8n workflow JSON (MCP create_workflow tool)
- [x] Select appropriate n8n nodes for the task (thorough mode with node examples)
- [x] Wire connections between nodes correctly (transformConnections function)
- [x] Include error handling nodes where appropriate (prompts emphasize Error Trigger)
- [x] Support common integrations (Slack, Google Sheets, Stripe, etc.)
- [x] Explain what the workflow does in plain language (system prompt instruction)

## Implementation Details

### Files Created/Modified

- `src/lib/n8n/prompts.ts` - CREATED (system prompts with fast/thorough modes)
- `src/app/api/chat/route.ts` - MODIFIED (imports prompts, accepts mode param)
- `src/components/chat/chat-interface.tsx` - MODIFIED (mode selector UI)

### Quality Modes

| Mode         | Description                                          |
| ------------ | ---------------------------------------------------- |
| **Fast**     | Claude's training knowledge (~500 tokens)            |
| **Thorough** | Includes pre-baked node JSON examples (~2000 tokens) |

### Node Examples Included (Thorough Mode)

- Webhook trigger
- Schedule/Cron trigger
- Error Trigger
- IF (conditional)
- Set (data transformation)
- Slack
- HTTP Request
- Airtable
- Google Sheets

### Example Conversions

| User Says                                   | Generated Workflow                       |
| ------------------------------------------- | ---------------------------------------- |
| "Send Slack when Stripe payment fails"      | Stripe Trigger → IF (failed) → Slack     |
| "Daily backup of Airtable to Google Sheets" | Schedule → Airtable → Google Sheets      |
| "Email me when website goes down"           | HTTP Request (cron) → IF (error) → Email |

## Dependencies

- F-002: n8n MCP Integration (provides create_workflow tool)

## Future Enhancements

- F-009: Live MCP Access (Context7/Serper) for real-time node documentation lookup
