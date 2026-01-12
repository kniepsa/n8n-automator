'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { UIMessage } from 'ai';
import type { WorkflowContext } from '@/lib/n8n/prompts';
import type { ChatPhase } from './types';

interface UseAutoSaveOptions {
  conversationId: string | null;
  messages: UIMessage[];
  phase: ChatPhase;
  context: WorkflowContext | null;
  goal: string | null;
  onConversationCreated?: (id: string) => void;
  debounceMs?: number;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
}

export function useAutoSave({
  conversationId,
  messages,
  phase,
  context,
  goal,
  onConversationCreated,
  debounceMs = 500,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const lastSavedMessagesCount = useRef(0);
  const lastSavedPhase = useRef<ChatPhase>('goal');
  const lastSavedContext = useRef<WorkflowContext | null>(null);
  const isSaving = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationIdRef = useRef<string | null>(conversationId);

  // Track state for return value
  const isSavingState = useRef(false);
  const lastSavedAt = useRef<Date | null>(null);
  const errorState = useRef<string | null>(null);

  // Update ref when prop changes
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const saveMessages = useCallback(async () => {
    if (isSaving.current) return;

    const currentMessages = messages;
    const currentPhase = phase;
    const currentContext = context;
    const currentGoal = goal;

    // Check if there's anything to save
    const hasNewMessages = currentMessages.length > lastSavedMessagesCount.current;
    const hasPhaseChanged = currentPhase !== lastSavedPhase.current;
    const hasContextChanged =
      JSON.stringify(currentContext) !== JSON.stringify(lastSavedContext.current);

    if (!hasNewMessages && !hasPhaseChanged && !hasContextChanged) {
      return;
    }

    isSaving.current = true;
    isSavingState.current = true;
    errorState.current = null;

    try {
      let activeConversationId = conversationIdRef.current;

      // Create conversation if it doesn't exist and we have messages
      if (!activeConversationId && currentMessages.length > 0) {
        // Generate title from first user message
        const firstUserMessage = currentMessages.find((m) => m.role === 'user');
        const title = firstUserMessage
          ? getTextFromMessage(firstUserMessage).slice(0, 50) +
            (getTextFromMessage(firstUserMessage).length > 50 ? '...' : '')
          : 'New Conversation';

        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            goal: currentGoal,
            context: currentContext,
            phase: currentPhase,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }

        const data = (await response.json()) as { id: string };
        activeConversationId = data.id;
        conversationIdRef.current = data.id;
        onConversationCreated?.(data.id);
      }

      if (!activeConversationId) {
        return;
      }

      // Save new messages
      if (hasNewMessages) {
        const newMessages = currentMessages.slice(lastSavedMessagesCount.current);
        const messagesToSave = newMessages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          parts: m.parts,
        }));

        if (messagesToSave.length > 0) {
          const response = await fetch(`/api/conversations/${activeConversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messagesToSave }),
          });

          if (!response.ok) {
            throw new Error('Failed to save messages');
          }

          lastSavedMessagesCount.current = currentMessages.length;
        }
      }

      // Update conversation metadata if changed
      if (hasPhaseChanged || hasContextChanged) {
        const updates: Record<string, unknown> = {};
        if (hasPhaseChanged) updates.phase = currentPhase;
        if (hasContextChanged) updates.context = currentContext;

        const response = await fetch(`/api/conversations/${activeConversationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update conversation');
        }

        lastSavedPhase.current = currentPhase;
        lastSavedContext.current = currentContext;
      }

      lastSavedAt.current = new Date();
    } catch (err) {
      console.error('Auto-save error:', err);
      errorState.current = err instanceof Error ? err.message : 'Failed to save';
    } finally {
      isSaving.current = false;
      isSavingState.current = false;
    }
  }, [messages, phase, context, goal, onConversationCreated]);

  // Debounced save trigger
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only save when we're in chat phase with messages
    if (phase !== 'chat' && messages.length === 0) {
      return;
    }

    // Set debounce timer
    debounceTimer.current = setTimeout(() => {
      void saveMessages();
    }, debounceMs);

    return (): void => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [messages, phase, context, saveMessages, debounceMs]);

  // Initialize saved state when loading existing conversation
  useEffect(() => {
    if (conversationId && messages.length > 0 && lastSavedMessagesCount.current === 0) {
      // This is a loaded conversation, mark messages as already saved
      lastSavedMessagesCount.current = messages.length;
      lastSavedPhase.current = phase;
      lastSavedContext.current = context;
    }
  }, [conversationId, messages.length, phase, context]);

  return {
    isSaving: isSavingState.current,
    lastSavedAt: lastSavedAt.current,
    error: errorState.current,
  };
}

// Helper to extract text from UIMessage
function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join(' ');
}
