import { NextResponse } from 'next/server';
import { isN8nConfigured, getN8nConfig, getN8nMCPClient } from '@/lib/n8n';
import { executeMCPTool } from '@/lib/n8n/mcp-executor';

interface N8nCredential {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CredentialResponse {
  credentials: Array<{
    id: string;
    name: string;
    type: string;
    tool: string;
  }>;
  error?: string;
}

// Map n8n credential types to user-friendly tool names
const CREDENTIAL_TO_TOOL: Record<string, string> = {
  slackApi: 'slack',
  slackOAuth2Api: 'slack',
  googleSheetsOAuth2Api: 'googleSheets',
  googleOAuth2Api: 'googleSheets',
  airtableApi: 'airtable',
  airtableTokenApi: 'airtable',
  notionApi: 'notion',
  notionOAuth2Api: 'notion',
  gmailOAuth2: 'gmail',
  hubspotApi: 'hubspot',
  hubspotOAuth2Api: 'hubspot',
  salesforceOAuth2Api: 'salesforce',
  stripeApi: 'stripe',
  discordApi: 'discord',
  discordOAuth2Api: 'discord',
  discordWebhookApi: 'discord',
  telegramApi: 'telegram',
  githubApi: 'github',
  githubOAuth2Api: 'github',
  jiraSoftwareCloudApi: 'jira',
  jiraSoftwareServerApi: 'jira',
  trelloApi: 'trello',
  typeformApi: 'typeform',
  typeformOAuth2Api: 'typeform',
  calendlyApi: 'calendly',
  calendlyOAuth2Api: 'calendly',
  twilioApi: 'twilio',
  sendGridApi: 'sendgrid',
  mailchimpApi: 'mailchimp',
  asanaApi: 'asana',
  asanaOAuth2Api: 'asana',
  zoomApi: 'zoom',
  zoomOAuth2Api: 'zoom',
  // Generic HTTP credentials
  httpBasicAuth: 'http',
  httpHeaderAuth: 'http',
  oAuth2Api: 'oauth',
};

function mapCredentialToTool(credentialType: string): string {
  // Try exact match first
  if (CREDENTIAL_TO_TOOL[credentialType]) {
    return CREDENTIAL_TO_TOOL[credentialType];
  }

  // Try to extract tool name from credential type
  // e.g., "microsoftExcelOAuth2Api" -> "microsoftExcel"
  const match = credentialType.match(/^([a-zA-Z]+?)(?:Api|OAuth2Api|OAuth2|Token)$/);
  if (match?.[1]) {
    return match[1].toLowerCase();
  }

  // Return as-is if no mapping found
  return credentialType;
}

export async function GET(): Promise<NextResponse<CredentialResponse>> {
  try {
    // Check if n8n is configured
    if (!isN8nConfigured()) {
      return NextResponse.json(
        {
          credentials: [],
          error: 'n8n is not configured. Please connect your n8n instance in settings.',
        },
        { status: 400 }
      );
    }

    // Get MCP client
    const config = getN8nConfig();
    const client = await getN8nMCPClient(config);

    // List credentials from n8n via MCP
    // Note: This calls the MCP server's list_credentials tool
    const result = await executeMCPTool<N8nCredential[]>(client, 'list_credentials', {});

    if (!result.success) {
      console.error('Failed to list credentials:', result.error);
      return NextResponse.json(
        {
          credentials: [],
          error: result.error || 'Failed to fetch credentials from n8n',
        },
        { status: 500 }
      );
    }

    // Map credentials to tools
    const credentials = (result.data || []).map((cred) => ({
      id: cred.id,
      name: cred.name,
      type: cred.type,
      tool: mapCredentialToTool(cred.type),
    }));

    // Deduplicate by tool (keep one credential per tool type)
    const toolsSeen = new Set<string>();
    const uniqueCredentials = credentials.filter((cred) => {
      if (toolsSeen.has(cred.tool)) {
        return false;
      }
      toolsSeen.add(cred.tool);
      return true;
    });

    return NextResponse.json({
      credentials: uniqueCredentials,
    });
  } catch (error) {
    console.error('Credentials API error:', error);
    return NextResponse.json(
      {
        credentials: [],
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
