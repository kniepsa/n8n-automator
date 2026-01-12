import type { Node, Edge } from '@xyflow/react';

/**
 * Node categories for color coding in the visual preview
 */
export type N8nNodeCategory = 'trigger' | 'action' | 'logic' | 'transform' | 'output';

/**
 * Extended data for custom React Flow nodes
 * Uses index signature to satisfy React Flow's Record<string, unknown> constraint
 */
export interface N8nNodeData extends Record<string, unknown> {
  label: string;
  nodeType: string; // e.g., 'n8n-nodes-base.slack'
  category: N8nNodeCategory;
  icon: string; // Lucide icon name
  configSummary?: string; // For hover tooltip
  hasWarning?: boolean;
  warningMessage?: string;
}

/**
 * React Flow node with n8n-specific data
 */
export type N8nFlowNode = Node<N8nNodeData, 'n8nNode'>;

/**
 * Edge data for conditional highlighting
 */
export interface N8nEdgeData extends Record<string, unknown> {
  isConditional?: boolean;
  label?: string;
}

/**
 * React Flow edge with n8n-specific data
 */
export type N8nFlowEdge = Edge<N8nEdgeData, 'n8nEdge'>;

/**
 * Result from converting n8n workflow to React Flow format
 */
export interface ConversionResult {
  nodes: N8nFlowNode[];
  edges: N8nFlowEdge[];
}

/**
 * Plain English workflow summary
 */
export interface WorkflowSummaryResult {
  title: string;
  steps: string[];
  credentialRequirements: string[];
}

/**
 * n8n workflow node structure (from n8n JSON)
 */
export interface N8nNode {
  name: string;
  type: string;
  typeVersion?: number;
  position?: [number, number];
  parameters?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

/**
 * n8n connection target
 */
export interface N8nConnectionTarget {
  node: string;
  type: string;
  index: number;
}

/**
 * n8n connection structure
 */
export interface N8nConnection {
  main?: N8nConnectionTarget[][];
}

/**
 * n8n workflow structure
 */
export interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, N8nConnection>;
  settings?: Record<string, unknown>;
}
