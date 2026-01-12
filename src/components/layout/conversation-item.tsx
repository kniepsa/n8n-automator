'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ConversationListItem, ChatPhase } from '@/lib/conversations/types';

interface ConversationItemProps {
  conversation: ConversationListItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const PHASE_LABELS: Record<ChatPhase, string> = {
  goal: 'Draft',
  researching: 'Analyzing',
  tools: 'Selecting',
  credentials: 'Setup',
  chat: 'Active',
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps): React.ReactElement {
  return (
    <div
      className={cn(
        'group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="w-full truncate font-medium">{conversation.title}</span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getRelativeTime(conversation.updated_at)}</span>
          {conversation.phase !== 'chat' && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
              {PHASE_LABELS[conversation.phase]}
            </span>
          )}
        </span>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete conversation"
      >
        <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }): React.ReactElement {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
