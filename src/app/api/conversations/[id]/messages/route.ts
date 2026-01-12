/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// Note: Supabase client returns untyped data without generated DB types
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateMessagesInput, StoredMessage } from '@/lib/conversations/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Add messages to conversation (batch insert)
export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<StoredMessage[] | { error: string }>> {
  const { id: conversationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify conversation belongs to user
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const body = (await request.json()) as CreateMessagesInput;
  const { messages } = body;

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  // Prepare messages for insert
  const messagesToInsert = messages.map((msg) => ({
    conversation_id: conversationId,
    role: msg.role,
    parts: msg.parts,
  }));

  const { data, error } = await supabase.from('messages').insert(messagesToInsert).select();

  if (error) {
    console.error('Failed to insert messages:', error);
    return NextResponse.json({ error: 'Failed to save messages' }, { status: 500 });
  }

  return NextResponse.json(data as StoredMessage[]);
}
