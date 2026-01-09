'use client';

import type { WorkflowNode } from '@/lib/templates/types';
import { Card } from '@/components/ui/card';

interface WorkflowPreviewProps {
  nodes: WorkflowNode[];
}

const iconMap: Record<string, string> = {
  webhook: '🔗',
  calculator: '🧮',
  branch: '🔀',
  slack: '💬',
  clock: '⏰',
  database: '🗄️',
  sparkles: '✨',
  rss: '📰',
};

export function WorkflowPreview({ nodes }: WorkflowPreviewProps): React.ReactElement {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl">
                {iconMap[node.icon] || '📦'}
              </div>
              <p className="mt-2 text-center text-sm font-medium">{node.name}</p>
              <p className="max-w-[120px] text-center text-xs text-muted-foreground">
                {node.description}
              </p>
            </div>

            {/* Arrow */}
            {i < nodes.length - 1 && <div className="mx-4 text-2xl text-muted-foreground">→</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}
