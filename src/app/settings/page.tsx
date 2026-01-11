import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { N8nConnectionForm } from '@/components/settings/n8n-connection-form';

export default async function SettingsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/settings');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('n8n_host, n8n_api_key_encrypted')
    .eq('id', user.id)
    .single();

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>n8n Connection</CardTitle>
          <CardDescription>
            Connect your n8n instance to create workflows directly from the chat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <N8nConnectionForm
            initialHost={profile?.n8n_host ?? ''}
            hasExistingKey={!!profile?.n8n_api_key_encrypted}
          />
        </CardContent>
      </Card>
    </div>
  );
}
