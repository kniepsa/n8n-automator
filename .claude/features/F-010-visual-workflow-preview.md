# F-010: Visual Workflow Preview (YSIYG)

## Overview

"You See Is You Get" - A sleek, read-only visual preview of generated workflows before deployment. Users see exactly what they'll get in n8n, building confidence and reducing the trust gap.

## Priority

P0 - Critical Differentiator

## The Problem (First Principles)

Current state:
```
Claude generates JSON → User sees... JSON? Summary? → Leap of faith → Deploy
```

The gap: Users don't SEE what they're getting. They see data, not the workflow.

n8n's core UX is a **visual canvas**. Our preview should match that mental model.

## User Story

As a user, I want to see my workflow visually before deploying so I can verify it does what I expect without parsing JSON.

## Acceptance Criteria

- [ ] Visual node graph using React Flow
- [ ] Nodes styled to match n8n aesthetic (rounded, icons, colors)
- [ ] Connection lines with proper routing
- [ ] Node hover shows: name, type, brief config
- [ ] Dark/light theme support
- [ ] Zoom/pan controls
- [ ] Node count and trigger type badge
- [ ] "Deploy to n8n" button prominent
- [ ] Smooth animations on load

## Design: Sleek Edition

### Visual Style

```
┌─────────────────────────────────────────────────────────────┐
│  WORKFLOW PREVIEW                              [−] [□] [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│    │ 🔗       │      │ ❓       │      │ 💬       │        │
│    │ Webhook  │─────▶│   IF     │─────▶│  Slack   │        │
│    │          │      │          │      │          │        │
│    └──────────┘      └────┬─────┘      └──────────┘        │
│                           │                                 │
│                           │ false                           │
│                           ▼                                 │
│                      ┌──────────┐                           │
│                      │ 📊       │                           │
│                      │ Sheets   │                           │
│                      │          │                           │
│                      └──────────┘                           │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│  4 nodes • Webhook trigger • 2 branches                    │
│                                                             │
│            [Copy JSON]        [Deploy to n8n →]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Node Design

Each node is a rounded rectangle with:
- **Icon**: Service icon (Slack, Sheets, etc.) or type icon (IF, Switch)
- **Name**: Node display name
- **Subtle glow**: On hover
- **Color accent**: Based on node category
  - Triggers: Green border
  - Actions: Blue border
  - Logic: Orange border
  - Transform: Purple border

### Connections

- Bezier curves (not straight lines)
- Animated flow direction (subtle pulse)
- Branch labels ("true", "false", "error")
- Connection hover highlights the path

### Interactions

- **Hover node**: Shows tooltip with config summary
- **Zoom**: Mouse wheel or buttons
- **Pan**: Click and drag background
- **Minimap**: Optional corner overview for complex flows

## Technical Implementation

### Dependencies

```json
{
  "@xyflow/react": "^12.0.0",
  "lucide-react": "existing"
}
```

Note: React Flow v12 uses `@xyflow/react` package name.

### Components

```typescript
// src/components/workflow-preview/WorkflowPreview.tsx
interface WorkflowPreviewProps {
  workflow: N8nWorkflow;
  onDeploy: () => void;
  isDeploying?: boolean;
}

export function WorkflowPreview({ workflow, onDeploy, isDeploying }: WorkflowPreviewProps) {
  const { nodes, edges } = convertN8nToReactFlow(workflow);

  return (
    <Card className="h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={customNodeTypes}
        edgeTypes={customEdgeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant="dots" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <WorkflowStats workflow={workflow} />
      <DeployButton onClick={onDeploy} loading={isDeploying} />
    </Card>
  );
}
```

### N8n to React Flow Converter

```typescript
// src/lib/workflow/convert-to-reactflow.ts

interface ReactFlowNode {
  id: string;
  type: 'n8nNode';
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: string;
    icon: string;
    category: 'trigger' | 'action' | 'logic' | 'transform';
    config: Record<string, unknown>;
  };
}

export function convertN8nToReactFlow(workflow: N8nWorkflow): {
  nodes: ReactFlowNode[];
  edges: Edge[];
} {
  // Parse n8n workflow JSON
  // Map nodes with auto-layout (dagre)
  // Create edges from connections
  // Return React Flow compatible structure
}
```

### Custom Node Component

```typescript
// src/components/workflow-preview/N8nNode.tsx

const categoryColors = {
  trigger: 'border-green-500 bg-green-500/10',
  action: 'border-blue-500 bg-blue-500/10',
  logic: 'border-orange-500 bg-orange-500/10',
  transform: 'border-purple-500 bg-purple-500/10',
};

export function N8nNode({ data }: NodeProps<N8nNodeData>) {
  return (
    <div className={cn(
      'px-4 py-3 rounded-lg border-2 shadow-md min-w-[120px]',
      'hover:shadow-lg transition-shadow',
      categoryColors[data.category]
    )}>
      <div className="flex items-center gap-2">
        <NodeIcon type={data.nodeType} className="w-5 h-5" />
        <span className="font-medium text-sm">{data.label}</span>
      </div>
    </div>
  );
}
```

### Auto-Layout with Dagre

```typescript
// src/lib/workflow/auto-layout.ts
import dagre from 'dagre';

export function layoutWorkflow(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => g.setNode(node.id, { width: 150, height: 60 }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));

  dagre.layout(g);

  return nodes.map(node => ({
    ...node,
    position: {
      x: g.node(node.id).x - 75,
      y: g.node(node.id).y - 30,
    },
  }));
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/workflow-preview/WorkflowPreview.tsx` | Main container |
| `src/components/workflow-preview/N8nNode.tsx` | Custom node component |
| `src/components/workflow-preview/N8nEdge.tsx` | Custom edge with animation |
| `src/components/workflow-preview/WorkflowStats.tsx` | Node count, trigger type |
| `src/components/workflow-preview/NodeTooltip.tsx` | Hover details |
| `src/lib/workflow/convert-to-reactflow.ts` | N8n JSON → React Flow |
| `src/lib/workflow/auto-layout.ts` | Dagre-based layout |
| `src/lib/workflow/node-icons.ts` | Icon mapping for n8n nodes |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/chat/chat-interface.tsx` | Replace JSON preview with WorkflowPreview |
| `package.json` | Add @xyflow/react, dagre |

## Node Icon Mapping

```typescript
// src/lib/workflow/node-icons.ts
export const nodeIcons: Record<string, string> = {
  // Triggers
  'n8n-nodes-base.webhook': 'webhook',
  'n8n-nodes-base.schedule': 'clock',
  'n8n-nodes-base.emailTrigger': 'mail',

  // Actions
  'n8n-nodes-base.slack': 'slack',
  'n8n-nodes-base.googleSheets': 'sheet',
  'n8n-nodes-base.airtable': 'database',
  'n8n-nodes-base.httpRequest': 'globe',

  // Logic
  'n8n-nodes-base.if': 'git-branch',
  'n8n-nodes-base.switch': 'git-merge',
  'n8n-nodes-base.merge': 'git-pull-request',

  // Transform
  'n8n-nodes-base.set': 'edit',
  'n8n-nodes-base.code': 'code',
  'n8n-nodes-base.function': 'function-square',
};
```

## Success Criteria

1. **Trust**: User says "Yes, that's exactly what I want" before deploy
2. **Sleek**: Looks as good as n8n's native editor
3. **Fast**: Renders in < 200ms for 10-node workflow
4. **Clear**: Non-technical users understand the flow at a glance

## Why This Matters

> "The preview is the product. If users don't trust what they see, they won't deploy."

This is the visual handshake between "AI generated something" and "I'll put this in my production n8n."
