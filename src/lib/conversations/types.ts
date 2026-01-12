import type { UIMessage } from 'ai';
import type { WorkflowContext } from '@/lib/n8n/prompts';

export type ChatPhase = 'goal' | 'researching' | 'tools' | 'credentials' | 'chat';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  goal: string | null;
  context: WorkflowContext | null;
  phase: ChatPhase;
  created_at: string;
  updated_at: string;
}

export interface StoredMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  parts: UIMessage['parts'];
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: StoredMessage[];
}

export interface ConversationListItem {
  id: string;
  title: string;
  updated_at: string;
  phase: ChatPhase;
}

export interface CreateConversationInput {
  title?: string;
  goal?: string;
  context?: WorkflowContext;
  phase?: ChatPhase;
}

export interface UpdateConversationInput {
  title?: string;
  goal?: string;
  context?: WorkflowContext;
  phase?: ChatPhase;
}

export interface CreateMessagesInput {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    parts: UIMessage['parts'];
  }>;
}
