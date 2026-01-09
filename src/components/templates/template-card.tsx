'use client';

import Link from 'next/link';
import type { Template } from '@/lib/templates/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemplateCardProps {
  template: Template;
}

const categoryColors: Record<string, string> = {
  marketing: 'bg-purple-100 text-purple-800',
  sales: 'bg-green-100 text-green-800',
  ops: 'bg-blue-100 text-blue-800',
};

const complexityLabels: Record<string, string> = {
  simple: 'Quick Setup',
  medium: 'Standard',
  sophisticated: 'Advanced',
};

const appIcons: Record<string, string> = {
  webhook: '🔗',
  slack: '💬',
  airtable: '📊',
  schedule: '⏰',
  http: '🌐',
  rss: '📰',
  openai: '✨',
  calculator: '🧮',
  branch: '🔀',
  clock: '🕐',
  database: '🗄️',
  sparkles: '✨',
};

export function TemplateCard({ template }: TemplateCardProps): React.ReactElement {
  return (
    <Link href={`/templates/${template.id}`}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className={categoryColors[template.category]}>
              {template.category}
            </Badge>
            <Badge variant="outline">{complexityLabels[template.complexity]}</Badge>
          </div>
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <CardDescription>{template.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* App Icons */}
          <div className="mb-4 flex gap-2">
            {template.apps.map((app) => (
              <span key={app} className="text-xl" title={app}>
                {appIcons[app] || '📦'}
              </span>
            ))}
          </div>

          {/* Preview Flow */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {template.previewNodes.slice(0, 4).map((node, i) => (
              <span key={node.id} className="flex items-center gap-1">
                <span>{appIcons[node.icon] || '📦'}</span>
                {i < Math.min(template.previewNodes.length, 4) - 1 && (
                  <span className="text-muted-foreground/50">→</span>
                )}
              </span>
            ))}
          </div>

          {/* Setup Time */}
          <p className="mt-4 text-xs text-muted-foreground">⏱️ {template.setupTime} min setup</p>
        </CardContent>
      </Card>
    </Link>
  );
}
