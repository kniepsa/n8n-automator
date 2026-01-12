import type { Position } from '@xyflow/react';
import type {
  N8nWorkflow,
  N8nNode,
  N8nFlowNode,
  N8nFlowEdge,
  N8nNodeData,
  ConversionResult,
} from './types';
import { getNodeMeta } from './node-icons';

const CONDITIONAL_TYPES = ['n8n-nodes-base.if', 'n8n-nodes-base.switch'];

/**
 * Convert an n8n workflow to React Flow format
 */
export function convertToReactFlow(workflow: N8nWorkflow): ConversionResult {
  const nodes = convertNodes(workflow.nodes);
  const edges = convertEdges(workflow.connections, workflow.nodes);
  return { nodes, edges };
}

/**
 * Convert n8n nodes to React Flow nodes
 */
function convertNodes(n8nNodes: N8nNode[]): N8nFlowNode[] {
  return n8nNodes.map((node, index) => {
    const meta = getNodeMeta(node.type);
    const data: N8nNodeData = {
      label: node.name,
      nodeType: node.type,
      category: meta.category,
      icon: meta.icon,
      configSummary: generateConfigSummary(node),
    };

    return {
      id: node.name, // n8n uses name as ID in connections
      type: 'n8nNode',
      data,
      // Position will be overwritten by dagre layout
      // Use n8n position if available, otherwise fallback
      position: node.position
        ? { x: node.position[0], y: node.position[1] }
        : { x: index * 200, y: 0 },
      sourcePosition: 'right' as Position,
      targetPosition: 'left' as Position,
    };
  });
}

/**
 * Convert n8n connections to React Flow edges
 */
function convertEdges(
  connections: Record<
    string,
    { main?: Array<Array<{ node: string; type: string; index: number }>> }
  >,
  nodes: N8nNode[]
): N8nFlowEdge[] {
  const edges: N8nFlowEdge[] = [];

  for (const [sourceName, connection] of Object.entries(connections)) {
    if (!connection.main) continue;

    connection.main.forEach((outputs, outputIndex) => {
      if (!Array.isArray(outputs)) return;

      outputs.forEach((target, targetIndex) => {
        if (!target || typeof target.node !== 'string') return;

        const isConditional = isConditionalNode(sourceName, nodes);
        const label = isConditional ? getOutputLabel(outputIndex) : undefined;

        edges.push({
          id: `${sourceName}-${target.node}-${outputIndex}-${targetIndex}`,
          source: sourceName,
          target: target.node,
          sourceHandle: `output-${outputIndex}`,
          targetHandle: `input-${target.index}`,
          type: 'n8nEdge',
          animated: true,
          data: {
            isConditional,
            label,
          },
        });
      });
    });
  }

  return edges;
}

/**
 * Check if a node is a conditional type (IF, Switch)
 */
function isConditionalNode(nodeName: string, nodes: N8nNode[]): boolean {
  const node = nodes.find((n) => n.name === nodeName);
  return node ? CONDITIONAL_TYPES.includes(node.type) : false;
}

/**
 * Get label for conditional output (true/false for IF node)
 */
function getOutputLabel(outputIndex: number): string {
  return outputIndex === 0 ? 'true' : 'false';
}

/**
 * Generate a human-readable config summary for tooltip
 */
function generateConfigSummary(node: N8nNode): string {
  const params = node.parameters ?? {};
  const summaryParts: string[] = [];

  // Extract key configuration based on common patterns
  if (params.channel && typeof params.channel === 'string') {
    summaryParts.push(`Channel: ${params.channel}`);
  }
  if (params.text && typeof params.text === 'string') {
    const text = params.text.length > 40 ? `${params.text.slice(0, 40)}...` : params.text;
    summaryParts.push(`Message: "${text}"`);
  }
  if (params.url && typeof params.url === 'string') {
    summaryParts.push(`URL: ${params.url}`);
  }
  if (params.path && typeof params.path === 'string') {
    summaryParts.push(`Path: ${params.path}`);
  }
  if (params.httpMethod && typeof params.httpMethod === 'string') {
    summaryParts.push(`Method: ${params.httpMethod}`);
  }
  if (params.spreadsheetId) {
    summaryParts.push('Sheet configured');
  }
  if (params.operation && typeof params.operation === 'string') {
    summaryParts.push(`Operation: ${params.operation}`);
  }

  return summaryParts.length > 0 ? summaryParts.join('\n') : 'No configuration';
}
