import type { N8nNodeCategory } from './types';

interface NodeMeta {
  icon: string; // Lucide icon name
  category: N8nNodeCategory;
  displayName: string;
}

/**
 * Mapping of n8n node types to their visual metadata
 */
export const NODE_META: Record<string, NodeMeta> = {
  // Triggers (green)
  'n8n-nodes-base.webhook': { icon: 'Webhook', category: 'trigger', displayName: 'Webhook' },
  'n8n-nodes-base.cron': { icon: 'Clock', category: 'trigger', displayName: 'Schedule' },
  'n8n-nodes-base.schedule': { icon: 'Calendar', category: 'trigger', displayName: 'Schedule' },
  'n8n-nodes-base.scheduleTrigger': {
    icon: 'Calendar',
    category: 'trigger',
    displayName: 'Schedule',
  },
  'n8n-nodes-base.manualTrigger': { icon: 'Play', category: 'trigger', displayName: 'Manual' },
  'n8n-nodes-base.errorTrigger': {
    icon: 'AlertTriangle',
    category: 'trigger',
    displayName: 'Error',
  },
  'n8n-nodes-base.workflowTrigger': {
    icon: 'Workflow',
    category: 'trigger',
    displayName: 'Workflow',
  },
  'n8n-nodes-base.emailTrigger': { icon: 'Mail', category: 'trigger', displayName: 'Email' },

  // Actions (blue)
  'n8n-nodes-base.slack': { icon: 'MessageSquare', category: 'action', displayName: 'Slack' },
  'n8n-nodes-base.googleSheets': {
    icon: 'Table',
    category: 'action',
    displayName: 'Google Sheets',
  },
  'n8n-nodes-base.airtable': { icon: 'Database', category: 'action', displayName: 'Airtable' },
  'n8n-nodes-base.notion': { icon: 'FileText', category: 'action', displayName: 'Notion' },
  'n8n-nodes-base.httpRequest': { icon: 'Globe', category: 'action', displayName: 'HTTP Request' },
  'n8n-nodes-base.gmail': { icon: 'Mail', category: 'action', displayName: 'Gmail' },
  'n8n-nodes-base.discord': { icon: 'MessageCircle', category: 'action', displayName: 'Discord' },
  'n8n-nodes-base.github': { icon: 'Github', category: 'action', displayName: 'GitHub' },
  'n8n-nodes-base.jira': { icon: 'CheckSquare', category: 'action', displayName: 'Jira' },
  'n8n-nodes-base.salesforce': { icon: 'Cloud', category: 'action', displayName: 'Salesforce' },
  'n8n-nodes-base.stripe': { icon: 'CreditCard', category: 'action', displayName: 'Stripe' },
  'n8n-nodes-base.twilio': { icon: 'Phone', category: 'action', displayName: 'Twilio' },
  'n8n-nodes-base.telegram': { icon: 'Send', category: 'action', displayName: 'Telegram' },

  // Logic (amber/orange)
  'n8n-nodes-base.if': { icon: 'GitBranch', category: 'logic', displayName: 'IF' },
  'n8n-nodes-base.switch': { icon: 'GitMerge', category: 'logic', displayName: 'Switch' },
  'n8n-nodes-base.merge': { icon: 'GitPullRequest', category: 'logic', displayName: 'Merge' },
  'n8n-nodes-base.filter': { icon: 'Filter', category: 'logic', displayName: 'Filter' },
  'n8n-nodes-base.splitInBatches': {
    icon: 'Layers',
    category: 'logic',
    displayName: 'Split Batches',
  },
  'n8n-nodes-base.wait': { icon: 'Pause', category: 'logic', displayName: 'Wait' },

  // Transform (purple)
  'n8n-nodes-base.set': { icon: 'Edit3', category: 'transform', displayName: 'Set' },
  'n8n-nodes-base.function': { icon: 'Code', category: 'transform', displayName: 'Function' },
  'n8n-nodes-base.code': { icon: 'Terminal', category: 'transform', displayName: 'Code' },
  'n8n-nodes-base.itemLists': {
    icon: 'List',
    category: 'transform',
    displayName: 'Item Lists',
  },
  'n8n-nodes-base.dateTime': { icon: 'Clock', category: 'transform', displayName: 'Date/Time' },
  'n8n-nodes-base.crypto': { icon: 'Lock', category: 'transform', displayName: 'Crypto' },

  // Output (rose)
  'n8n-nodes-base.emailSend': { icon: 'Send', category: 'output', displayName: 'Send Email' },
  'n8n-nodes-base.respondToWebhook': {
    icon: 'Reply',
    category: 'output',
    displayName: 'Respond',
  },
  'n8n-nodes-base.noOp': { icon: 'Circle', category: 'output', displayName: 'No Op' },
};

/**
 * Category colors using Tailwind classes
 */
export const CATEGORY_COLORS: Record<
  N8nNodeCategory,
  { bg: string; border: string; text: string; iconBg: string }
> = {
  trigger: {
    bg: 'bg-green-500/10',
    border: 'border-green-500',
    text: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-500/20',
  },
  action: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  logic: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/20',
  },
  transform: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-500/20',
  },
  output: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-500/20',
  },
};

/**
 * Get metadata for an n8n node type
 */
export function getNodeMeta(nodeType: string): NodeMeta {
  return (
    NODE_META[nodeType] ?? {
      icon: 'Box',
      category: 'action' as N8nNodeCategory,
      displayName: extractDisplayName(nodeType),
    }
  );
}

/**
 * Extract display name from node type string
 * e.g., 'n8n-nodes-base.slack' -> 'Slack'
 */
function extractDisplayName(nodeType: string): string {
  const parts = nodeType.split('.');
  const name = parts[parts.length - 1] ?? nodeType;
  // Convert camelCase to Title Case
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
