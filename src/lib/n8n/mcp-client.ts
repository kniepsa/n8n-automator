import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { N8nConfigError, N8nConnectionError } from './errors';

interface MCPClientConfig {
  n8nHost: string;
  n8nApiKey: string;
}

let clientInstance: Client | null = null;
let clientConfig: MCPClientConfig | null = null;

export function getN8nConfig(): MCPClientConfig {
  const n8nHost = process.env.N8N_HOST;
  const n8nApiKey = process.env.N8N_API_KEY;

  if (!n8nHost || !n8nApiKey) {
    throw new N8nConfigError(
      'n8n configuration missing. Set N8N_HOST and N8N_API_KEY environment variables.'
    );
  }

  return { n8nHost, n8nApiKey };
}

export async function getN8nMCPClient(config: MCPClientConfig): Promise<Client> {
  // Return existing client if config matches (connection pooling)
  if (
    clientInstance &&
    clientConfig &&
    clientConfig.n8nHost === config.n8nHost &&
    clientConfig.n8nApiKey === config.n8nApiKey
  ) {
    return clientInstance;
  }

  // Close existing client if config changed
  if (clientInstance) {
    try {
      await clientInstance.close();
    } catch {
      // Ignore close errors
    }
  }

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-n8n-builder'],
      env: {
        ...process.env,
        N8N_HOST: config.n8nHost,
        N8N_API_KEY: config.n8nApiKey,
        OUTPUT_VERBOSITY: 'concise',
      },
    });

    const client = new Client({
      name: 'n8n-automator',
      version: '1.0.0',
    });

    await client.connect(transport);

    clientInstance = client;
    clientConfig = config;

    return client;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to connect to MCP server';
    throw new N8nConnectionError(message, error instanceof Error ? error : undefined);
  }
}

export async function closeN8nMCPClient(): Promise<void> {
  if (clientInstance) {
    try {
      await clientInstance.close();
    } catch {
      // Ignore close errors
    }
    clientInstance = null;
    clientConfig = null;
  }
}

export function isN8nConfigured(): boolean {
  return Boolean(process.env.N8N_HOST && process.env.N8N_API_KEY);
}
