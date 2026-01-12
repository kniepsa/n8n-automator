'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pause, Play, Sparkles } from 'lucide-react';
import type { AutomationItem } from '@/app/api/automations/route';

interface AutomationCardProps {
  automation: AutomationItem;
  onToggle: (id: string, active: boolean) => Promise<void>;
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function getHealthBadge(health: AutomationItem['health']): {
  label: string;
  className: string;
} {
  switch (health) {
    case 'healthy':
      return { label: 'Healthy', className: 'bg-green-100 text-green-800 border-green-200' };
    case 'failing':
      return { label: 'Needs attention', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'paused':
      return { label: 'Paused', className: 'bg-gray-100 text-gray-600 border-gray-200' };
    default:
      return { label: 'Unknown', className: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
}

export function AutomationCard({ automation, onToggle }: AutomationCardProps): React.ReactElement {
  const [isToggling, setIsToggling] = useState(false);
  const [localActive, setLocalActive] = useState(automation.active);

  const healthBadge = getHealthBadge(localActive ? automation.health : 'paused');

  async function handleToggle(): Promise<void> {
    setIsToggling(true);
    try {
      await onToggle(automation.id, !localActive);
      setLocalActive(!localActive);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium leading-tight">{automation.name}</CardTitle>
          <Badge className={healthBadge.className} variant="outline">
            {healthBadge.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Last run {formatRelativeTime(automation.lastRunAt)}
        </p>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium">
            {automation.weeklyRuns} run{automation.weeklyRuns !== 1 ? 's' : ''} this week
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={isToggling}
          className="flex-1"
        >
          {localActive ? (
            <>
              <Pause className="mr-1 h-3 w-3" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-1 h-3 w-3" />
              Resume
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={automation.n8nUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1 h-3 w-3" />
            n8n
          </a>
        </Button>
        <Button variant="ghost" size="sm" asChild title="Coming soon: Edit with AI">
          <a href={`/chat?improve=${automation.id}`}>
            <Sparkles className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
