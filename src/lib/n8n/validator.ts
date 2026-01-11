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
