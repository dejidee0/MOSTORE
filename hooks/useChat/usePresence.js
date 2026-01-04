// src/hooks/useChat/usePresence.js
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { chatApi } from "@/lib/chat/api";
import { subscriptionManager } from "@/lib/chat/subscriptions";
import { queryKeys } from "@/utils/queryClient";

export function useUserPresence(userId) {
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef(null);

  const query = useQuery({
    queryKey: queryKeys.presence.user(userId),
    queryFn: () => chatApi.getUserPresence(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  useEffect(() => {
    if (!userId) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = subscriptionManager.subscribeToPresence(
      userId,
      (newPresence) => {
        queryClient.setQueryData(queryKeys.presence.user(userId), newPresence);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId, queryClient]);

  return query.data;
}

export function useUpdatePresence() {
  const hasInitialized = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Prevent double execution
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Set initial presence
    chatApi.updatePresence(true);

    // Update every 5 minutes
    intervalRef.current = setInterval(() => {
      chatApi.updatePresence(true);
    }, 5 * 60 * 1000);

    // Handle visibility changes
    const handleVisibilityChange = () => {
      chatApi.updatePresence(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      chatApi.updatePresence(false);

      // Allow reinitialization if component remounts
      hasInitialized.current = false;
    };
  }, []);
}
