import { notFound } from 'next/navigation';
import { getTemplateById, templates } from '@/lib/templates';
import { TemplateWizard } from '@/components/templates/template-wizard';

interface TemplateDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): Array<{ id: string }> {
  return templates.map((t) => ({ id: t.id }));
}

export default async function TemplateDetailPage({
  params,
}: TemplateDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateWizard template={template} />
    </div>
  );
}
