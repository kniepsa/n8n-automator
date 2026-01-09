'use client';

import { useState } from 'react';
import type { Template, TemplateCategory } from '@/lib/templates/types';
import { TemplateCard } from './template-card';
import { Button } from '@/components/ui/button';

interface TemplateGridProps {
  templates: Template[];
}

const categories: Array<{ value: TemplateCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All Templates' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'ops', label: 'Operations' },
];

export function TemplateGrid({ templates }: TemplateGridProps): React.ReactElement {
  const [filter, setFilter] = useState<TemplateCategory | 'all'>('all');

  const filteredTemplates =
    filter === 'all' ? templates : templates.filter((t) => t.category === filter);

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={filter === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No templates found in this category.
        </p>
      )}
    </div>
  );
}
