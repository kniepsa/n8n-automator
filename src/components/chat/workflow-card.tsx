'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface WorkflowCardProps {
  workflow: N8nWorkflow;
}

interface DeployResult {
  success: boolean;
  workflowId?: string;
  workflowUrl?: string;
  error?: string;
}

const NODE_ICONS: Record<string, string> = {
  'n8n-nodes-base.webhook': '🔗',
  'n8n-nodes-base.cron': '⏰',
  'n8n-nodes-base.slack': '💬',
  'n8n-nodes-base.googleSheets': '📊',
  'n8n-nodes-base.airtable': '🗄️',
  'n8n-nodes-base.set': '✏️',
  'n8n-nodes-base.if': '🔀',
  'n8n-nodes-base.httpRequest': '🌐',
  'n8n-nodes-base.function': '⚡',
  'n8n-nodes-base.errorTrigger': '🚨',
  'n8n-nodes-base.code': '💻',
  'n8n-nodes-base.emailSend': '📧',
  'n8n-nodes-base.notion': '📝',
};

function getNodeIcon(type: string): string {
  return NODE_ICONS[type] || '📦';
}

function getNodeDisplayName(type: string): string {
  // Extract node name from type like 'n8n-nodes-base.slack' -> 'Slack'
  const parts = type.split('.');
  const name = parts[parts.length - 1] ?? type;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getTriggerInstructions(nodes: N8nNode[]): string {
  // Find the trigger node and return appropriate test instructions
  const triggerNode = nodes.find((n) =>
    [
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.cron',
      'n8n-nodes-base.schedule',
      'n8n-nodes-base.manualTrigger',
    ].includes(n.type)
  );

  if (!triggerNode) {
    return 'Run the workflow manually in n8n to test';
  }

  switch (triggerNode.type) {
    case 'n8n-nodes-base.webhook':
      return 'Test: Send a request to the webhook URL shown in n8n';
    case 'n8n-nodes-base.cron':
    case 'n8n-nodes-base.schedule':
      return 'Test: Wait for the scheduled time or run manually in n8n';
    case 'n8n-nodes-base.manualTrigger':
      return 'Test: Click "Execute Workflow" in n8n';
    default:
      return 'Test: Trigger the workflow from n8n';
  }
}

export function WorkflowCard({ workflow }: WorkflowCardProps): React.ReactElement {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [showJson, setShowJson] = useState(false);

  const nodeCount = workflow.nodes.length;
  const nodeCountColor =
    nodeCount <= 5 ? 'bg-green-500' : nodeCount <= 7 ? 'bg-yellow-500' : 'bg-red-500';

  const handleDeploy = async (): Promise<void> => {
    setIsDeploying(true);
    setDeployResult(null);

    try {
      const response = await fetch('/api/templates/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      });

      const result = (await response.json()) as DeployResult;
      setDeployResult(result);
    } catch (error) {
      setDeployResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyJson = async (): Promise<void> => {
    await navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-medium">{workflow.name}</span>
        </div>
        <Badge className={`${nodeCountColor} text-white`}>{nodeCount} nodes</Badge>
      </div>

      {/* Visual preview */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-4">
        {workflow.nodes.map((node, i) => (
          <div key={node.name} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-xl">
                {getNodeIcon(node.type)}
              </div>
              <p className="mt-1 max-w-[80px] truncate text-center text-xs font-medium">
                {node.name}
              </p>
              <p className="text-[10px] text-muted-foreground">{getNodeDisplayName(node.type)}</p>
            </div>
            {i < workflow.nodes.length - 1 && <div className="mx-2 text-muted-foreground">→</div>}
          </div>
        ))}
      </div>

      {/* Deploy result */}
      {deployResult && (
        <div
          className={`mx-4 mb-4 rounded-lg p-4 text-sm ${
            deployResult.success ? 'bg-green-500/10' : 'bg-red-500/10 text-red-600'
          }`}
        >
          {deployResult.success ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-medium text-green-600">
                <span>✅</span>
                <span>Deployed to n8n!</span>
              </div>

              <div className="space-y-2 text-muted-foreground">
                {deployResult.workflowUrl && (
                  <a
                    href={deployResult.workflowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <span>→</span>
                    <span>Open in n8n</span>
                  </a>
                )}

                <div className="flex items-center gap-2">
                  <span>→</span>
                  <span>Remember to activate the workflow in n8n</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>→</span>
                  <span>{getTriggerInstructions(workflow.nodes)}</span>
                </div>
              </div>
            </div>
          ) : (
            <>Deploy failed: {deployResult.error}</>
          )}
        </div>
      )}

      {/* JSON toggle */}
      {showJson && (
        <div className="mx-4 mb-4">
          <pre className="max-h-60 overflow-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
            <code>{JSON.stringify(workflow, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-border p-4">
        <Button
          onClick={handleDeploy}
          disabled={isDeploying || deployResult?.success}
          className="flex-1"
        >
          {isDeploying ? 'Deploying...' : deployResult?.success ? 'Deployed' : 'Deploy to n8n'}
        </Button>
        <Button variant="outline" onClick={() => setShowJson(!showJson)}>
          {showJson ? 'Hide' : 'JSON'}
        </Button>
        <Button variant="outline" onClick={handleCopyJson}>
          Copy
        </Button>
      </div>
    </Card>
  );
}

/**
 * Detect if a string contains a valid n8n workflow JSON.
 * Returns the parsed workflow if found, null otherwise.
 */
export function detectWorkflowJson(content: string): N8nWorkflow | null {
  // Look for JSON code blocks first
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonString = codeBlockMatch?.[1] ?? content;

  try {
    // Try to find and parse JSON object
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (!jsonMatch?.[0]) return null;

    const parsed = JSON.parse(jsonMatch[0]) as unknown;

    // Validate it's a workflow structure
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'name' in parsed &&
      'nodes' in parsed &&
      Array.isArray((parsed as { nodes: unknown }).nodes)
    ) {
      const workflow = parsed as N8nWorkflow;
      // Check that nodes have the expected structure
      const firstNode = workflow.nodes[0];
      if (workflow.nodes.length > 0 && firstNode?.type) {
        return workflow;
      }
    }
  } catch {
    // Not valid JSON
  }

  return null;
}
