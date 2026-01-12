'use client';

import type { WorkflowSummaryResult } from '@/lib/workflow/types';
import { cn } from '@/lib/utils';

interface WorkflowSummaryProps {
  summary: WorkflowSummaryResult;
  className?: string;
}

export function WorkflowSummary({ summary, className }: WorkflowSummaryProps): React.ReactElement {
  return (
    <div className={cn('rounded-lg bg-muted/50 p-4', className)}>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{summary.title}</h4>
      <ol className="space-y-1 text-sm text-muted-foreground">
        {summary.steps.map((step, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {summary.credentialRequirements.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Requires:</span>{' '}
            {summary.credentialRequirements.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
