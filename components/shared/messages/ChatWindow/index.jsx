// src/components/messages/ChatWindow/index.jsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useUserPresence,
} from "@/hooks/useChat";
import ChatHeader from "./header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import OfferModal from "./OfferModal";

const CONVERSATION_LOAD_TIMEOUT = 10000; // 10 seconds

export default function ChatWindow({
  conversation,
  currentUserId,
  onBack,
  isMobile = false,
}) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [conversationLoadTimeout, setConversationLoadTimeout] = useState(false);
  const hasMarkedReadRef = useRef(false);
  const timeoutRef = useRef(null);

  if (!conversation?.id) {
    console.warn("ChatWindow: No conversation provided");
    return null;
  }

  const conversationId = conversation.id;

  const {
    data: messages,
    isLoading,
    error,
    refetch,
  } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const markAsRead = useMarkAsRead(conversationId, currentUserId);

  const isVendor = conversation.vendor_id === currentUserId;
  const otherUser = isVendor ? conversation.customer : conversation.vendor;
  const presence = useUserPresence(otherUser?.id);

  // Memoize derived data
  const originalPrice = useMemo(
    () => parseFloat(conversation?.product?.price || 0),
    [conversation?.product?.price]
  );

  // Timeout handler for conversation loading
  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setConversationLoadTimeout(true);
      }, CONVERSATION_LOAD_TIMEOUT);
    } else {
      setConversationLoadTimeout(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading]);

  // Mark messages as read (debounced)
  useEffect(() => {
    if (!messages?.length || hasMarkedReadRef.current) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.is_read && msg.sender_id !== currentUserId
    );

    if (unreadMessages.length === 0) return;

    hasMarkedReadRef.current = true;

    const timer = setTimeout(() => {
      markAsRead.mutate(undefined, {
        onSettled: () => {
          hasMarkedReadRef.current = false;
        },
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [messages, currentUserId, markAsRead]);

  // Handle retry
  const handleRetry = () => {
    setConversationLoadTimeout(false);
    refetch();
  };

  // Show timeout error
  if (conversationLoadTimeout) {
    return (
      <ConversationTimeout
        onRetry={handleRetry}
        onBack={onBack}
        isMobile={isMobile}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <ChatHeader
        conversation={conversation}
        otherUser={otherUser}
        presence={presence}
        isMobile={isMobile}
        onBack={onBack}
      />

      {/* Scrollable Messages Area */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        currentUserId={currentUserId}
        originalPrice={originalPrice}
        isVendor={isVendor}
      />

      {/* Fixed Input at Bottom */}
      <MessageInput
        isVendor={isVendor}
        onShowOffer={() => setShowOfferModal(true)}
        onSendMessage={sendMessage}
      />

      {/* Offer Modal */}
      {showOfferModal && (
        <OfferModal
          conversation={conversation}
          originalPrice={originalPrice}
          onClose={() => setShowOfferModal(false)}
        />
      )}
    </div>
  );
}

// Conversation Timeout Component
function ConversationTimeout({ onRetry, onBack, isMobile }) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {isMobile && onBack && (
        <div className="bg-orange-500 text-white p-4 shadow-md">
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Timeout
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't load this conversation. This might be due to a slow
            connection or server issue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRetry}
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors font-medium shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Messages
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCw({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
