'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConversationItem } from './conversation-item';
import { useConversations, useConversationActions } from '@/lib/conversations/hooks';

interface ConversationSidebarProps {
  currentId: string | null;
  className?: string;
}

export function ConversationSidebar({
  currentId,
  className,
}: ConversationSidebarProps): React.ReactElement {
  const router = useRouter();
  const { conversations, isLoading, refresh } = useConversations();
  const { deleteConversation } = useConversationActions();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNewChat = (): void => {
    router.push('/chat');
  };

  const handleSelect = (id: string): void => {
    router.push(`/chat/${id}`);
  };

  const handleDelete = async (id: string): Promise<void> => {
    const success = await deleteConversation(id);
    if (success) {
      await refresh();
      // If we deleted the current conversation, go to new chat
      if (id === currentId) {
        router.push('/chat');
      }
    }
  };

  if (isCollapsed) {
    return (
      <aside className={cn('flex w-12 flex-col border-r bg-muted/30', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="m-2"
          aria-label="Expand sidebar"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className={cn('flex w-64 flex-col border-r bg-muted/30', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8"
          aria-label="Collapse sidebar"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button onClick={handleNewChat} className="w-full" size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No conversations yet</p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentId}
                onSelect={() => handleSelect(conv.id)}
                onDelete={() => void handleDelete(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function PlusIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
