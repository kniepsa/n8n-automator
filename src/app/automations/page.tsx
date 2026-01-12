'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AutomationCard } from '@/components/automations/automation-card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { AutomationItem } from '@/app/api/automations/route';

interface AutomationsResponse {
  automations: AutomationItem[];
  weeklyTotal: number;
  error?: string;
}

export default function AutomationsPage(): React.ReactElement {
  const router = useRouter();
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchAutomations(): Promise<void> {
    try {
      const response = await fetch('/api/automations');
      const data = (await response.json()) as AutomationsResponse;

      if (data.error) {
        setError(data.error);
        setAutomations([]);
      } else {
        setAutomations(data.automations);
        setWeeklyTotal(data.weeklyTotal);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load automations');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void fetchAutomations();
  }, []);

  async function handleRefresh(): Promise<void> {
    setIsRefreshing(true);
    await fetchAutomations();
  }

  async function handleToggle(id: string, active: boolean): Promise<void> {
    const response = await fetch(`/api/automations/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle automation');
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state (n8n not connected)
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">My Automations</h1>
        <p className="mb-8 text-muted-foreground">
          See all your workflows and their status at a glance.
        </p>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={() => router.push('/settings')}>Connect n8n</Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (automations.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">My Automations</h1>
        <p className="mb-8 text-muted-foreground">
          See all your workflows and their status at a glance.
        </p>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mb-4 text-4xl">🤖</div>
          <h2 className="mb-2 text-xl font-semibold">No automations yet</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Your first automation is just a chat away. Describe what you want to automate and
            we&apos;ll build it for you.
          </p>
          <Button onClick={() => router.push('/chat')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Building
          </Button>
        </div>
      </div>
    );
  }

  // Calculate health summary
  const healthyCount = automations.filter((a) => a.health === 'healthy').length;
  const allHealthy = healthyCount === automations.length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">My Automations</h1>
          <p className="text-muted-foreground">
            {automations.length} workflow{automations.length !== 1 ? 's' : ''} running
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Health summary banner */}
      {allHealthy && automations.length > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">All systems healthy</span>
        </div>
      )}

      {/* Weekly impact summary */}
      {weeklyTotal > 0 && (
        <div className="mb-6 rounded-lg bg-muted/50 p-4">
          <p className="text-lg font-medium">
            Your automations ran <span className="text-primary">{weeklyTotal} times</span> this week
          </p>
        </div>
      )}

      {/* Automations grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {automations.map((automation) => (
          <AutomationCard key={automation.id} automation={automation} onToggle={handleToggle} />
        ))}
      </div>

      {/* Build more CTA */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => router.push('/chat')}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Build another automation
        </Button>
      </div>
    </div>
  );
}
