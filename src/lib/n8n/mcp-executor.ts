import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

export interface MCPToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function executeMCPTool<T = unknown>(
  client: Client,
  toolName: string,
  args: Record<string, unknown>
): Promise<MCPToolResult<T>> {
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });

    // MCP returns content array with text
    const content = result.content as Array<{ type: string; text?: string }> | undefined;
    const textContent = content?.find(
      (c): c is { type: 'text'; text: string } => c.type === 'text'
    );

    if (textContent) {
      try {
        const parsed = JSON.parse(textContent.text) as T;
        return { success: true, data: parsed };
      } catch {
        // Return raw text if not JSON
        return { success: true, data: textContent.text as T };
      }
    }

    // Return structured content if available
    if ('structuredContent' in result && result.structuredContent) {
      return { success: true, data: result.structuredContent as T };
    }

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MCP error';
    console.error(`MCP tool ${toolName} failed:`, message);
    return { success: false, error: message };
  }
}
