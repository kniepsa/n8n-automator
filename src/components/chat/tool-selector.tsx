'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ResearchResult } from '@/lib/n8n/prompts';

interface ToolSelectorProps {
  researchResult: ResearchResult;
  onComplete: (selectedTools: string[]) => void;
  onBack: () => void;
}

const IMPORTANCE_BADGES = {
  essential: { label: 'Essential', className: 'bg-red-100 text-red-700' },
  recommended: { label: 'Recommended', className: 'bg-yellow-100 text-yellow-700' },
  optional: { label: 'Optional', className: 'bg-gray-100 text-gray-600' },
};

const CATEGORY_ICONS = {
  trigger: '⚡',
  action: '⚙️',
  storage: '💾',
  communication: '📣',
};

export function ToolSelector({
  researchResult,
  onComplete,
  onBack,
}: ToolSelectorProps): React.ReactElement {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(() => {
    // Pre-select essential tools
    const essential = researchResult.recommendations
      .filter((r) => r.importance === 'essential')
      .map((r) => r.tool);
    return new Set(essential);
  });

  const toggleTool = (tool: string): void => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) {
        next.delete(tool);
      } else {
        next.add(tool);
      }
      return next;
    });
  };

  const handleContinue = (): void => {
    onComplete(Array.from(selectedTools));
  };

  const { recommendations, summary, complexity } = researchResult;

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">Recommended Tools</h2>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
            <span className="capitalize">{complexity}</span> workflow
          </div>
        </div>

        {/* Tool Cards */}
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isSelected = selectedTools.has(rec.tool);
            const badge = IMPORTANCE_BADGES[rec.importance];
            const icon = CATEGORY_ICONS[rec.category];

            return (
              <button
                key={rec.tool}
                type="button"
                onClick={() => toggleTool(rec.tool)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <span className="font-medium">{rec.displayName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{rec.reason}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Needs: {rec.credentialType}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selection Summary */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm">
            <span className="font-medium">{selectedTools.size}</span> tool
            {selectedTools.size !== 1 ? 's' : ''} selected
            {selectedTools.size > 0 && (
              <span className="text-muted-foreground">
                : {Array.from(selectedTools).join(', ')}
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onBack}>
            Change goal
          </Button>
          <Button onClick={handleContinue} disabled={selectedTools.size === 0}>
            Continue with {selectedTools.size} tool{selectedTools.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Card>
  );
}
