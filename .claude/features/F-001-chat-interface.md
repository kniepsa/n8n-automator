# F-001: Chat Interface

## Overview

Streaming chat interface for natural language workflow creation.

## Priority

P0 - MVP Required

## User Story

As a user, I want to describe what automation I need in plain English so that I can create n8n workflows without understanding the technical details.

## Acceptance Criteria

- [ ] Chat input field with send button
- [ ] Messages display in conversation format
- [ ] Streaming responses (real-time text appearance)
- [ ] Loading indicator while waiting for response
- [ ] Error handling with user-friendly messages
- [ ] Responsive design (mobile + desktop)
- [ ] Keyboard shortcuts (Enter to send, Shift+Enter for newline)

## Technical Implementation

### Components

```
src/components/chat/
├── chat-interface.tsx    # Main container
├── message-list.tsx      # Conversation display
├── message-input.tsx     # Input field + send
└── message-bubble.tsx    # Individual message
```

### Key Code

```typescript
// Using Vercel AI SDK useChat hook
import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <MessageInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### API Route

```typescript
// src/app/api/chat/route.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: '...',
    messages,
  });

  return result.toDataStreamResponse();
}
```

## Dependencies

- `ai` - Vercel AI SDK
- `@ai-sdk/anthropic` - Claude provider
- `shadcn/ui` - UI components (Button, Input, Card)

## Files to Create/Modify

- `src/components/chat/chat-interface.tsx` - CREATE
- `src/components/chat/message-list.tsx` - CREATE
- `src/components/chat/message-input.tsx` - CREATE
- `src/app/api/chat/route.ts` - CREATE
- `src/app/(dashboard)/chat/page.tsx` - CREATE

## Design Notes

- Use shadcn/ui Card for message bubbles
- User messages aligned right, assistant left
- Monospace font for code/JSON in responses
- Auto-scroll to bottom on new messages
