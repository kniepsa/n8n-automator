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

interface CredentialDiscoveryProps {
  onComplete: (availableTools: string[]) => void;
  onSkip: () => void;
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
  oauth: { name: 'OAuth', icon: '🔐' },
};

// Tools we commonly support in workflow generation
const COMMON_TOOLS = [
  'slack',
  'googleSheets',
  'airtable',
  'notion',
  'gmail',
  'hubspot',
  'discord',
  'telegram',
  'github',
  'jira',
  'trello',
  'typeform',
  'calendly',
];

function getToolInfo(tool: string): { name: string; icon: string } {
  return TOOL_INFO[tool] || { name: tool, icon: '📦' };
}

export function CredentialDiscovery({
  onComplete,
  onSkip,
}: CredentialDiscoveryProps): React.ReactElement {
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

  const connectedTools = credentials.map((c) => c.tool);
  const missingCommonTools = COMMON_TOOLS.filter((t) => !connectedTools.includes(t));

  const handleContinue = (): void => {
    onComplete(connectedTools);
  };

  if (loading) {
    return (
      <Card className="mx-auto max-w-2xl p-6">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Checking your n8n setup...</p>
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
            You can still continue, but make sure your n8n has the necessary credentials for the
            tools you want to use.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onSkip}>
              Skip for now
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
        <div>
          <h2 className="text-lg font-semibold">Your Connected Tools</h2>
          <p className="text-sm text-muted-foreground">
            We checked your n8n instance to see what&apos;s available
          </p>
        </div>

        {/* Connected tools */}
        {connectedTools.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">
              ✅ {connectedTools.length} tool{connectedTools.length !== 1 ? 's' : ''} connected
            </p>
            <div className="flex flex-wrap gap-2">
              {credentials.map((cred) => {
                const info = getToolInfo(cred.tool);
                return (
                  <div
                    key={cred.id}
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
        ) : (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-medium text-amber-600">No credentials found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add credentials in your n8n instance to enable workflow automation. Workflows will be
              limited to basic nodes without connected tools.
            </p>
          </div>
        )}

        {/* Not connected tools */}
        {missingCommonTools.length > 0 && connectedTools.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Not connected ({missingCommonTools.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {missingCommonTools.slice(0, 8).map((tool) => {
                const info = getToolInfo(tool);
                return (
                  <div
                    key={tool}
                    className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    <span className="opacity-50">{info.icon}</span>
                    <span>{info.name}</span>
                  </div>
                );
              })}
              {missingCommonTools.length > 8 && (
                <div className="flex items-center rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  +{missingCommonTools.length - 8} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-medium">Why does this matter?</p>
          <p className="mt-1 text-muted-foreground">
            We&apos;ll only suggest workflows using tools you have connected. This ensures your
            automations will work immediately after deployment.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={handleContinue}>
            Continue{connectedTools.length > 0 ? ` with ${connectedTools.length} tools` : ''}
          </Button>
        </div>
      </div>
    </Card>
  );
}
