'use client';

import type { ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: Error | undefined;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  error,
}: MessageInputProps): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="border-t bg-background px-4 py-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        {error && (
          <div className="mb-3 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Something went wrong. Please try again.
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your automation..."
            disabled={isLoading}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[200px] resize-none',
              'focus-visible:ring-2 focus-visible:ring-primary'
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!value.trim() || isLoading}
            className="h-11 w-11 shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border px-1 py-0.5">Enter</kbd> to send,{' '}
          <kbd className="rounded border px-1 py-0.5">Shift + Enter</kbd> for new line
        </p>
      </form>
    </div>
  );
}
