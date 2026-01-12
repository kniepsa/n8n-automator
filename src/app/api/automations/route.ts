import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getN8nCredentials } from '@/app/api/settings/n8n/route';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface N8nExecution {
  id: string;
  finished: boolean;
  status: 'success' | 'error' | 'waiting' | 'running';
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
}

export interface AutomationItem {
  id: string;
  name: string;
  active: boolean;
  health: 'healthy' | 'failing' | 'unknown' | 'paused';
  lastRunAt: string | null;
  lastRunStatus: 'success' | 'error' | null;
  weeklyRuns: number;
  n8nUrl: string;
}

interface AutomationsResponse {
  automations: AutomationItem[];
  weeklyTotal: number;
  error?: string;
}

export async function GET(): Promise<NextResponse<AutomationsResponse>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { automations: [], weeklyTotal: 0, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's n8n credentials
    const credentials = await getN8nCredentials(user.id);

    if (!credentials) {
      return NextResponse.json({
        automations: [],
        weeklyTotal: 0,
        error: 'n8n not connected. Please connect your n8n instance in settings.',
      });
    }

    // Fetch workflows from n8n REST API
    const workflowsResponse = await fetch(`${credentials.host}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': credentials.apiKey,
      },
    });

    if (!workflowsResponse.ok) {
      console.error('Failed to fetch workflows:', workflowsResponse.statusText);
      return NextResponse.json({
        automations: [],
        weeklyTotal: 0,
        error: 'Failed to connect to n8n. Please check your connection settings.',
      });
    }

    const workflowsData = (await workflowsResponse.json()) as { data: N8nWorkflow[] };
    const workflows = workflowsData.data || [];

    // Calculate week ago timestamp
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    // Fetch executions for all workflows (last 7 days)
    const executionsResponse = await fetch(
      `${credentials.host}/api/v1/executions?status=finished,error,success&limit=100`,
      {
        headers: {
          'X-N8N-API-KEY': credentials.apiKey,
        },
      }
    );

    let allExecutions: N8nExecution[] = [];
    if (executionsResponse.ok) {
      const executionsData = (await executionsResponse.json()) as { data: N8nExecution[] };
      allExecutions = executionsData.data || [];
    }

    // Build automation items with health and impact metrics
    const automations: AutomationItem[] = workflows.map((workflow) => {
      const workflowExecutions = allExecutions.filter((e) => e.workflowId === workflow.id);
      const weeklyExecutions = workflowExecutions.filter(
        (e) => e.startedAt && e.startedAt >= weekAgoISO
      );

      // Get last execution
      const lastExecution = workflowExecutions[0]; // API returns newest first

      // Determine health
      let health: AutomationItem['health'] = 'unknown';
      if (!workflow.active) {
        health = 'paused';
      } else if (lastExecution) {
        health = lastExecution.status === 'success' ? 'healthy' : 'failing';
      }

      return {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        health,
        lastRunAt: lastExecution?.startedAt || null,
        lastRunStatus:
          lastExecution?.status === 'success' || lastExecution?.status === 'error'
            ? lastExecution.status
            : null,
        weeklyRuns: weeklyExecutions.length,
        n8nUrl: `${credentials.host}/workflow/${workflow.id}`,
      };
    });

    // Calculate weekly total
    const weeklyTotal = automations.reduce((sum, a) => sum + a.weeklyRuns, 0);

    return NextResponse.json({
      automations,
      weeklyTotal,
    });
  } catch (error) {
    console.error('Automations API error:', error);
    return NextResponse.json(
      {
        automations: [],
        weeklyTotal: 0,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
