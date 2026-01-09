# F-007: Workflow Preview

## Overview

Visual preview of generated workflows before deploying to n8n.

## Priority

P1 - MVP Should Have

## User Story

As a user, I want to see a preview of the workflow before it's deployed so I can verify it's correct.

## Acceptance Criteria

- [ ] Display workflow JSON in readable format
- [ ] Syntax highlighting for JSON
- [ ] Copy JSON to clipboard button
- [ ] Visual node diagram (optional - can be P2)
- [ ] Show workflow name and description
- [ ] List of nodes used
- [ ] Deploy button prominently displayed

## Technical Implementation

### Preview Component

```typescript
// src/components/chat/workflow-preview.tsx
export function WorkflowPreview({ workflow }: { workflow: N8nWorkflow }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workflow.name}</CardTitle>
        <CardDescription>
          {workflow.nodes.length} nodes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JsonViewer data={workflow} />
      </CardContent>
      <CardFooter>
        <Button onClick={copyToClipboard}>Copy JSON</Button>
        <Button onClick={deployToN8n}>Deploy to n8n</Button>
      </CardFooter>
    </Card>
  );
}
```

### JSON Highlighting

Use `react-json-view` or custom syntax highlighting:

```typescript
import { Highlight, themes } from 'prism-react-renderer';

<Highlight code={JSON.stringify(workflow, null, 2)} language="json">
  {/* ... */}
</Highlight>
```

## Files to Create/Modify

- `src/components/chat/workflow-preview.tsx` - CREATE
- `src/components/chat/json-viewer.tsx` - CREATE

## Dependencies

- `prism-react-renderer` - Syntax highlighting
- OR `react-json-view-lite` - Interactive JSON tree

## Future Enhancement (P2)

- Visual node graph using React Flow or similar
- Show data flow between nodes
- Click node to see configuration
