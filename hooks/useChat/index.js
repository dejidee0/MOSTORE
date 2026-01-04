// src/hooks/useChat/index.js
export { useConversations } from "./useConversations";
export { useMessages } from "./useMessages";
export { useUserPresence, useUpdatePresence } from "./usePresence";
export {
  useSendMessage,
  useMarkAsRead,
  useCreateOffer,
  useRespondToOffer,
} from "./useChatMutations";

// Navigation helper
export async function navigateToConversation(
  productId,
  vendorId,
  router,
  addToast
) {
  try {
    addToast?.("Loading conversation...", "info");

    const conversation = await chatApi.getOrCreateConversation(
      productId,
      vendorId
    );

    router.push(`/messages?id=${conversation.id}`);
  } catch (error) {
    console.error("Failed to open conversation:", error);
    addToast?.(error.message || "Failed to open conversation", "error");
  }
}
