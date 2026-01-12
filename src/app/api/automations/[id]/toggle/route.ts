import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getN8nCredentials } from '@/app/api/settings/n8n/route';

interface ToggleRequest {
  active: boolean;
}

interface ToggleResponse {
  success: boolean;
  active?: boolean;
  error?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ToggleResponse>> {
  try {
    const supabase = await createClient();
    const { id: workflowId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's n8n credentials
    const credentials = await getN8nCredentials(user.id);

    if (!credentials) {
      return NextResponse.json({ success: false, error: 'n8n not connected' }, { status: 400 });
    }

    // Parse request body
    const body = (await request.json()) as ToggleRequest;
    const { active } = body;

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing active parameter' },
        { status: 400 }
      );
    }

    // Update workflow via n8n REST API
    const response = await fetch(`${credentials.host}/api/v1/workflows/${workflowId}`, {
      method: 'PATCH',
      headers: {
        'X-N8N-API-KEY': credentials.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });

    if (!response.ok) {
      console.error('Failed to toggle workflow:', response.statusText);
      return NextResponse.json(
        { success: false, error: 'Failed to update workflow' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, active });
  } catch (error) {
    console.error('Toggle API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
