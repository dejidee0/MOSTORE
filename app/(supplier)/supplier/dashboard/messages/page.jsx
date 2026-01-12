// src/app/messages/page.jsx
"use client";

import {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useUpdatePresence } from "@/hooks/useChat";
import { MessageCircle } from "lucide-react";
import { getCurrentUserOrGuest } from "@/lib/guestUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/chat/api";
import { useToast } from "@/lib/toast";
import ChatWindow from "@/components/shared/messages/ChatWindow";
import ConversationList from "@/components/shared/messages/Conversation/index";
import { useConversations } from "@/hooks/useChat/useConversations";

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const conversationId = searchParams.get("id");
  const productId = searchParams.get("product");
  const vendorId = searchParams.get("vendor");

  const [isMigrating, setIsMigrating] = useState(false);
  const isMobileView = useMediaQuery("(max-width: 768px)");

  // **CRITICAL**: Store stable reference to selected conversation
  const selectedConversationRef = useRef(null);
  const [stableConversation, setStableConversation] = useState(null);

  // Always call hooks
  useUpdatePresence();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUserOrGuest(supabase),
    staleTime: Infinity,
  });

  const {
    data: conversations,
    isLoading: isConversationsLoading,
    error: conversationsError,
  } = useConversations(user?.userId, {
    enabled: !!user?.userId && !isMigrating,
  });

  console.log("Conversations:", conversations);

  // **CRITICAL FIX**: Maintain stable conversation reference

  useEffect(() => {
    if (!conversationId) {
      selectedConversationRef.current = null;
      setStableConversation(null);
      return;
    }

    if (!conversations) return;

    // ✅ Handle empty conversations list
    if (conversations.length === 0 && !isConversationsLoading) {
      selectedConversationRef.current = null;
      setStableConversation(null);
      return;
    }

    const found = conversations.find((c) => c.id === conversationId);

    if (found) {
      const hasChanged =
        !selectedConversationRef.current ||
        selectedConversationRef.current.id !== found.id ||
        JSON.stringify(selectedConversationRef.current) !==
          JSON.stringify(found);

      if (hasChanged) {
        selectedConversationRef.current = found;
        setStableConversation(found);
      }
    } else if (!isConversationsLoading) {
      console.warn(`Conversation ${conversationId} not found`);
      selectedConversationRef.current = null;
      setStableConversation(null);
    }
  }, [conversations, conversationId, isConversationsLoading]);
  // Backward compatibility redirect
  useEffect(() => {
    if (!productId || !vendorId || conversationId || isMigrating) return;
    if (!user?.userId || !conversations) return;

    const existing = conversations.find(
      (c) =>
        c.product_id === Number(productId) &&
        c.vendor_id === vendorId &&
        (c.customer_id === user.userId || c.vendor_id === user.userId)
    );

    if (existing) {
      router.replace(`/messages?id=${existing.id}`);
    } else {
      setIsMigrating(true);
      chatApi
        .getOrCreateConversation(Number(productId), vendorId)
        .then((conv) => {
          router.replace(`/messages?id=${conv.id}`);
        })
        .catch((error) => {
          console.error("Migration error:", error);
          console.log(error);
          addToast("Failed to load conversation", "error");
        })
        .finally(() => {
          setIsMigrating(false);
        });
    }
  }, [
    productId,
    vendorId,
    conversationId,
    user?.userId,
    conversations,
    isMigrating,
    router,
    addToast,
  ]);

  const handleSelectConversation = useCallback(
    (conv) => {
      router.push(`/admin/dashboard/messages?id=${conv.id}`);
    },
    [router]
  );

  const handleBackToList = useCallback(() => {
    router.push("/messages");
  }, [router]);

  // Loading states
  if (isUserLoading || isMigrating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-3" />
          <p className="text-gray-600">
            {isMigrating ? "Loading conversation..." : "Authenticating..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center text-red-500">
          <p className="font-medium">Unable to load user</p>
          <p className="text-sm mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center text-red-500">
          <p className="font-medium">Error loading conversations</p>
          <p className="text-sm mt-2">{conversationsError.message}</p>
        </div>
      </div>
    );
  }

  // Determine if conversation should be shown as not found
  const shouldShowNotFound =
    conversationId && !stableConversation && !isConversationsLoading;

  // Mobile view
  if (isMobileView) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {!conversationId || shouldShowNotFound ? (
          <>
            <div className="bg-orange-500 text-white p-4 shadow-md">
              <h1 className="text-xl font-bold">Messages</h1>
            </div>

            {shouldShowNotFound ? (
              <ConversationNotFoundState onBack={handleBackToList} />
            ) : (
              <div className="flex-1 overflow-y-auto">
                {isConversationsLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  </div>
                ) : (
                  <ConversationList
                    conversations={conversations || []}
                    selectedId={conversationId}
                    onSelect={handleSelectConversation}
                    currentUserId={user.userId}
                  />
                )}
              </div>
            )}
          </>
        ) : stableConversation ? (
          <ChatWindow
            key={stableConversation.id}
            conversation={stableConversation}
            currentUserId={user.userId}
            onBack={handleBackToList}
            isMobile
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-96 border-r bg-white flex flex-col">
        <div className="bg-orange-500 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold flex items-center gap-2 ">
            <MessageCircle />
            Messages
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isConversationsLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : (
            <ConversationList
              conversations={conversations || []}
              selectedId={conversationId}
              onSelect={handleSelectConversation}
              currentUserId={user.userId}
            />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {stableConversation ? (
          <ChatWindow
            key={stableConversation.id}
            conversation={stableConversation}
            currentUserId={user.userId}
          />
        ) : shouldShowNotFound ? (
          <ConversationNotFoundState />
        ) : conversationId ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-2">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationNotFoundState({ onBack }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <MessageCircle className="w-20 h-20 mx-auto text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Conversation Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          This conversation doesn't exist or may have been deleted.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors font-medium shadow-lg"
          >
            Back to Messages
          </button>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
