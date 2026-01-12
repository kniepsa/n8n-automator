'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { N8nWorkflow, N8nNodeData } from '@/lib/workflow/types';
import { convertToReactFlow } from '@/lib/workflow/convert-to-reactflow';
import { applyDagreLayout } from '@/lib/workflow/auto-layout';
import { generateWorkflowSummary } from '@/lib/workflow/summarize';
import { validateWorkflowDetailed } from '@/lib/n8n/validator';
import { N8nNode } from './N8nNode';
import { N8nEdge } from './N8nEdge';
import { WorkflowSummary } from './WorkflowSummary';
import { ValidationWarnings } from './ValidationWarnings';
import { cn } from '@/lib/utils';

interface WorkflowPreviewProps {
  workflow: N8nWorkflow;
  className?: string;
}

// Type assertion for React Flow node/edge types
const nodeTypes = {
  n8nNode: N8nNode,
} as NodeTypes;

const edgeTypes = {
  n8nEdge: N8nEdge,
} as EdgeTypes;

export function WorkflowPreview({ workflow, className }: WorkflowPreviewProps): React.ReactElement {
  // Convert and layout nodes (memoized for performance)
  const { initialNodes, initialEdges, summary, validation } = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = convertToReactFlow(workflow);
    const validation = validateWorkflowDetailed(workflow);

    // Add warning flags to nodes based on validation
    const nodesWithWarnings = rawNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        hasWarning: validation.nodeWarnings.has(node.id),
        warningMessage: validation.nodeWarnings.get(node.id)?.join(', '),
      } as N8nNodeData,
    }));

    // Apply automatic layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = applyDagreLayout(
      nodesWithWarnings,
      rawEdges,
      { direction: 'LR' }
    );

    const summary = generateWorkflowSummary(workflow);

    return {
      initialNodes: layoutedNodes,
      initialEdges: layoutedEdges,
      summary,
      validation,
    };
  }, [workflow]);

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  // Prevent editing (read-only preview)
  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Plain English Summary */}
      <WorkflowSummary summary={summary} />

      {/* React Flow Canvas */}
      <div className="h-[280px] w-full overflow-hidden rounded-lg border border-border bg-background/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} className="!bg-card !border-border" />
          <Background color="hsl(var(--muted-foreground) / 0.3)" gap={16} size={1} />
          {nodes.length > 5 && (
            <MiniMap
              nodeColor={() => 'hsl(var(--primary))'}
              maskColor="hsl(var(--background) / 0.8)"
              className="!bg-card !border-border"
            />
          )}
        </ReactFlow>
      </div>

      {/* Validation Warnings */}
      <ValidationWarnings validation={validation} />
    </div>
  );
}
