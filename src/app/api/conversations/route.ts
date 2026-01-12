/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// Note: Supabase client returns untyped data without generated DB types
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  ConversationListItem,
  Conversation,
  CreateConversationInput,
} from '@/lib/conversations/types';

// GET - List user's conversations
export async function GET(): Promise<NextResponse<ConversationListItem[] | { error: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, updated_at, phase')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }

  return NextResponse.json(data as ConversationListItem[]);
}

// POST - Create new conversation
export async function POST(
  request: Request
): Promise<NextResponse<Conversation | { error: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as CreateConversationInput;
  const { title, goal, context, phase } = body;

  const insertResult = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title: title || 'New Conversation',
      goal: goal || null,
      context: context || null,
      phase: phase || 'goal',
    })
    .select()
    .single();

  const error = insertResult.error;

  if (error) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }

  return NextResponse.json(insertResult.data as unknown as Conversation);
}
