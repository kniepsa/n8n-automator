# F-003: Workflow Generation

## Overview

Natural language to n8n workflow JSON conversion using Claude with n8n MCP tools.

## Priority

P0 - MVP Required

## User Story

As a user, I want to describe my automation needs in plain English and receive a working n8n workflow that I can deploy immediately.

## Acceptance Criteria

- [ ] Parse natural language intent accurately
- [ ] Generate valid n8n workflow JSON
- [ ] Select appropriate n8n nodes for the task
- [ ] Wire connections between nodes correctly
- [ ] Include error handling nodes where appropriate
- [ ] Support common integrations (Slack, Google Sheets, Stripe, etc.)
- [ ] Explain what the workflow does in plain language

## Technical Implementation

### System Prompt

```typescript
const systemPrompt = `You are an n8n workflow automation expert. When users describe what they want to automate:

1. Understand their intent clearly
2. Ask clarifying questions if needed
3. Use the n8n MCP tools to:
   - Check existing workflows they might want to modify
   - Get node documentation for accurate configuration
   - Create new workflows with proper node setup

When creating workflows:
- Use appropriate trigger nodes (webhook, schedule, app-specific)
- Add error handling with Error Trigger nodes
- Include Set nodes for data transformation
- Add IF nodes for conditional logic
- Configure nodes with reasonable defaults

Always explain what you're creating and why.`;
```

### Workflow Structure

```json
{
  "name": "User-described workflow",
  "nodes": [
    {
      "id": "uuid",
      "name": "Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {}
    }
  ],
  "connections": {
    "Trigger": {
      "main": [[{ "node": "NextNode", "type": "main", "index": 0 }]]
    }
  }
}
```

### Example Conversions

| User Says                                   | Generated Workflow                       |
| ------------------------------------------- | ---------------------------------------- |
| "Send Slack when Stripe payment fails"      | Stripe Trigger → IF (failed) → Slack     |
| "Daily backup of Airtable to Google Sheets" | Schedule → Airtable → Google Sheets      |
| "Email me when website goes down"           | HTTP Request (cron) → IF (error) → Email |

## Files to Create/Modify

- `src/lib/n8n/prompts.ts` - CREATE (system prompts)
- `src/app/api/chat/route.ts` - MODIFY

## Quality Assurance

- Test with 20+ common automation scenarios
- Validate generated JSON against n8n schema
- Ensure node types exist in n8n
- Verify connection wiring is valid
