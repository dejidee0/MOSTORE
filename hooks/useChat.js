import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/chat";
import { useEffect, useState, useRef } from "react";

// ========== PRESENCE HOOKS ==========

export function useUserPresence(userId) {
  const [presence, setPresence] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    // Initial fetch
    chatApi.getUserPresence(userId).then((data) => {
      if (mounted && data) setPresence(data);
    });

    // Subscribe to real-time changes
    const channel = chatApi.subscribeToPresence(userId, (newPresence) => {
      if (mounted) setPresence(newPresence);
    });

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [userId]);

  return presence;
}

export function useUpdatePresence() {
  const hasUpdated = useRef(false);

  useEffect(() => {
    // Prevent double execution in Strict Mode
    if (hasUpdated.current) return;
    hasUpdated.current = true;

    // Set user as online
    chatApi.updatePresence(true);

    // Update every 5 minutes (reduced from 2 minutes)
    const interval = setInterval(() => {
      chatApi.updatePresence(true);
    }, 5 * 60 * 1000);

    // Handle visibility changes
    const handleVisibilityChange = () => {
      chatApi.updatePresence(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      chatApi.updatePresence(false);
    };
  }, []);
}
export async function navigateToConversation(
  productId,
  vendorId,
  router,
  addToast
) {
  try {
    // Show loading toast if available
    addToast?.("Loading conversation...", "info");

    // Get or create the conversation
    const conversation = await chatApi.getOrCreateConversation(
      productId,
      vendorId
    );

    // Redirect to messages page with conversation ID
    router.push(`/messages?id=${conversation.id}`);
  } catch (error) {
    console.error("Failed to open conversation:", error);
    addToast?.(error.message || "Failed to open conversation", "error");
  }
}

// ========== CONVERSATION HOOKS ==========

export function useConversations(userId) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => chatApi.getConversations(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// ========== MESSAGE HOOKS ==========

export function useMessages(conversationId) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef(null);

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => {
      if (!conversationId) return [];
      return chatApi.getMessages(conversationId);
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    retry: 1, // Only retry once
    retryDelay: 1000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    // Prevent duplicate subscriptions
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const channel = chatApi.subscribeToMessages(
      conversationId,
      (newMessage) => {
        queryClient.setQueryData(["messages", conversationId], (old) => {
          if (!old) return [newMessage];
          if (old.some((m) => m.id === newMessage.id)) return old;
          return [...old, newMessage];
        });

        // Invalidate conversations list
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    );

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [conversationId, queryClient]);

  return query;
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, messageType = "text" }) =>
      chatApi.sendMessage(conversationId, content, messageType),
    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationId],
      });

      const previousMessages = queryClient.getQueryData([
        "messages",
        conversationId,
      ]);

      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData(["messages", conversationId], (old) => [
        ...(old || []),
        {
          id: tempId,
          content,
          sender_id: "current-user",
          created_at: new Date().toISOString(),
          is_read: false,
          message_type: "text",
          _isOptimistic: true,
        },
      ]);

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["messages", conversationId],
        context.previousMessages
      );
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return [newMessage];
        const filtered = old.filter((m) => !m._isOptimistic);
        if (filtered.some((m) => m.id === newMessage.id)) return filtered;
        return [...filtered, newMessage];
      });

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ========== CONVERSATION HOOKS ==========

/**
 * Hook to get or create a conversation
 * @param {number} productId - Product ID
 * @param {string} vendorId - Vendor's user ID
 * @returns {Object} React Query mutation result
 */
export function useConversation(productId, vendorId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatApi.getOrCreateConversation(productId, vendorId),
    // Don't retry on error to prevent infinite loops
    retry: false,
    onSuccess: (data) => {
      // Cache the conversation
      queryClient.setQueryData(["conversation", data.id], data);

      // Update conversations list with the new/existing conversation
      queryClient.setQueryData(["conversations", data.customer_id], (old) => {
        if (!old) return [data];

        // Check if conversation already exists in list
        const exists = old.some((conv) => conv.id === data.id);
        if (exists) {
          return old.map((conv) => (conv.id === data.id ? data : conv));
        }

        return [data, ...old];
      });
    },
    onError: (error) => {
      console.error("Failed to create/get conversation:", error);
    },
  });
}
/**
 * Hook to update conversation status
 * @returns {Object} React Query mutation result
 */
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, status }) =>
      chatApi.updateConversationStatus(conversationId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["conversation", variables.conversationId]);
    },
  });
}

// ========== MESSAGE HOOKS ==========

/**
 * Hook to mark messages as read
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - Current user's ID
 * @returns {Object} React Query mutation result
 */
export function useMarkAsRead(conversationId, userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatApi.markMessagesAsRead(conversationId, userId),
    onSuccess: () => {
      // Update conversations list to reflect read status
      queryClient.invalidateQueries(["conversations", userId]);

      // Update messages to show read status
      queryClient.invalidateQueries(["messages", conversationId]);
    },
  });
}

/**
 * Hook to delete a message
 * @returns {Object} React Query mutation result
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }) => chatApi.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });
}

// ========== OFFER HOOKS ==========

/**
 * Hook to create a price offer
 * @param {string} conversationId - Conversation ID
 * @returns {Object} React Query mutation result
 */
export function useCreateOffer(conversationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offeredPrice, originalPrice }) =>
      chatApi.createOffer(conversationId, offeredPrice, originalPrice),
    onSuccess: () => {
      // Refresh messages to show the new offer
      queryClient.invalidateQueries(["messages", conversationId]);
      queryClient.invalidateQueries(["conversations"]);
    },
  });
}

/**
 * Hook to respond to an offer (accept/reject)
 * @returns {Object} React Query mutation result
 */
export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, accept }) =>
      chatApi.respondToOffer(offerId, accept),
    onSuccess: (data) => {
      // Refresh messages to show updated offer status
      queryClient.invalidateQueries(["messages", data.conversation_id]);
      queryClient.invalidateQueries(["conversations"]);
    },
  });
}

/**
 * Hook to get all offers for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object} React Query result with offers data
 */
export function useOffers(conversationId) {
  return useQuery({
    queryKey: ["offers", conversationId],
    queryFn: () => chatApi.getOffers(conversationId),
    enabled: !!conversationId,
  });
}

/**
 * Hook to cancel a pending offer
 * @returns {Object} React Query mutation result
 */
export function useCancelOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId }) => chatApi.cancelOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
      queryClient.invalidateQueries(["offers"]);
    },
  });
}

// ========== UTILITY HOOKS ==========

/**
 * Hook to get total unread message count
 * @param {string} userId - User ID
 * @returns {Object} React Query result with unread count
 */
export function useUnreadCount(userId) {
  return useQuery({
    queryKey: ["unreadCount", userId],
    queryFn: () => chatApi.getTotalUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook to search messages
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Object} React Query result with search results
 */
export function useSearchMessages(userId, searchTerm) {
  return useQuery({
    queryKey: ["searchMessages", userId, searchTerm],
    queryFn: () => chatApi.searchMessages(userId, searchTerm),
    enabled: !!userId && !!searchTerm && searchTerm.length > 2,
  });
}

/**
 * Hook to block a user
 * @returns {Object} React Query mutation result
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, userId }) =>
      chatApi.blockUser(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["messages"]);
    },
  });
}
