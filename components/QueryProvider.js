"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  const [query] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      })
  );
  return <QueryClientProvider client={query}> {children} </QueryClientProvider>;
}

// Query key factory for type safety and consistency
export const queryKeys = {
  conversations: {
    all: (userId) => ["conversations", userId],
    detail: (id) => ["conversations", "detail", id],
  },
  messages: {
    all: (conversationId) => ["messages", conversationId],
  },
  presence: {
    user: (userId) => ["presence", userId],
  },
  offers: {
    conversation: (conversationId) => ["offers", conversationId],
  },
  unreadCount: (userId) => ["unreadCount", userId],
};
