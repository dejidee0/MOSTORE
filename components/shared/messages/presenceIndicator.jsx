// src/components/messages/shared/PresenceIndicator.jsx
"use client";

export default function PresenceIndicator({ isOnline, className = "" }) {
  if (!isOnline) return null;

  return (
    <div
      className={`w-3 h-3 bg-green-400 rounded-full border-2 border-white ${className}`}
      aria-label="Online"
    />
  );
}
