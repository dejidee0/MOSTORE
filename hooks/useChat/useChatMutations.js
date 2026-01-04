// src/hooks/useChat/useChatMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/chat/api";
import { queryKeys } from "@/utils/queryClient";

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, messageType = "text" }) =>
      chatApi.sendMessage(conversationId, content, messageType),

    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.all(conversationId),
      });

      const previousMessages = queryClient.getQueryData(
        queryKeys.messages.all(conversationId)
      );

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const user = await chatApi.getCurrentUser();

      queryClient.setQueryData(
        queryKeys.messages.all(conversationId),
        (old = []) => [
          ...old,
          {
            id: tempId,
            content,
            sender_id: user?.id,
            created_at: new Date().toISOString(),
            is_read: false,
            message_type: "text",
            _isOptimistic: true,
          },
        ]
      );

      return { previousMessages, tempId };
    },

    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages.all(conversationId),
          context.previousMessages
        );
      }
    },

    onSuccess: (newMessage, variables, context) => {
      queryClient.setQueryData(
        queryKeys.messages.all(conversationId),
        (old = []) => {
          const filtered = old.filter((m) => m.id !== context.tempId);

          if (filtered.some((m) => m.id === newMessage.id)) {
            return filtered;
          }

          return [...filtered, newMessage];
        }
      );

      // **CRITICAL**: Update conversations WITHOUT invalidating
      queryClient.setQueryData(
        queryKeys.conversations.all(),
        (oldConversations) => {
          if (!oldConversations) return oldConversations;

          return oldConversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: newMessage,
                last_message_at: newMessage.created_at,
              };
            }
            return conv;
          });
        }
      );
    },
  });
}

export function useMarkAsRead(conversationId, userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatApi.markMessagesAsRead(conversationId, userId),
    onSuccess: () => {
      // Update messages immediately
      queryClient.setQueryData(
        queryKeys.messages.all(conversationId),
        (old = []) =>
          old.map((msg) =>
            msg.sender_id !== userId ? { ...msg, is_read: true } : msg
          )
      );

      // **CRITICAL**: Update conversations WITHOUT invalidating
      queryClient.setQueryData(
        queryKeys.conversations.all(userId),
        (oldConversations) => {
          if (!oldConversations) return oldConversations;

          return oldConversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                unreadCount: 0,
              };
            }
            return conv;
          });
        }
      );
    },
  });
}

export function useCreateOffer(conversationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offeredPrice, originalPrice }) =>
      chatApi.createOffer(conversationId, offeredPrice, originalPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all(conversationId),
      });
    },
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, accept }) =>
      chatApi.respondToOffer(offerId, accept),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all(data.conversation_id),
      });
    },
  });
}
