import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { n8nTools, isN8nConfigured } from '@/lib/n8n';
import {
  getSystemPromptWithContext,
  SYSTEM_PROMPT_NO_N8N,
  type QualityMode,
  type WorkflowContext,
} from '@/lib/n8n/prompts';

interface ChatRequestBody {
  messages: UIMessage[];
  mode?: QualityMode;
  context?: WorkflowContext;
  availableTools?: string[];
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as ChatRequestBody;
  const { messages, mode = 'fast', context, availableTools } = body;

  const n8nConfigured = isN8nConfigured();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: n8nConfigured
      ? getSystemPromptWithContext(mode, context, availableTools)
      : SYSTEM_PROMPT_NO_N8N,
    messages: await convertToModelMessages(messages),
    tools: n8nConfigured ? n8nTools : {},
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
