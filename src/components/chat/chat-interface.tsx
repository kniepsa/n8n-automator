'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { GoalInput } from './goal-input';
import { ToolSelector } from './tool-selector';
import { CredentialGapCheck } from './credential-gap-check';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type WorkflowContext, type ResearchResult } from '@/lib/n8n/prompts';
import { useAutoSave } from '@/lib/conversations/use-auto-save';
import type { ChatPhase, StoredMessage } from '@/lib/conversations/types';

type QualityMode = 'fast' | 'thorough';

interface ChatInterfaceProps {
  conversationId: string | null;
  initialMessages?: StoredMessage[];
  initialPhase?: ChatPhase;
  initialContext?: WorkflowContext | null;
  initialGoal?: string | null;
}

// Convert stored messages to UIMessage format
function storedToUIMessages(stored: StoredMessage[]): UIMessage[] {
  return stored.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
    createdAt: new Date(msg.created_at),
  }));
}

export function ChatInterface({
  conversationId,
  initialMessages = [],
  initialPhase = 'goal',
  initialContext = null,
  initialGoal = null,
}: ChatInterfaceProps): React.ReactElement {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<QualityMode>('fast');
  const [context, setContext] = useState<WorkflowContext | null>(initialContext);
  const [phase, setPhase] = useState<ChatPhase>(initialPhase);
  const [availableTools, setAvailableTools] = useState<string[]>(initialContext?.tools || []);
  const [pendingGoal, setPendingGoal] = useState<string | null>(null);
  const [goal, setGoal] = useState<string>(initialGoal || '');
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>(initialContext?.tools || []);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const hasSentInitialMessage = useRef(false);

  // Convert initial messages to UIMessage format
  const initialUIMessages = useMemo(() => storedToUIMessages(initialMessages), [initialMessages]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          mode,
          context: context ?? undefined,
          availableTools: availableTools.length > 0 ? availableTools : undefined,
        },
      }),
    [mode, context, availableTools]
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    messages: initialUIMessages,
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Handle conversation creation callback
  const handleConversationCreated = useCallback(
    (id: string) => {
      setCurrentConversationId(id);
      // Update URL without full navigation
      router.replace(`/chat/${id}`, { scroll: false });
    },
    [router]
  );

  // Auto-save integration
  useAutoSave({
    conversationId: currentConversationId,
    messages,
    phase,
    context,
    goal,
    onConversationCreated: handleConversationCreated,
  });

  // Skip to chat phase if loading existing conversation with messages
  useEffect(() => {
    if (conversationId && initialMessages.length > 0 && phase !== 'chat') {
      // This is a loaded conversation, skip directly to chat
      setPhase('chat');
      hasSentInitialMessage.current = true;
    }
  }, [conversationId, initialMessages.length, phase]);

  // Auto-send the goal as first message when entering chat phase
  useEffect(() => {
    if (
      pendingGoal &&
      context &&
      !hasSentInitialMessage.current &&
      !isLoading &&
      phase === 'chat'
    ) {
      hasSentInitialMessage.current = true;
      sendMessage({ text: pendingGoal });
      setPendingGoal(null);
    }
  }, [pendingGoal, context, sendMessage, isLoading, phase]);

  const handleSubmit = (): void => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  // Phase 1: Goal submitted -> Research tools
  const handleGoalSubmit = async (submittedGoal: string): Promise<void> => {
    setGoal(submittedGoal);
    setPhase('researching');
    setResearchError(null);

    try {
      // Call the research API
      const response = await fetch('/api/chat/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: submittedGoal }),
      });

      if (!response.ok) {
        throw new Error('Failed to research tools');
      }

      const data = (await response.json()) as { result: ResearchResult | null; error?: string };

      if (data.error || !data.result) {
        throw new Error(data.error || 'No research results');
      }

      setResearchResult(data.result);
      setPhase('tools');
    } catch (err) {
      console.error('Research error:', err);
      setResearchError(err instanceof Error ? err.message : 'Failed to research tools');
      // Fall back to tools phase with empty recommendations
      setResearchResult({
        recommendations: [],
        suggestedTrigger: 'webhook',
        complexity: 'simple',
        summary: 'Could not analyze goal. Please select tools manually.',
      });
      setPhase('tools');
    }
  };

  // Phase 2: Tools selected -> Check credentials
  const handleToolsSelected = (tools: string[]): void => {
    setSelectedTools(tools);
    setPhase('credentials');
  };

  // Phase 3: Credentials checked -> Start chat
  const handleCredentialsComplete = (connectedTools: string[]): void => {
    setAvailableTools(connectedTools);

    // Build context from collected info
    const workflowContext: WorkflowContext = {
      goal,
      trigger: researchResult?.suggestedTrigger || 'webhook',
      tools: selectedTools,
    };
    setContext(workflowContext);
    setPendingGoal(goal);
    setPhase('chat');
  };

  // Back handlers
  const handleBackToGoal = (): void => {
    setPhase('goal');
    setResearchResult(null);
    setSelectedTools([]);
  };

  const handleBackToTools = (): void => {
    setPhase('tools');
  };

  // Reset to beginning (new conversation)
  const handleReset = (): void => {
    setPhase('goal');
    setGoal('');
    setResearchResult(null);
    setSelectedTools([]);
    setAvailableTools([]);
    setContext(null);
    setPendingGoal(null);
    setCurrentConversationId(null);
    setMessages([]);
    hasSentInitialMessage.current = false;
    // Navigate to fresh chat
    router.push('/chat');
  };

  // Phase 1: Goal input
  if (phase === 'goal' && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <GoalInput onSubmit={handleGoalSubmit} />
      </div>
    );
  }

  // Phase 2: Researching (loading state)
  if (phase === 'researching') {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Card className="mx-auto max-w-2xl p-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div className="text-center">
              <p className="font-medium">Analyzing your goal...</p>
              <p className="text-sm text-muted-foreground">Finding the best tools for you</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Phase 3: Tool selection
  if (phase === 'tools' && researchResult && messages.length === 0) {
    // If no recommendations, show manual fallback
    if (researchResult.recommendations.length === 0) {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <Card className="mx-auto max-w-2xl p-6">
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold">Couldn&apos;t Analyze Goal</h2>
              <p className="text-muted-foreground">
                {researchError || 'We had trouble understanding your goal.'}
              </p>
              <p className="text-sm text-muted-foreground">
                Try rephrasing your automation goal with more detail.
              </p>
              <div className="pt-4">
                <Button onClick={handleBackToGoal}>Try again</Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center p-4">
        <ToolSelector
          researchResult={researchResult}
          onComplete={handleToolsSelected}
          onBack={handleBackToGoal}
        />
      </div>
    );
  }

  // Phase 4: Credential gap check
  if (phase === 'credentials' && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <CredentialGapCheck
          selectedTools={selectedTools}
          onComplete={handleCredentialsComplete}
          onBack={handleBackToTools}
        />
      </div>
    );
  }

  // Phase 5: Chat
  return (
    <div className="flex h-full flex-col">
      {/* Context summary bar */}
      {context && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2 text-xs">
          <span className="font-medium">Context:</span>
          <span className="text-muted-foreground">
            {context.trigger} trigger • {context.tools.length} tools selected
            {availableTools.length > 0 && ` • ${availableTools.length} connected`}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto text-primary hover:underline"
          >
            New workflow
          </button>
        </div>
      )}

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
