import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage(): React.ReactElement {
  return (
    <div className="flex h-full flex-col bg-background">
      <ChatInterface conversationId={null} />
    </div>
  );
}
