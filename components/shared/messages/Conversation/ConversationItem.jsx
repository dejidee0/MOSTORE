// src/components/messages/ConversationList/ConversationItem.jsx
"use client";

import { formatDistanceToNow } from "date-fns";
import PresenceIndicator from "../presenceIndicator";

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  currentUserId,
  presence, // ✅ Now received as prop instead of fetching individually
}) {
  const isVendor = conversation.vendor_id === currentUserId;
  const otherUser = isVendor ? conversation.customer : conversation.vendor;

  const formatLastMessageTime = (date) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={`w-full p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
        isSelected ? "bg-orange-50" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Product Image with Online Indicator */}
        <div className="flex-shrink-0 relative">
          <img
            src={conversation.product?.images?.[0] || "/placeholder-image.jpg"}
            alt={conversation.product?.name || "Product"}
            className="w-14 h-14 object-cover rounded-lg"
          />
          <PresenceIndicator
            isOnline={presence?.is_online}
            className="absolute -bottom-1 -right-1"
          />
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate text-sm">
                {otherUser?.full_name || "Unknown User"}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {conversation.product?.name}
              </p>
            </div>
            {conversation.lastMessage && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatLastMessageTime(conversation.lastMessage.created_at)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-gray-500 truncate flex-1">
              {conversation.lastMessage?.content || "No messages yet"}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
