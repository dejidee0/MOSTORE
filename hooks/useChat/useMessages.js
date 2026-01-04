// src/hooks/useChat/useMessages.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { chatApi } from "@/lib/chat/api";
import { subscriptionManager } from "@/lib/chat/subscriptions";
import { queryKeys } from "@/utils/queryClient";

export function useMessages(conversationId, options = {}) {
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef(null);

  const query = useQuery({
    queryKey: queryKeys.messages.all(conversationId),
    queryFn: () => chatApi.getMessages(conversationId),
    enabled: !!conversationId && (options.enabled ?? true),
    staleTime: 10 * 1000,
    ...options,
  });

  useEffect(() => {
    if (!conversationId) return;

    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to new messages
    unsubscribeRef.current = subscriptionManager.subscribeToMessages(
      conversationId,
      (newMessage) => {
        queryClient.setQueryData(
          queryKeys.messages.all(conversationId),
          (old = []) => {
            // Prevent duplicates
            if (old.some((m) => m.id === newMessage.id)) return old;
            return [...old, newMessage];
          }
        );

        // Invalidate conversations to update last message
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.all(),
          refetchType: "none", // Don't trigger refetch, just mark as stale
        });
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [conversationId, queryClient]);

  return query;
}
