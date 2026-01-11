'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  isLoading?: boolean;
}

const EXAMPLE_GOALS = [
  'Send me a Slack message when a new lead is added to my CRM',
  'Post a summary to Discord every Monday morning',
  'Save email attachments to Google Drive',
  'Alert me when a customer cancels their subscription',
];

export function GoalInput({ onSubmit, isLoading = false }: GoalInputProps): React.ReactElement {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal.trim());
    }
  };

  const handleExampleClick = (example: string): void => {
    setGoal(example);
  };

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">What do you want to automate?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe your goal in plain language. We&apos;ll help you find the right tools.
            </p>
          </div>

          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: Send me a Slack message when..."
            className="min-h-[120px] text-base"
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Example goals */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_GOALS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted"
                disabled={isLoading}
              >
                {example.length > 40 ? `${example.slice(0, 40)}...` : example}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!goal.trim() || isLoading} className="min-w-[120px]">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analyzing...
              </span>
            ) : (
              'Find tools'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
