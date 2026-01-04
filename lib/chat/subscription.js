// src/lib/chat/subscriptions.js
import { supabase } from "@/lib/supabase-client";

class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
  }

  subscribeToMessages(conversationId, callback) {
    const key = `messages:${conversationId}`;

    // Unsubscribe existing if present
    this.unsubscribe(key);

    const channel = supabase
      .channel(key)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch complete message data
          const { data } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:profiles(id, full_name),
              offer:offers(*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) callback(data);
        }
      )
      .subscribe();

    this.subscriptions.set(key, channel);
    return () => this.unsubscribe(key);
  }

  subscribeToPresence(userId, callback) {
    const key = `presence:${userId}`;

    this.unsubscribe(key);

    const channel = supabase
      .channel(key)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const isRecentlyActive =
            new Date(payload.new.last_seen) > fiveMinutesAgo;

          callback({
            ...payload.new,
            is_online: payload.new.is_online && isRecentlyActive,
          });
        }
      )
      .subscribe();

    this.subscriptions.set(key, channel);
    return () => this.unsubscribe(key);
  }

  unsubscribe(key) {
    const channel = this.subscriptions.get(key);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((channel) => channel.unsubscribe());
    this.subscriptions.clear();
  }
}

export const subscriptionManager = new SubscriptionManager();
