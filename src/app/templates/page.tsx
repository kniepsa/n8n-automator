import { templates } from '@/lib/templates';
import { TemplateGrid } from '@/components/templates/template-grid';

export default function TemplatesPage(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Automation Templates</h1>
        <p className="mt-2 text-muted-foreground">
          Pre-built workflows for marketing, sales, and operations. No coding required.
        </p>
      </div>

      <TemplateGrid templates={templates} />
    </div>
  );
}
