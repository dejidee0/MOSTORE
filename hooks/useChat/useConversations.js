// src/hooks/useChat/useConversations.js
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/chat/api";
import { queryKeys } from "@/components/QueryProvider";

export function useConversations(userId, options = {}) {
  return useQuery({
    queryKey: queryKeys.conversations.all(userId),
    queryFn: () => chatApi.getConversations(userId),
    enabled: !!userId && (options.enabled ?? true),
    staleTime: 30 * 1000,
    // **CRITICAL**: Prevent background refetches that cause undefined flashes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    // Keep data stable during background updates
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
