import dagre from '@dagrejs/dagre';
import type { N8nFlowNode, N8nFlowEdge } from './types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

export interface LayoutOptions {
  direction?: 'LR' | 'TB'; // Left-Right or Top-Bottom
  nodeSpacing?: number;
  rankSpacing?: number;
}

export interface LayoutResult {
  nodes: N8nFlowNode[];
  edges: N8nFlowEdge[];
}

/**
 * Apply dagre automatic layout to nodes and edges
 * Returns new arrays with updated positions
 */
export function applyDagreLayout(
  nodes: N8nFlowNode[],
  edges: N8nFlowEdge[],
  options: LayoutOptions = {}
): LayoutResult {
  const { direction = 'LR', nodeSpacing = 50, rankSpacing = 80 } = options;

  // Handle empty or single node case
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  if (nodes.length === 1 && nodes[0]) {
    return {
      nodes: [{ ...nodes[0], position: { x: 50, y: 50 } }],
      edges: [],
    };
  }

  try {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: nodeSpacing,
      ranksep: rankSpacing,
      marginx: 20,
      marginy: 20,
    });

    // Add nodes to dagre
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Add edges to dagre
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Apply positions back to nodes
    const layoutedNodes: N8nFlowNode[] = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      // Handle case where dagre doesn't have position for this node
      if (!nodeWithPosition) {
        return node;
      }

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch {
    // Fallback to grid layout if dagre fails
    console.warn('Dagre layout failed, using fallback grid layout');
    return applyFallbackLayout(nodes, edges);
  }
}

/**
 * Simple grid fallback layout
 */
function applyFallbackLayout(nodes: N8nFlowNode[], edges: N8nFlowEdge[]): LayoutResult {
  const COLS = 4;
  const X_SPACING = 220;
  const Y_SPACING = 100;

  const layoutedNodes = nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % COLS) * X_SPACING + 50,
      y: Math.floor(index / COLS) * Y_SPACING + 50,
    },
  }));

  return { nodes: layoutedNodes, edges };
}
