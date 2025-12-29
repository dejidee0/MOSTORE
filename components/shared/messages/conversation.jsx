"use client";

import { formatDistanceToNow } from "date-fns";
import { useUserPresence } from "@/hooks/useChat";

function ConversationItem({ conv, isSelected, onSelect, currentUserId }) {
  const isVendor = conv.vendor_id === currentUserId;
  const otherUser = isVendor ? conv.customer : conv.vendor;
  const presence = useUserPresence(otherUser?.id);

  return (
    <button
      onClick={() => onSelect(conv)}
      className={`w-full p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
        isSelected ? "bg-orange-50" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Product Image with Online Indicator */}
        <div className="flex-shrink-0 relative">
          <img
            src={conv.product?.images?.[0] || "/placeholder-image.jpg"}
            alt={conv.product?.name}
            className="w-14 h-14 object-cover rounded-lg"
          />
          {presence?.is_online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate text-sm">
                {otherUser?.full_name || "Unknown User"}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {conv.product?.name}
              </p>
            </div>
            {conv.lastMessage && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-gray-500 truncate flex-1">
              {conv.lastMessage?.content || "No messages yet"}
            </p>
            {conv.unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm mt-2">
          Browse products to start chatting with vendors
        </p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conv={conv}
          isSelected={conv.id === selectedId}
          onSelect={onSelect}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
