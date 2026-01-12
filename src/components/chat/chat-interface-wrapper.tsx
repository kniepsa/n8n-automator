'use client';

import { ChatInterface } from './chat-interface';
import type { ConversationWithMessages } from '@/lib/conversations/types';

interface ChatInterfaceWrapperProps {
  conversation: ConversationWithMessages;
}

export function ChatInterfaceWrapper({
  conversation,
}: ChatInterfaceWrapperProps): React.ReactElement {
  return (
    <ChatInterface
      conversationId={conversation.id}
      initialMessages={conversation.messages}
      initialPhase={conversation.phase}
      initialContext={conversation.context}
      initialGoal={conversation.goal}
    />
  );
}
