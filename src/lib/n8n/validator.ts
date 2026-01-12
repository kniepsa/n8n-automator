/**
 * Workflow JSON Validator
 *
 * Validates n8n workflow structure before deployment.
 */

interface N8nNode {
  name: string;
  type: string;
  typeVersion?: number;
  position?: [number, number];
  parameters?: Record<string, unknown>;
}

interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DetailedValidation extends ValidationResult {
  nodeWarnings: Map<string, string[]>;
  credentialGaps: string[];
  complexityScore: number;
}

const TRIGGER_NODE_TYPES = [
  'n8n-nodes-base.webhook',
  'n8n-nodes-base.cron',
  'n8n-nodes-base.schedule',
  'n8n-nodes-base.manualTrigger',
  'n8n-nodes-base.errorTrigger',
  'n8n-nodes-base.workflowTrigger',
];

/**
 * Validate a workflow JSON structure.
 */
export function validateWorkflow(workflow: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic type check
  if (typeof workflow !== 'object' || workflow === null) {
    return { valid: false, errors: ['Workflow must be an object'], warnings: [] };
  }

  const wf = workflow as Partial<N8nWorkflow>;

  // Required fields
  if (!wf.name || typeof wf.name !== 'string') {
    errors.push('Workflow must have a name');
  }

  if (!wf.nodes || !Array.isArray(wf.nodes)) {
    errors.push('Workflow must have a nodes array');
    return { valid: false, errors, warnings };
  }

  if (wf.nodes.length === 0) {
    errors.push('Workflow must have at least one node');
    return { valid: false, errors, warnings };
  }

  // Validate nodes
  const nodeNames = new Set<string>();
  let hasTrigger = false;

  for (const node of wf.nodes) {
    // Check required node fields
    if (!node.name || typeof node.name !== 'string') {
      errors.push('Each node must have a name');
      continue;
    }

    if (!node.type || typeof node.type !== 'string') {
      errors.push(`Node "${node.name}" must have a type`);
      continue;
    }

    // Check for duplicate names
    if (nodeNames.has(node.name)) {
      errors.push(`Duplicate node name: "${node.name}"`);
    }
    nodeNames.add(node.name);

    // Check for trigger node
    if (TRIGGER_NODE_TYPES.includes(node.type)) {
      hasTrigger = true;
    }
  }

  // Warn if no trigger
  if (!hasTrigger) {
    warnings.push(
      'Workflow has no trigger node - it will need to be triggered manually or by another workflow'
    );
  }

  // Warn if too many nodes
  if (wf.nodes.length > 7) {
    warnings.push(
      `Workflow has ${wf.nodes.length} nodes - consider splitting into smaller workflows (recommended: 5-7 nodes)`
    );
  }

  // Validate connections reference existing nodes
  if (wf.connections && typeof wf.connections === 'object') {
    for (const [sourceName, targets] of Object.entries(wf.connections)) {
      if (!nodeNames.has(sourceName)) {
        errors.push(`Connection references non-existent source node: "${sourceName}"`);
      }

      // Check target nodes in connections
      if (targets && typeof targets === 'object' && 'main' in targets) {
        const mainConnections = (targets as { main: unknown[][] }).main;
        if (Array.isArray(mainConnections)) {
          for (const outputConnections of mainConnections) {
            if (Array.isArray(outputConnections)) {
              for (const conn of outputConnections) {
                if (typeof conn === 'object' && conn !== null && 'node' in conn) {
                  const targetNode = (conn as { node: string }).node;
                  if (!nodeNames.has(targetNode)) {
                    errors.push(`Connection references non-existent target node: "${targetNode}"`);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Check for orphan nodes (nodes with no incoming connections, except triggers)
  const connectedNodes = new Set<string>();
  if (wf.connections && typeof wf.connections === 'object') {
    for (const targets of Object.values(wf.connections)) {
      if (targets && typeof targets === 'object' && 'main' in targets) {
        const mainConnections = (targets as { main: unknown[][] }).main;
        if (Array.isArray(mainConnections)) {
          for (const outputConnections of mainConnections) {
            if (Array.isArray(outputConnections)) {
              for (const conn of outputConnections) {
                if (typeof conn === 'object' && conn !== null && 'node' in conn) {
                  connectedNodes.add((conn as { node: string }).node);
                }
              }
            }
          }
        }
      }
    }
  }

  for (const node of wf.nodes) {
    const isTrigger = TRIGGER_NODE_TYPES.includes(node.type);
    const isConnected = connectedNodes.has(node.name);
    const hasOutgoingConnections = wf.connections && node.name in wf.connections;

    if (!isTrigger && !isConnected && hasOutgoingConnections) {
      warnings.push(`Node "${node.name}" has no incoming connections`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Credential requirements by node type
 */
const CREDENTIAL_REQUIREMENTS: Record<string, string> = {
  'n8n-nodes-base.slack': 'Slack',
  'n8n-nodes-base.googleSheets': 'Google Sheets',
  'n8n-nodes-base.airtable': 'Airtable',
  'n8n-nodes-base.notion': 'Notion',
  'n8n-nodes-base.gmail': 'Gmail',
  'n8n-nodes-base.discord': 'Discord',
  'n8n-nodes-base.telegram': 'Telegram',
  'n8n-nodes-base.github': 'GitHub',
  'n8n-nodes-base.jira': 'Jira',
  'n8n-nodes-base.salesforce': 'Salesforce',
  'n8n-nodes-base.stripe': 'Stripe',
  'n8n-nodes-base.twilio': 'Twilio',
};

/**
 * Enhanced validation with node-level details for visual preview
 */
export function validateWorkflowDetailed(workflow: unknown): DetailedValidation {
  const baseResult = validateWorkflow(workflow);

  // Initialize detailed results
  const nodeWarnings = new Map<string, string[]>();
  const credentialGaps: string[] = [];

  // Early return if basic validation failed
  if (typeof workflow !== 'object' || workflow === null) {
    return {
      ...baseResult,
      nodeWarnings,
      credentialGaps,
      complexityScore: 0,
    };
  }

  const wf = workflow as N8nWorkflow;

  if (!wf.nodes || !Array.isArray(wf.nodes)) {
    return {
      ...baseResult,
      nodeWarnings,
      credentialGaps,
      complexityScore: 0,
    };
  }

  // Check each node for specific warnings
  for (const node of wf.nodes) {
    const warnings: string[] = [];

    // Check for credential requirements
    const requiredCred = CREDENTIAL_REQUIREMENTS[node.type];
    if (requiredCred) {
      credentialGaps.push(requiredCred);
      warnings.push(`Needs ${requiredCred} credential`);
    }

    // Check for missing configuration on action nodes
    if (!TRIGGER_NODE_TYPES.includes(node.type)) {
      const hasParams = node.parameters && Object.keys(node.parameters).length > 0;
      if (!hasParams) {
        warnings.push('Missing configuration');
      }
    }

    if (warnings.length > 0) {
      nodeWarnings.set(node.name, warnings);
    }
  }

  // Calculate complexity score (1-10)
  const complexityScore = calculateComplexity(wf);

  return {
    ...baseResult,
    nodeWarnings,
    credentialGaps: [...new Set(credentialGaps)], // Dedupe
    complexityScore,
  };
}

/**
 * Calculate workflow complexity score (1-10)
 */
function calculateComplexity(workflow: N8nWorkflow): number {
  const nodeCount = workflow.nodes?.length ?? 0;
  const hasConditionals = workflow.nodes?.some(
    (n) => n.type === 'n8n-nodes-base.if' || n.type === 'n8n-nodes-base.switch'
  );

  let score = Math.min(nodeCount, 7);
  if (hasConditionals) score += 2;

  return Math.min(score, 10);
}
