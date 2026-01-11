'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Credential {
  id: string;
  name: string;
  type: string;
  tool: string;
}

interface CredentialGapCheckProps {
  selectedTools: string[];
  onComplete: (availableTools: string[]) => void;
  onBack: () => void;
}

// Map tool IDs to display names and icons
const TOOL_INFO: Record<string, { name: string; icon: string }> = {
  slack: { name: 'Slack', icon: '💬' },
  googleSheets: { name: 'Google Sheets', icon: '📊' },
  airtable: { name: 'Airtable', icon: '🗄️' },
  notion: { name: 'Notion', icon: '📝' },
  gmail: { name: 'Gmail', icon: '📧' },
  hubspot: { name: 'HubSpot', icon: '🎯' },
  salesforce: { name: 'Salesforce', icon: '☁️' },
  stripe: { name: 'Stripe', icon: '💳' },
  discord: { name: 'Discord', icon: '🎮' },
  telegram: { name: 'Telegram', icon: '✈️' },
  github: { name: 'GitHub', icon: '🐙' },
  jira: { name: 'Jira', icon: '📋' },
  trello: { name: 'Trello', icon: '📌' },
  typeform: { name: 'Typeform', icon: '📝' },
  calendly: { name: 'Calendly', icon: '📅' },
  twilio: { name: 'Twilio', icon: '📱' },
  sendgrid: { name: 'SendGrid', icon: '📨' },
  mailchimp: { name: 'Mailchimp', icon: '🐵' },
  asana: { name: 'Asana', icon: '✅' },
  zoom: { name: 'Zoom', icon: '📹' },
  http: { name: 'HTTP', icon: '🌐' },
};

function getToolInfo(tool: string): { name: string; icon: string } {
  return TOOL_INFO[tool] || { name: tool, icon: '📦' };
}

export function CredentialGapCheck({
  selectedTools,
  onComplete,
  onBack,
}: CredentialGapCheckProps): React.ReactElement {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async (): Promise<void> => {
      try {
        const response = await fetch('/api/n8n/credentials');
        const data = (await response.json()) as { credentials: Credential[]; error?: string };

        if (data.error) {
          setError(data.error);
        } else {
          setCredentials(data.credentials);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check credentials');
      } finally {
        setLoading(false);
      }
    };

    void fetchCredentials();
  }, []);

  const availableTools = credentials.map((c) => c.tool);
  const connectedSelected = selectedTools.filter((t) => availableTools.includes(t));
  const missingSelected = selectedTools.filter((t) => !availableTools.includes(t));
  const allConnected = missingSelected.length === 0;

  const handleContinue = (): void => {
    onComplete(availableTools);
  };

  if (loading) {
    return (
      <Card className="mx-auto max-w-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Checking your credentials...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <span className="text-xl">⚠️</span>
            <h2 className="text-lg font-semibold">Couldn&apos;t Check Credentials</h2>
          </div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            You can still continue. Make sure your n8n has credentials for the tools you selected.
          </p>
          <div className="flex justify-between gap-2 pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={() => onComplete([])}>Continue anyway</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {allConnected ? 'All Tools Connected!' : 'Credential Check'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {allConnected
              ? 'Your workflow will work immediately after deployment'
              : 'Some tools need credentials in your n8n'}
          </p>
        </div>

        {/* Status Banner */}
        {allConnected ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-medium text-green-700">Ready to go!</p>
                <p className="text-sm text-green-600/80">
                  All {selectedTools.length} selected tools have credentials configured.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-amber-700">
                  {missingSelected.length} tool{missingSelected.length !== 1 ? 's' : ''} need
                  credentials
                </p>
                <p className="text-sm text-amber-600/80">
                  The workflow will deploy, but these tools won&apos;t work until configured.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connected Tools */}
        {connectedSelected.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">
              ✅ Connected ({connectedSelected.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {connectedSelected.map((tool) => {
                const info = getToolInfo(tool);
                return (
                  <div
                    key={tool}
                    className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm"
                  >
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                    <span className="text-green-600">✓</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Tools */}
        {missingSelected.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-600">
              ⚠️ Need credentials ({missingSelected.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {missingSelected.map((tool) => {
                const info = getToolInfo(tool);
                return (
                  <div
                    key={tool}
                    className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm"
                  >
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                    <span className="text-amber-600">✗</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              You can add credentials in your n8n instance under Settings → Credentials
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>
            Change tools
          </Button>
          <Button onClick={handleContinue}>
            {allConnected
              ? 'Start building'
              : `Continue with ${connectedSelected.length} tool${connectedSelected.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
