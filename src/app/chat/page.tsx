import type { Metadata } from 'next';
import { ChatInterface } from '@/components/chat/chat-interface';

export const metadata: Metadata = {
  title: 'Chat | n8n Automator',
  description: 'Create n8n workflows with AI assistance',
};

export default function ChatPage(): React.ReactElement {
  return (
    <main className="flex h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">n8n Automator</h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </main>
  );
}
