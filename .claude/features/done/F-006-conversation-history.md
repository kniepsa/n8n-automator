# F-006: Conversation History

## Overview

Persist chat conversations in Supabase for users to resume and review.

## Priority

P1 - MVP Should Have

## User Story

As a user, I want my chat history saved so I can resume conversations and reference past workflow creations.

## Acceptance Criteria

- [x] Conversations saved to database automatically
- [x] Conversation list in sidebar
- [x] Click to load previous conversation
- [x] New conversation button
- [x] Conversation title auto-generated
- [x] Delete conversation option
- [x] Messages load on conversation select

## Technical Implementation

### Database Tables

```sql
conversations (
  id, user_id, title, created_at, updated_at
)

messages (
  id, conversation_id, role, content, created_at
)
```

### Sidebar Component

```typescript
// src/components/layout/conversation-sidebar.tsx
export function ConversationSidebar() {
  const { conversations } = useConversations();

  return (
    <aside className="w-64 border-r">
      <Button onClick={newConversation}>New Chat</Button>
      {conversations.map(conv => (
        <ConversationItem key={conv.id} {...conv} />
      ))}
    </aside>
  );
}
```

### Auto-Save Messages

```typescript
// In chat API route, save messages after each exchange
await supabase.from('messages').insert([
  { conversation_id, role: 'user', content: userMessage },
  { conversation_id, role: 'assistant', content: assistantResponse },
]);
```

## Files to Create/Modify

- `src/components/layout/conversation-sidebar.tsx` - CREATE
- `src/hooks/use-conversations.ts` - CREATE
- `src/app/api/conversations/route.ts` - CREATE
- `src/app/(dashboard)/chat/[id]/page.tsx` - CREATE
