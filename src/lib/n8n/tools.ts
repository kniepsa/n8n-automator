import { tool } from 'ai';
import { getN8nMCPClient, getN8nConfig } from './mcp-client';
import { executeMCPTool } from './mcp-executor';
import {
  listWorkflowsInputSchema,
  getWorkflowInputSchema,
  createWorkflowInputSchema,
  updateWorkflowInputSchema,
  activateWorkflowInputSchema,
  deleteWorkflowInputSchema,
  type Connection,
} from './schemas';

// Helper to transform connection array to n8n connection object format
function transformConnections(
  connections: Connection[]
): Record<string, Record<string, Array<Array<{ node: string; type: string; index: number }>>>> {
  const result: Record<
    string,
    Record<string, Array<Array<{ node: string; type: string; index: number }>>>
  > = {};

  for (const conn of connections) {
    const sourceKey = conn.source;
    const outputType = 'main';
    const outputIndex = conn.sourceOutput ?? 0;

    if (!result[sourceKey]) {
      result[sourceKey] = {};
    }
    if (!result[sourceKey][outputType]) {
      result[sourceKey][outputType] = [];
    }
    while (result[sourceKey][outputType].length <= outputIndex) {
      result[sourceKey][outputType].push([]);
    }

    result[sourceKey][outputType][outputIndex]!.push({
      node: conn.target,
      type: outputType,
      index: conn.targetInput ?? 0,
    });
  }

  return result;
}

export const n8nTools = {
  list_workflows: tool({
    description:
      'List all workflows in the connected n8n instance. Can filter by active status or tags.',
    inputSchema: listWorkflowsInputSchema,
    execute: async (params) => {
      const config = getN8nConfig();
      const client = await getN8nMCPClient(config);
      const result = await executeMCPTool(client, 'list_workflows', params);

      if (!result.success) {
        return { error: result.error, workflows: [] };
      }
      return result.data;
    },
  }),

  get_workflow: tool({
    description:
      'Get complete details of a specific workflow by ID, including all nodes and connections.',
    inputSchema: getWorkflowInputSchema,
    execute: async ({ workflowId }) => {
      const config = getN8nConfig();
      const client = await getN8nMCPClient(config);
      const result = await executeMCPTool(client, 'get_workflow', {
        id: workflowId,
      });

      if (!result.success) {
        return { error: result.error };
      }
      return result.data;
    },
  }),

  create_workflow: tool({
    description:
      'Create a new n8n workflow with specified nodes and connections. Returns the created workflow with its ID.',
    inputSchema: createWorkflowInputSchema,
    execute: async (params) => {
      const config = getN8nConfig();
      const client = await getN8nMCPClient(config);

      // Transform to n8n format
      const workflowData = {
        name: params.name,
        nodes: params.nodes,
        connections: transformConnections(params.connections),
        active: params.active,
      };

      const result = await executeMCPTool(client, 'create_workflow', workflowData);

      if (!result.success) {
        return { error: result.error };
      }
      return { success: true, workflow: result.data };
    },
  }),

  update_workflow: tool({
    description: 'Update an existing workflow. Provide only the fields you want to change.',
    inputSchema: updateWorkflowInputSchema,
    execute: async ({ workflowId, connections, ...updates }) => {
      const config = getN8nConfig();
      const client = await getN8nMCPClient(config);

      // First get current workflow
      const current = await executeMCPTool(client, 'get_workflow', {
        id: workflowId,
      });
      if (!current.success) {
        return { error: `Failed to get workflow: ${current.error}` };
      }

      // Build updated workflow
      const updatedWorkflow: Record<string, unknown> = {
        ...(current.data as Record<string, unknown>),
        ...updates,
        id: workflowId,
      };

      if (connections) {
        updatedWorkflow.connections = transformConnections(connections);
      }

      const result = await executeMCPTool(client, 'update_workflow', updatedWorkflow);

      if (!result.success) {
        return { error: result.error };
      }
      return { success: true, workflow: result.data };
    },
  }),

  activate_workflow: tool({
    description: 'Activate or deactivate a workflow by ID.',
    inputSchema: activateWorkflowInputSchema,
    execute: async ({ workflowId, active }) => {
      const config = getN8nConfig();
      const client = await getN8nMCPClient(config);

      const toolName = active ? 'activate_workflow' : 'deactivate_workflow';
      const result = await executeMCPTool(client, toolName, { id: workflowId });

      if (!result.success) {
        return { error: result.error };
      }
      return { success: true, active, workflowId };
    },
  }),

  delete_workflow: tool({
    description: 'Permanently delete a workflow by ID. This cannot be undone.',
    inputSchema: deleteWorkflowInputSchema,
    execute: async ({ workflowId }) => {
      const config = getN8nConfig();
      const client = await getN8nMCPClient(config);
      const result = await executeMCPTool(client, 'delete_workflow', {
        id: workflowId,
      });

      if (!result.success) {
        return { error: result.error };
      }
      return { success: true, deleted: workflowId };
    },
  }),
};
