'use client';

import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps): React.ReactElement {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {content.split('```').map((part, index) => {
            if (index % 2 === 1) {
              // Code block
              const lines = part.split('\n');
              const language = lines[0];
              const code = lines.slice(1).join('\n');
              return (
                <pre
                  key={index}
                  className="my-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-100"
                >
                  {language && <div className="mb-2 text-xs text-zinc-500">{language}</div>}
                  <code>{code || part}</code>
                </pre>
              );
            }
            // Regular text - handle inline code
            return part.split('`').map((segment, segIndex) => {
              if (segIndex % 2 === 1) {
                return (
                  <code
                    key={`${index}-${segIndex}`}
                    className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-200"
                  >
                    {segment}
                  </code>
                );
              }
              return <span key={`${index}-${segIndex}`}>{segment}</span>;
            });
          })}
        </div>
      </div>
    </div>
  );
}
