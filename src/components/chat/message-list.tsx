'use client';

import { useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';
import { MessageBubble } from './message-bubble';

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps): React.ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-4xl">🤖</div>
        <h2 className="mb-2 text-xl font-semibold">What would you like to automate?</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Describe your workflow in plain English. For example: &quot;When I receive an email with
          an attachment, save it to Google Drive and notify me on Slack.&quot;
        </p>
      </div>
    );
  }

  // Extract text content from message parts
  const getMessageContent = (message: UIMessage): string => {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('');
  };

  // Filter out system messages
  const visibleMessages = messages.filter(
    (m): m is UIMessage & { role: 'user' | 'assistant' } =>
      m.role === 'user' || m.role === 'assistant'
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={getMessageContent(message)}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
