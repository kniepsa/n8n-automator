'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import type { TriggerType, WorkflowContext } from '@/lib/n8n/prompts';

interface ContextQuestionnaireProps {
  onComplete: (context: WorkflowContext) => void;
  availableTools?: string[];
}

const TRIGGER_OPTIONS: { value: TriggerType; label: string; description: string }[] = [
  { value: 'webhook', label: 'Webhook', description: 'Triggered by HTTP request' },
  { value: 'schedule', label: 'Schedule', description: 'Runs on a timer' },
  { value: 'manual', label: 'Manual', description: 'You trigger it' },
  { value: 'event', label: 'Event', description: 'From another app' },
];

const TOOL_OPTIONS = [
  { value: 'slack', label: 'Slack' },
  { value: 'googleSheets', label: 'Google Sheets' },
  { value: 'airtable', label: 'Airtable' },
  { value: 'notion', label: 'Notion' },
  { value: 'gmail', label: 'Gmail' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'discord', label: 'Discord' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'github', label: 'GitHub' },
  { value: 'jira', label: 'Jira' },
  { value: 'trello', label: 'Trello' },
  { value: 'typeform', label: 'Typeform' },
  { value: 'calendly', label: 'Calendly' },
];

export function ContextQuestionnaire({
  onComplete,
  availableTools = [],
}: ContextQuestionnaireProps): React.ReactElement {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [trigger, setTrigger] = useState<TriggerType | null>(null);
  // Pre-select tools that are available (user has credentials for)
  const [tools, setTools] = useState<string[]>(availableTools);

  const hasCredentials = availableTools.length > 0;

  const toggleTool = (value: string): void => {
    setTools((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

  const handleNext = (): void => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        goal,
        trigger: trigger || 'webhook',
        tools,
      });
    }
  };

  const canProceed = (): boolean => {
    if (step === 1) return goal.trim().length > 0;
    if (step === 2) return trigger !== null;
    if (step === 3) return tools.length > 0;
    return false;
  };

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick Setup</h2>
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded ${s <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">What do you want to automate?</span>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Example: Send me a Slack message when a new lead is added to my CRM"
              className="min-h-[100px]"
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <span className="mb-2 block text-sm font-medium">What triggers this workflow?</span>
          <div className="grid grid-cols-2 gap-3">
            {TRIGGER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTrigger(option.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  trigger === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <span className="mb-2 block text-sm font-medium">
            {hasCredentials
              ? 'Which tools do you want to use? (connected tools are pre-selected)'
              : 'Which tools do you use? (select all that apply)'}
          </span>

          {/* Connected tools section */}
          {hasCredentials && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-green-600">Connected in your n8n:</p>
              <div className="flex flex-wrap gap-2">
                {TOOL_OPTIONS.filter((opt) => availableTools.includes(opt.value)).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleTool(option.value)}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
                      tools.includes(option.value)
                        ? 'border-green-500 bg-green-500/10 text-green-700'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                    {tools.includes(option.value) && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other tools section */}
          <div className="space-y-2">
            {hasCredentials && (
              <p className="text-xs font-medium text-muted-foreground">Other tools:</p>
            )}
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.filter((opt) => !availableTools.includes(opt.value)).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleTool(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    tools.includes(option.value)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {hasCredentials
              ? 'Workflows using connected tools will work immediately after deployment'
              : 'This helps us suggest the right nodes for your workflow'}
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canProceed()}>
          {step === 3 ? 'Start chatting' : 'Next'}
        </Button>
      </div>
    </Card>
  );
}
