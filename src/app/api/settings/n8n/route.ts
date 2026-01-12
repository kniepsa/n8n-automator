/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// Note: Supabase client returns untyped data without generated DB types
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptApiKey, decryptApiKey } from '@/lib/crypto';

interface N8nSettings {
  n8n_host: string | null;
  has_api_key: boolean;
}

interface SaveRequest {
  n8nUrl: string;
  n8nApiKey: string;
}

interface TestRequest {
  n8nUrl: string;
  n8nApiKey: string;
}

// GET - Fetch current n8n connection status
export async function GET(): Promise<NextResponse<N8nSettings | { error: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('n8n_host, n8n_api_key_encrypted')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }

  const typedProfile = profile as {
    n8n_host: string | null;
    n8n_api_key_encrypted: string | null;
  } | null;
  return NextResponse.json({
    n8n_host: typedProfile?.n8n_host ?? null,
    has_api_key: !!typedProfile?.n8n_api_key_encrypted,
  });
}

// PUT - Save n8n credentials
export async function PUT(
  request: Request
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as SaveRequest;
  const { n8nUrl, n8nApiKey } = body;

  if (!n8nUrl || !n8nApiKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate URL format
  try {
    new URL(n8nUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Encrypt the API key
  const encryptedApiKey = encryptApiKey(n8nApiKey);

  const { error } = await supabase
    .from('profiles')
    .update({
      n8n_host: n8nUrl.replace(/\/+$/, ''), // Remove trailing slashes
      n8n_api_key_encrypted: encryptedApiKey,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to save n8n settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// POST - Test n8n connection
export async function POST(
  request: Request
): Promise<NextResponse<{ success: boolean; message?: string } | { error: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as TestRequest;
  const { n8nUrl, n8nApiKey } = body;

  if (!n8nUrl || !n8nApiKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate URL format
  let baseUrl: string;
  try {
    const url = new URL(n8nUrl);
    baseUrl = url.origin;
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Test connection by fetching workflows
  try {
    const response = await fetch(`${baseUrl}/api/v1/workflows?limit=1`, {
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Connection successful' });
    }

    if (response.status === 401) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }

    if (response.status === 403) {
      return NextResponse.json({ error: 'API key lacks required permissions' }, { status: 400 });
    }

    return NextResponse.json(
      { error: `Connection failed: ${response.statusText}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('n8n connection test failed:', error);
    return NextResponse.json(
      {
        error:
          'Could not connect to n8n instance. Check the URL and ensure the instance is accessible.',
      },
      { status: 400 }
    );
  }
}

// Helper to get decrypted credentials for a user (used by other API routes)
export async function getN8nCredentials(
  userId: string
): Promise<{ host: string; apiKey: string } | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('n8n_host, n8n_api_key_encrypted')
    .eq('id', userId)
    .single();

  const typedProfile = profile as {
    n8n_host: string | null;
    n8n_api_key_encrypted: string | null;
  } | null;
  if (!typedProfile?.n8n_host || !typedProfile?.n8n_api_key_encrypted) {
    return null;
  }

  try {
    const apiKey = decryptApiKey(typedProfile.n8n_api_key_encrypted);
    return { host: typedProfile.n8n_host, apiKey };
  } catch {
    console.error('Failed to decrypt n8n API key');
    return null;
  }
}
