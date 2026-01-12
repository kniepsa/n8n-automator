'use client';

import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { N8nEdgeData } from '@/lib/workflow/types';

// Define the full edge type that React Flow expects
type N8nCustomEdge = Edge<N8nEdgeData, 'n8nEdge'>;

function N8nEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<N8nCustomEdge>): React.ReactElement {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Use different colors for conditional branches
  const strokeColor = data?.isConditional ? '#f59e0b' : 'hsl(var(--muted-foreground))';

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: strokeColor,
        strokeWidth: 2,
      }}
    />
  );
}

export const N8nEdge = memo(N8nEdgeComponent);
