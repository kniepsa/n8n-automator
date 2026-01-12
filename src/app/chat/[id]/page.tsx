/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatInterfaceWrapper } from '@/components/chat/chat-interface-wrapper';
import type { ConversationWithMessages, ChatPhase } from '@/lib/conversations/types';
import type { WorkflowContext } from '@/lib/n8n/prompts';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({
  params,
}: PageParams): Promise<React.ReactElement> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch conversation
  const convResult = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (convResult.error || !convResult.data) {
    notFound();
  }

  // Type-cast the raw data
  const conversation = convResult.data as {
    id: string;
    user_id: string;
    title: string;
    goal: string | null;
    context: WorkflowContext | null;
    phase: string;
    created_at: string;
    updated_at: string;
  };

  // Fetch messages
  const { data: messagesRaw } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  const conversationData: ConversationWithMessages = {
    id: conversation.id,
    user_id: conversation.user_id,
    title: conversation.title,
    goal: conversation.goal,
    context: conversation.context,
    phase: conversation.phase as ChatPhase,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
    messages: (messagesRaw || []) as ConversationWithMessages['messages'],
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <ChatInterfaceWrapper conversation={conversationData} />
    </div>
  );
}
