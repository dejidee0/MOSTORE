// src/components/messages/ConversationList/index.jsx
"use client";

import { useMemo } from "react";
import { useBatchPresence } from "@/hooks/useChat";
import ConversationItem from "./ConversationItem";
import EmptyState from "./EmptyState";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}) {
  // Get all other user IDs
  const otherUserIds = useMemo(() => {
    if (!conversations) return [];
    return conversations
      .map((conv) => {
        const isVendor = conv.vendor_id === currentUserId;
        return isVendor ? conv.customer?.id : conv.vendor?.id;
      })
      .filter(Boolean);
  }, [conversations, currentUserId]);

  // Fetch presence for all users at once
  const presenceMap = useBatchPresence(otherUserIds);

  if (!conversations || conversations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {conversations.map((conv) => {
        const isVendor = conv.vendor_id === currentUserId;
        const otherUserId = isVendor ? conv.customer?.id : conv.vendor?.id;

        return (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={conv.id === selectedId}
            onSelect={onSelect}
            currentUserId={currentUserId}
            presence={presenceMap[otherUserId]}
          />
        );
      })}
    </div>
  );
}
