# F-002: n8n MCP Integration

## Overview

Integration with n8n via Model Context Protocol (MCP) server to enable Claude to interact directly with user's n8n instance.

## Priority

P0 - MVP Required

## User Story

As a user, I want Claude to directly create and manage workflows in my n8n instance so that I don't have to manually copy/paste JSON.

## Acceptance Criteria

- [ ] Connect to user's n8n instance via API
- [ ] List existing workflows
- [ ] Create new workflows
- [ ] Update existing workflows
- [ ] Get node documentation for accurate workflow generation
- [ ] Handle API errors gracefully
- [ ] Validate n8n connection on settings save

## Technical Implementation

### MCP Tools Available

| Tool                     | Description                 |
| ------------------------ | --------------------------- |
| `list_workflows`         | Get all workflows from n8n  |
| `get_workflow`           | Get specific workflow by ID |
| `create_workflow`        | Create new workflow JSON    |
| `update_workflow`        | Modify existing workflow    |
| `activate_workflow`      | Turn workflow on/off        |
| `get_node_documentation` | Get n8n node schema/docs    |

### Architecture

```
[API Route] → [MCP Client] → [n8n MCP Server (npx)] → [n8n API]
```

### Key Code

```typescript
// src/lib/n8n/mcp-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export async function createN8nMCPClient(n8nUrl: string, apiKey: string) {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'mcp-n8n'],
    env: {
      N8N_BASE_URL: n8nUrl,
      N8N_API_KEY: apiKey,
    },
  });

  const client = new Client({ name: 'n8n-automator', version: '1.0.0' });
  await client.connect(transport);

  return client;
}
```

### Tool Definitions for Claude

```typescript
// src/lib/n8n/tools.ts
export const n8nTools = {
  list_workflows: {
    description: 'List all workflows in the n8n instance',
    parameters: {},
  },
  create_workflow: {
    description: 'Create a new n8n workflow',
    parameters: {
      name: { type: 'string', description: 'Workflow name' },
      nodes: { type: 'array', description: 'Workflow nodes' },
      connections: { type: 'object', description: 'Node connections' },
    },
  },
  // ... more tools
};
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK
- `mcp-n8n` - n8n MCP server (via npx)

## Files to Create/Modify

- `src/lib/n8n/mcp-client.ts` - CREATE
- `src/lib/n8n/tools.ts` - CREATE
- `src/app/api/chat/route.ts` - MODIFY (add MCP tools)

## Security Considerations

- n8n API key stored encrypted in Supabase
- Key never exposed to frontend
- Key decrypted only in server-side API routes
- MCP server runs in isolated process

## Error Handling

- Connection timeout: Show "n8n unreachable" message
- Auth failure: Prompt user to check API key
- Rate limiting: Queue requests, show "processing" state
