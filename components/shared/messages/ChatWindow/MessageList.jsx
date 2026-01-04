// src/components/messages/ChatWindow/MessageList.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import LoadingSpinner from "../loadingSpinner";
import { ChevronDown } from "lucide-react";

export default function MessageList({
  messages,
  isLoading,
  error,
  currentUserId,
  originalPrice,
  isVendor,
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Initial scroll to bottom on mount and when messages first load
  useEffect(() => {
    if (messages?.length > 0 && prevMessagesLengthRef.current === 0) {
      // First load - instant scroll
      setTimeout(() => scrollToBottom("instant"), 100);
    }
    prevMessagesLengthRef.current = messages?.length || 0;
  }, [messages?.length]);

  // Auto-scroll on new messages (only if user isn't scrolling up)
  useEffect(() => {
    if (!messages) return;

    const isNewMessage = messages.length > prevMessagesLengthRef.current;

    if (isNewMessage && !isUserScrolling) {
      scrollToBottom("smooth");
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, isUserScrolling]);

  // Handle scroll event to detect if user is viewing older messages
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    // Show scroll button if not at bottom
    setShowScrollButton(!isNearBottom);

    // User is scrolling if not at bottom
    setIsUserScrolling(!isNearBottom);

    // Reset user scrolling flag after 2 seconds of no scrolling
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (isNearBottom) {
        setIsUserScrolling(false);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="text-center text-red-500 bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-md">
          <p className="font-medium">Error loading messages</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Scrollable Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden px-4 py-4"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        <div className="space-y-2">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              originalPrice={originalPrice}
              isVendor={isVendor}
              showDateSeparator={shouldShowDateSeparator(messages, index)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-4 right-4 bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all animate-in fade-in slide-in-from-bottom-2 z-10"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center text-gray-500 bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-md">
      <p className="font-medium">No messages yet</p>
      <p className="text-sm mt-1">Start the conversation!</p>
    </div>
  );
}

function shouldShowDateSeparator(messages, index) {
  if (index === 0) return true;

  const currentDate = new Date(messages[index].created_at).toDateString();
  const prevDate = new Date(messages[index - 1].created_at).toDateString();

  return currentDate !== prevDate;
}
