import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getResearchPrompt, parseResearchResult, type ResearchResult } from '@/lib/n8n/prompts';

interface ResearchRequestBody {
  goal: string;
}

interface ResearchResponse {
  result: ResearchResult | null;
  error?: string;
}

export async function POST(request: Request): Promise<NextResponse<ResearchResponse>> {
  try {
    const body = (await request.json()) as ResearchRequestBody;

    if (!body.goal || typeof body.goal !== 'string') {
      return NextResponse.json({ result: null, error: 'Goal is required' }, { status: 400 });
    }

    const systemPrompt = getResearchPrompt(body.goal);

    // Use Claude to analyze the goal and suggest tools
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: 'Analyze the goal and output the JSON recommendation.',
    });

    // Parse the response
    const result = parseResearchResult(text);

    if (!result) {
      console.error('Failed to parse research result:', text);
      return NextResponse.json({ result: null, error: 'Failed to analyze goal' }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      {
        result: null,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
