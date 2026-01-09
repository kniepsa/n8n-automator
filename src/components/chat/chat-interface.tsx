'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export function ChatInterface(): React.ReactElement {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (): void => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
