'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  ConversationListItem,
  ConversationWithMessages,
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
  CreateMessagesInput,
  StoredMessage,
} from './types';

// ================================
// useConversations - List conversations
// ================================

interface UseConversationsReturn {
  conversations: ConversationListItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/conversations');
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Failed to fetch conversations');
      }

      const data = (await response.json()) as ConversationListItem[];
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refresh: fetchConversations,
  };
}

// ================================
// useConversation - Single conversation with messages
// ================================

interface UseConversationReturn {
  conversation: ConversationWithMessages | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useConversation(id: string | null): UseConversationReturn {
  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!id) {
      setConversation(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Failed to fetch conversation');
      }

      const data = (await response.json()) as ConversationWithMessages;
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchConversation();
  }, [fetchConversation]);

  return {
    conversation,
    isLoading,
    error,
    refresh: fetchConversation,
  };
}

// ================================
// useConversationActions - CRUD mutations
// ================================

interface UseConversationActionsReturn {
  createConversation: (input: CreateConversationInput) => Promise<Conversation | null>;
  updateConversation: (id: string, input: UpdateConversationInput) => Promise<boolean>;
  deleteConversation: (id: string) => Promise<boolean>;
  addMessages: (
    conversationId: string,
    input: CreateMessagesInput
  ) => Promise<StoredMessage[] | null>;
  isLoading: boolean;
  error: string | null;
}

export function useConversationActions(): UseConversationActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(
    async (input: CreateConversationInput): Promise<Conversation | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || 'Failed to create conversation');
        }

        return (await response.json()) as Conversation;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateConversation = useCallback(
    async (id: string, input: UpdateConversationInput): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || 'Failed to update conversation');
        }

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Failed to delete conversation');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMessages = useCallback(
    async (conversationId: string, input: CreateMessagesInput): Promise<StoredMessage[] | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || 'Failed to add messages');
        }

        return (await response.json()) as StoredMessage[];
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createConversation,
    updateConversation,
    deleteConversation,
    addMessages,
    isLoading,
    error,
  };
}
