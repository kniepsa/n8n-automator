'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Template, WizardState } from '@/lib/templates/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WorkflowPreview } from './workflow-preview';

interface TemplateWizardProps {
  template: Template;
}

export function TemplateWizard({ template }: TemplateWizardProps): React.ReactElement {
  const [state, setState] = useState<WizardState>({
    template,
    currentStep: 0,
    values: getDefaultValues(template),
    errors: {},
    isDeploying: false,
  });

  const currentStepData = template.steps[state.currentStep];
  const isLastStep = state.currentStep === template.steps.length - 1;
  const isFirstStep = state.currentStep === 0;

  function getDefaultValues(t: Template): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};
    for (const step of t.steps) {
      for (const field of step.fields) {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      }
    }
    return defaults;
  }

  function handleFieldChange(fieldId: string, value: unknown): void {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [fieldId]: value },
      errors: { ...prev.errors, [fieldId]: '' },
    }));
  }

  function validateCurrentStep(): boolean {
    if (!currentStepData) return true;
    const errors: Record<string, string> = {};
    for (const field of currentStepData.fields) {
      if (field.required && !state.values[field.id]) {
        errors[field.id] = 'This field is required';
      }
    }
    setState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }

  function handleNext(): void {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleDeploy();
      } else {
        setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
      }
    }
  }

  function handleBack(): void {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
  }

  async function handleDeploy(): Promise<void> {
    setState((prev) => ({ ...prev, isDeploying: true }));

    try {
      // Build workflow with user values
      const workflow = buildWorkflow(template, state.values);

      // Call API to deploy
      const response = await fetch('/api/templates/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      });

      const result = (await response.json()) as {
        success: boolean;
        workflowId?: string;
        error?: string;
      };

      setState((prev) => ({
        ...prev,
        isDeploying: false,
        deployResult: result,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isDeploying: false,
        deployResult: { success: false, error: 'Failed to deploy workflow' },
      }));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to templates
        </Link>
        <h1 className="mt-4 text-2xl font-bold">{template.name}</h1>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-2">
          {template.steps.map((step, i) => (
            <div
              key={step.id}
              className={`h-2 flex-1 rounded-full ${
                i <= state.currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Step {state.currentStep + 1} of {template.steps.length}
        </p>
      </div>

      {/* Deploy Result */}
      {state.deployResult && (
        <Card className={state.deployResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardContent className="pt-6">
            {state.deployResult.success ? (
              <div className="text-center">
                <p className="text-2xl">🎉</p>
                <h3 className="mt-2 text-lg font-semibold text-green-700">
                  Workflow Deployed Successfully!
                </h3>
                <p className="mt-2 text-muted-foreground">Your workflow is now active in n8n.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link href="/templates">
                    <Button variant="outline">Create Another</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl">❌</p>
                <h3 className="mt-2 text-lg font-semibold text-red-700">Deployment Failed</h3>
                <p className="mt-2 text-muted-foreground">{state.deployResult.error}</p>
                <Button
                  className="mt-4"
                  onClick={() => setState((p) => ({ ...p, deployResult: undefined }))}
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Wizard Step */}
      {!state.deployResult && currentStepData && (
        <Card>
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStepData.fields.map((field) => (
              <div key={field.id}>
                <label className="mb-2 block text-sm font-medium">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={String(state.values[field.id] || '')}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{field.placeholder}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={String(state.values[field.id] || '')}
                    onChange={(e) =>
                      handleFieldChange(
                        field.id,
                        field.type === 'number' ? Number(e.target.value) : e.target.value
                      )
                    }
                    placeholder={field.placeholder}
                  />
                )}
                {state.errors[field.id] && (
                  <p className="mt-1 text-sm text-red-500">{state.errors[field.id]}</p>
                )}
              </div>
            ))}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={isFirstStep}>
                ← Back
              </Button>
              <Button onClick={handleNext} disabled={state.isDeploying}>
                {state.isDeploying ? (
                  'Deploying...'
                ) : isLastStep ? (
                  <>Deploy Now 🚀</>
                ) : (
                  'Continue →'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {!state.deployResult && (
        <div className="mt-8">
          <h3 className="mb-4 font-semibold">Workflow Preview</h3>
          <WorkflowPreview nodes={template.previewNodes} />
        </div>
      )}
    </div>
  );
}

/**
 * Build the final n8n workflow by replacing placeholders with user values.
 */
function buildWorkflow(
  template: Template,
  values: Record<string, unknown>
): Record<string, unknown> {
  // Deep clone and replace placeholders
  let workflowJson = JSON.stringify(template.workflow);

  for (const [key, value] of Object.entries(values)) {
    workflowJson = workflowJson.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }

  return JSON.parse(workflowJson) as Record<string, unknown>;
}
