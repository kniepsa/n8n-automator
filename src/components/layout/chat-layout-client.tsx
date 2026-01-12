'use client';

import { useParams } from 'next/navigation';
import { ConversationSidebar } from './conversation-sidebar';

interface ChatLayoutClientProps {
  children: React.ReactNode;
}

export function ChatLayoutClient({ children }: ChatLayoutClientProps): React.ReactElement {
  const params = useParams<{ id?: string }>();
  const conversationId = params?.id ?? null;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ConversationSidebar currentId={conversationId} />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
