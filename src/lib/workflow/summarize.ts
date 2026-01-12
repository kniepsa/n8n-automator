import type { N8nWorkflow, N8nNode, WorkflowSummaryResult } from './types';
import { getNodeMeta } from './node-icons';

const TRIGGER_TYPES = [
  'n8n-nodes-base.webhook',
  'n8n-nodes-base.cron',
  'n8n-nodes-base.schedule',
  'n8n-nodes-base.scheduleTrigger',
  'n8n-nodes-base.manualTrigger',
  'n8n-nodes-base.errorTrigger',
  'n8n-nodes-base.workflowTrigger',
  'n8n-nodes-base.emailTrigger',
];

/**
 * Generate a plain English summary of what a workflow does
 */
export function generateWorkflowSummary(workflow: N8nWorkflow): WorkflowSummaryResult {
  const steps = generateStepDescriptions(workflow);
  const credentials = extractCredentialRequirements(workflow.nodes);

  return {
    title: `What "${workflow.name}" does`,
    steps,
    credentialRequirements: credentials,
  };
}

/**
 * Generate step-by-step descriptions in execution order
 */
function generateStepDescriptions(workflow: N8nWorkflow): string[] {
  const orderedNodes = getExecutionOrder(workflow);
  const steps: string[] = [];

  orderedNodes.forEach((node, index) => {
    const description = describeNode(node, index === 0);
    if (description) {
      steps.push(description);
    }
  });

  return steps;
}

/**
 * Get nodes in execution order (BFS from trigger)
 */
function getExecutionOrder(workflow: N8nWorkflow): N8nNode[] {
  // Find trigger node first
  const trigger = workflow.nodes.find((n) => TRIGGER_TYPES.includes(n.type));

  if (!trigger) {
    // No trigger, return nodes as-is
    return workflow.nodes;
  }

  // BFS from trigger through connections
  const visited = new Set<string>();
  const ordered: N8nNode[] = [];
  const queue = [trigger.name];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    const node = workflow.nodes.find((n) => n.name === current);
    if (node) ordered.push(node);

    // Find connected nodes
    const connection = workflow.connections[current];
    if (connection?.main) {
      connection.main.forEach((outputs) => {
        if (Array.isArray(outputs)) {
          outputs.forEach((target) => {
            if (target?.node && !visited.has(target.node)) {
              queue.push(target.node);
            }
          });
        }
      });
    }
  }

  // Add any orphan nodes at the end
  workflow.nodes.forEach((node) => {
    if (!visited.has(node.name)) {
      ordered.push(node);
    }
  });

  return ordered;
}

/**
 * Generate a plain English description for a single node
 */
function describeNode(node: N8nNode, isFirst: boolean): string {
  const meta = getNodeMeta(node.type);
  const prefix = isFirst ? 'When' : 'Then';

  // Custom descriptions for common node types
  switch (node.type) {
    // Triggers
    case 'n8n-nodes-base.webhook':
      return `${prefix} a webhook request is received`;
    case 'n8n-nodes-base.cron':
    case 'n8n-nodes-base.schedule':
    case 'n8n-nodes-base.scheduleTrigger':
      return `${prefix} the scheduled time occurs`;
    case 'n8n-nodes-base.manualTrigger':
      return `${prefix} manually triggered`;
    case 'n8n-nodes-base.errorTrigger':
      return `${prefix} an error occurs in another workflow`;
    case 'n8n-nodes-base.emailTrigger':
      return `${prefix} an email is received`;

    // Actions
    case 'n8n-nodes-base.slack':
      return `${prefix} send a message to Slack`;
    case 'n8n-nodes-base.googleSheets':
      return `${prefix} update Google Sheets`;
    case 'n8n-nodes-base.airtable':
      return `${prefix} update Airtable`;
    case 'n8n-nodes-base.notion':
      return `${prefix} update Notion`;
    case 'n8n-nodes-base.gmail':
      return `${prefix} send via Gmail`;
    case 'n8n-nodes-base.discord':
      return `${prefix} send to Discord`;
    case 'n8n-nodes-base.telegram':
      return `${prefix} send via Telegram`;
    case 'n8n-nodes-base.httpRequest':
      return `${prefix} make an HTTP request`;
    case 'n8n-nodes-base.emailSend':
      return `${prefix} send an email`;

    // Logic
    case 'n8n-nodes-base.if':
      return `${prefix} check a condition`;
    case 'n8n-nodes-base.switch':
      return `${prefix} route based on value`;
    case 'n8n-nodes-base.merge':
      return `${prefix} merge data streams`;
    case 'n8n-nodes-base.filter':
      return `${prefix} filter the data`;
    case 'n8n-nodes-base.wait':
      return `${prefix} wait for a delay`;

    // Transform
    case 'n8n-nodes-base.set':
      return `${prefix} transform the data`;
    case 'n8n-nodes-base.function':
    case 'n8n-nodes-base.code':
      return `${prefix} run custom code`;

    // Output
    case 'n8n-nodes-base.respondToWebhook':
      return `${prefix} respond to the request`;

    default:
      return `${prefix} run ${meta.displayName}`;
  }
}

/**
 * Extract credential requirements from nodes
 */
function extractCredentialRequirements(nodes: N8nNode[]): string[] {
  const credentials = new Set<string>();

  nodes.forEach((node) => {
    // Check explicit credentials
    if (node.credentials) {
      Object.keys(node.credentials).forEach((cred) => {
        credentials.add(formatCredentialName(cred));
      });
    }

    // Infer from node type for common integrations
    const inferred = inferCredentialFromType(node.type);
    if (inferred) credentials.add(inferred);
  });

  return Array.from(credentials);
}

/**
 * Infer credential requirement from node type
 */
function inferCredentialFromType(nodeType: string): string | null {
  const mapping: Record<string, string> = {
    'n8n-nodes-base.slack': 'Slack API',
    'n8n-nodes-base.googleSheets': 'Google Sheets OAuth',
    'n8n-nodes-base.airtable': 'Airtable API',
    'n8n-nodes-base.notion': 'Notion API',
    'n8n-nodes-base.gmail': 'Gmail OAuth',
    'n8n-nodes-base.discord': 'Discord Webhook',
    'n8n-nodes-base.telegram': 'Telegram API',
    'n8n-nodes-base.github': 'GitHub API',
    'n8n-nodes-base.jira': 'Jira API',
    'n8n-nodes-base.salesforce': 'Salesforce OAuth',
    'n8n-nodes-base.stripe': 'Stripe API',
    'n8n-nodes-base.twilio': 'Twilio API',
  };
  return mapping[nodeType] ?? null;
}

/**
 * Format credential name for display
 */
function formatCredentialName(name: string): string {
  return name
    .replace(/Api$/, ' API')
    .replace(/OAuth2$/, ' OAuth')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}
