// src/components/messages/ConversationList/index.jsx
"use client";

import ConversationItem from "./ConversationItem";
import EmptyState from "./EmptyState";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}) {
  if (!conversations || conversations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
          onSelect={onSelect}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
