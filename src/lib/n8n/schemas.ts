import { z } from 'zod';

// Workflow node schema (simplified for Claude)
export const nodeSchema = z.object({
  type: z.string().describe('n8n node type, e.g., "n8n-nodes-base.httpRequest"'),
  name: z.string().describe('Human-readable node name'),
  position: z.tuple([z.number(), z.number()]).optional(),
  parameters: z.record(z.string(), z.unknown()).describe('Node-specific parameters'),
});

// Connection schema
export const connectionSchema = z.object({
  source: z.string().describe('Source node name'),
  target: z.string().describe('Target node name'),
  sourceOutput: z.number().default(0),
  targetInput: z.number().default(0),
});

// Tool input schemas
export const listWorkflowsInputSchema = z.object({
  active: z.boolean().optional().describe('Filter by active status'),
  tags: z.array(z.string()).optional().describe('Filter by tag names'),
});

export const getWorkflowInputSchema = z.object({
  workflowId: z.string().describe('The workflow ID to retrieve'),
});

export const createWorkflowInputSchema = z.object({
  name: z.string().describe('Name for the new workflow'),
  nodes: z.array(nodeSchema).describe('Array of workflow nodes'),
  connections: z.array(connectionSchema).describe('Array of node connections'),
  active: z.boolean().default(false).describe('Whether to activate immediately'),
});

export const updateWorkflowInputSchema = z.object({
  workflowId: z.string().describe('The workflow ID to update'),
  name: z.string().optional().describe('New workflow name'),
  nodes: z.array(nodeSchema).optional().describe('Updated nodes array'),
  connections: z.array(connectionSchema).optional().describe('Updated connections'),
  active: z.boolean().optional().describe('Activation status'),
});

export const activateWorkflowInputSchema = z.object({
  workflowId: z.string().describe('The workflow ID to activate/deactivate'),
  active: z.boolean().describe('True to activate, false to deactivate'),
});

export const deleteWorkflowInputSchema = z.object({
  workflowId: z.string().describe('The workflow ID to delete'),
});

// Type exports
export type Node = z.infer<typeof nodeSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type ListWorkflowsInput = z.infer<typeof listWorkflowsInputSchema>;
export type GetWorkflowInput = z.infer<typeof getWorkflowInputSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowInputSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowInputSchema>;
export type ActivateWorkflowInput = z.infer<typeof activateWorkflowInputSchema>;
export type DeleteWorkflowInput = z.infer<typeof deleteWorkflowInputSchema>;
