import type { Metadata } from 'next';
import { ChatLayoutClient } from '@/components/layout/chat-layout-client';

export const metadata: Metadata = {
  title: 'Chat | n8n Automator',
  description: 'Create n8n workflows with AI assistance',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <ChatLayoutClient>{children}</ChatLayoutClient>;
}
