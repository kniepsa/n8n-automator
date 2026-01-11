import { NextResponse } from 'next/server';
import { isN8nConfigured, getN8nConfig, getN8nMCPClient } from '@/lib/n8n';
import { executeMCPTool } from '@/lib/n8n/mcp-executor';

interface DeployRequest {
  workflow: {
    name: string;
    nodes: unknown[];
    connections: Record<string, unknown>;
    settings?: Record<string, unknown>;
  };
}

interface DeployResponse {
  success: boolean;
  workflowId?: string;
  workflowUrl?: string;
  error?: string;
}

export async function POST(req: Request): Promise<NextResponse<DeployResponse>> {
  try {
    // Check if n8n is configured
    if (!isN8nConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'n8n is not configured. Please set N8N_HOST and N8N_API_KEY environment variables.',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = (await req.json()) as DeployRequest;
    const { workflow } = body;

    if (!workflow?.name || !workflow?.nodes) {
      return NextResponse.json({ success: false, error: 'Invalid workflow data' }, { status: 400 });
    }

    // Get MCP client
    const config = getN8nConfig();
    const client = await getN8nMCPClient(config);

    // Deploy to n8n via MCP
    const result = await executeMCPTool<{ id?: string }>(client, 'create_workflow', {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: transformConnections(workflow.connections),
      active: false, // Don't auto-activate
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create workflow' },
        { status: 500 }
      );
    }

    // Extract workflow ID from result
    const workflowId = extractWorkflowId(result.data);

    // Build workflow URL
    const workflowUrl = workflowId ? `${config.n8nHost}/workflow/${workflowId}` : undefined;

    return NextResponse.json({
      success: true,
      workflowId,
      workflowUrl,
    });
  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Transform connections to n8n format.
 */
function transformConnections(
  connections: Record<string, unknown>
): Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }> {
  const result: Record<
    string,
    { main: Array<Array<{ node: string; type: string; index: number }>> }
  > = {};

  for (const [nodeName, value] of Object.entries(connections)) {
    const conn = value as { main: Array<Array<{ node: string; type: string; index: number }>> };
    result[nodeName] = conn;
  }

  return result;
}

/**
 * Extract workflow ID from MCP result.
 */
function extractWorkflowId(data: { id?: string } | undefined): string | undefined {
  if (!data) return undefined;
  return data.id;
}
