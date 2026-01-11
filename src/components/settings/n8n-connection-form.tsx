'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface N8nConnectionFormProps {
  initialHost: string;
  hasExistingKey: boolean;
}

export function N8nConnectionForm({
  initialHost,
  hasExistingKey,
}: N8nConnectionFormProps): React.ReactElement {
  const [n8nUrl, setN8nUrl] = useState(initialHost);
  const [n8nApiKey, setN8nApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  const isConnected = hasExistingKey && initialHost;

  async function handleTest(): Promise<void> {
    setError('');
    setSuccess('');
    setTestPassed(false);
    setIsTesting(true);

    try {
      const response = await fetch('/api/settings/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n8nUrl, n8nApiKey }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Connection test failed');
        return;
      }

      setSuccess('Connection successful!');
      setTestPassed(true);
    } catch {
      setError('Failed to test connection');
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSave(): Promise<void> {
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings/n8n', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n8nUrl, n8nApiKey }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Failed to save settings');
        return;
      }

      setSuccess('Settings saved successfully!');
      setN8nApiKey('');
      setTestPassed(false);
      router.refresh();
    } catch {
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  const canTest = n8nUrl.trim() !== '' && n8nApiKey.trim() !== '';
  const canSave = testPassed;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        {isConnected ? (
          <Badge variant="default" className="bg-green-600">
            Connected
          </Badge>
        ) : (
          <Badge variant="secondary">Not Connected</Badge>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="n8nUrl" className="text-sm font-medium">
            n8n Instance URL
          </label>
          <Input
            id="n8nUrl"
            type="url"
            placeholder="https://your-n8n.example.com"
            value={n8nUrl}
            onChange={(e) => {
              setN8nUrl(e.target.value);
              setTestPassed(false);
            }}
            disabled={isTesting || isSaving}
          />
          <p className="text-xs text-muted-foreground">
            The base URL of your n8n instance (without /api/v1)
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="n8nApiKey" className="text-sm font-medium">
            API Key
          </label>
          <Input
            id="n8nApiKey"
            type="password"
            placeholder={hasExistingKey ? '••••••••••••••••' : 'Enter your n8n API key'}
            value={n8nApiKey}
            onChange={(e) => {
              setN8nApiKey(e.target.value);
              setTestPassed(false);
            }}
            disabled={isTesting || isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Your API key is encrypted before being stored.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={!canTest || isTesting || isSaving}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button type="button" onClick={handleSave} disabled={!canSave || isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Help Section */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {showHelp ? '▼' : '▶'} How to get your n8n API key
        </button>
        {showHelp && (
          <div className="mt-3 space-y-2 rounded-md bg-muted/50 p-4 text-sm">
            <ol className="list-inside list-decimal space-y-2">
              <li>Open your n8n instance and log in</li>
              <li>
                Go to <strong>Settings → API</strong> (or click your profile picture)
              </li>
              <li>
                Click <strong>Create an API key</strong>
              </li>
              <li>Give it a descriptive name (e.g., &quot;n8n-automator&quot;)</li>
              <li>Copy the generated key and paste it above</li>
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">
              Note: The API key needs read and write access to workflows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
