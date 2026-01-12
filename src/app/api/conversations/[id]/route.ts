/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// Note: Supabase client returns untyped data without generated DB types
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  ConversationWithMessages,
  StoredMessage,
  UpdateConversationInput,
} from '@/lib/conversations/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get conversation with messages
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<ConversationWithMessages | { error: string }>> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch conversation
  const convResult = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const convError = convResult.error;
  const conversation = convResult.data as {
    id: string;
    user_id: string;
    title: string;
    goal: string | null;
    context: unknown;
    phase: string;
    created_at: string;
    updated_at: string;
  } | null;

  if (convError || !conversation) {
    if (convError?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    console.error('Failed to fetch conversation:', convError);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }

  // Fetch messages
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (msgError) {
    console.error('Failed to fetch messages:', msgError);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  return NextResponse.json({
    ...conversation,
    messages: messages as StoredMessage[],
  } as ConversationWithMessages);
}

// PATCH - Update conversation
export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as UpdateConversationInput;
  const { title, goal, context, phase } = body;

  // Build update object with only defined fields
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (goal !== undefined) updates.goal = goal;
  if (context !== undefined) updates.context = context;
  if (phase !== undefined) updates.phase = phase;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to update conversation:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE - Delete conversation
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to delete conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
