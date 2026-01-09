'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { Button } from '@/components/ui/button';

type QualityMode = 'fast' | 'thorough';

export function ChatInterface(): React.ReactElement {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<QualityMode>('fast');

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { mode },
    }),
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

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 border-t border-border bg-background px-4 py-2">
        <Button
          variant={mode === 'fast' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('fast')}
          className="text-xs"
        >
          Fast
        </Button>
        <Button
          variant={mode === 'thorough' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('thorough')}
          className="text-xs"
        >
          Thorough
        </Button>
      </div>

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
