// src/components/messages/ChatWindow/MessageInput.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, DollarSign } from "lucide-react";

export default function MessageInput({ isVendor, onShowOffer, onSendMessage }) {
  const [messageText, setMessageText] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [messageText]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    onSendMessage.mutate(
      { content: messageText, messageType: "text" },
      {
        onSuccess: () => {
          setMessageText("");
          // Reset textarea height
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        },
      },
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t shadow-lg">
      {/* Make Offer Button - Only for customers */}

      {/* Message Input Area */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none max-h-[120px] overflow-y-auto"
            disabled={onSendMessage.isPending}
            style={{ minHeight: "42px" }}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || onSendMessage.isPending}
            className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
            aria-label="Send message"
          >
            {onSendMessage.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
