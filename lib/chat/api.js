// src/lib/chat/api.js
import { supabase } from "@/lib/supabase-client";

class ChatAPI {
  // ========== PRESENCE ==========
  async updatePresence(isOnline = true) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_presence")
      .upsert(
        {
          user_id: user.id,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserPresence(userId) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_presence")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isRecentlyActive = new Date(data.last_seen) > fiveMinutesAgo;

    return {
      ...data,
      is_online: data.is_online && isRecentlyActive,
    };
  }

  subscribeToPresence(userId, callback) {
    const channel = supabase
      .channel(`presence:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const isRecentlyActive =
              new Date(payload.new.last_seen) > fiveMinutesAgo;

            callback({
              ...payload.new,
              is_online: payload.new.is_online && isRecentlyActive,
            });
          }
        }
      )
      .subscribe();

    return channel;
  }

  // ========== CONVERSATIONS ==========
  async getOrCreateConversation(productId, vendorId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Try to find existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select(
        `
        *,
        product:products(id, name, price, images, slug),
        vendor:profiles!conversations_vendor_id_fkey(id, full_name),
        customer:profiles!conversations_customer_id_fkey(id, full_name)
      `
      )
      .eq("product_id", productId)
      .eq("customer_id", user.id)
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (existing) return existing;

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        product_id: productId,
        customer_id: user.id,
        vendor_id: vendorId,
      })
      .select(
        `
        *,
        product:products(id, name, price, images, slug),
        vendor:profiles!conversations_vendor_id_fkey(id, full_name),
        customer:profiles!conversations_customer_id_fkey(id, full_name)
      `
      )
      .single();

    if (error) throw error;
    return newConv;
  }

  async getConversations(userId) {
    if (!userId) throw new Error("User ID required");

    console.log("🔍 Fetching conversations for userId:", userId);

    // Step 1: Get conversations with basic joins
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select(
        `
        id,
        product_id,
        vendor_id,
        customer_id,
        status,
        created_at,
        last_message_at,
        product:products(
          id,
          name,
          price,
          images,
          slug,
          condition
        ),
        vendor:profiles!conversations_vendor_id_fkey(
          id,
          full_name,
          username,
          email
        ),
        customer:profiles!conversations_customer_id_fkey(
          id,
          full_name,
          username,
          email
        )
      `
      )
      .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (convError) {
      console.error("❌ Error fetching conversations:", convError);
      console.error("Full error:", JSON.stringify(convError, null, 2));
      throw convError;
    }

    if (!conversations || conversations.length === 0) {
      console.log("⚠️ No conversations found");
      return [];
    }

    console.log("✅ Found conversations:", conversations.length);

    // Step 2: Fetch messages separately for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const { data: messages, error: msgError } = await supabase
          .from("messages")
          .select("id, content, created_at, is_read, sender_id, message_type")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (msgError) {
          console.error(`Error fetching messages for ${conv.id}:`, msgError);
          return {
            ...conv,
            lastMessage: null,
            unreadCount: 0,
          };
        }

        const lastMessage = messages?.[0] || null;
        const unreadCount =
          messages?.filter((msg) => !msg.is_read && msg.sender_id !== userId)
            .length || 0;

        return {
          ...conv,
          lastMessage,
          unreadCount,
        };
      })
    );

    console.log("✅ Conversations with messages:", conversationsWithMessages);

    return conversationsWithMessages;
  }

  // ========== MESSAGES ==========
  async getMessages(conversationId, limit = 100) {
    if (!conversationId) throw new Error("Conversation ID required");

    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles(id, full_name),
        offer:offers(*)
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  subscribeToMessages(conversationId, callback) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch complete message with relations
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

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();

    return channel;
  }

  async sendMessage(conversationId, content, messageType = "text") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    if (!content?.trim()) throw new Error("Message content cannot be empty");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        message_type: messageType,
      })
      .select(
        `
        *,
        sender:profiles(id, full_name)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  async markMessagesAsRead(conversationId, userId) {
    if (!conversationId || !userId) return null;

    const { data, error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false)
      .select();

    if (error) throw error;
    return data;
  }

  // ========== OFFERS ==========
  async createOffer(conversationId, offeredPrice, originalPrice) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const offered = parseFloat(offeredPrice);
    const original = parseFloat(originalPrice);
    const minAllowedPrice = original * 0.5;

    if (isNaN(offered) || isNaN(original)) {
      throw new Error("Invalid price values");
    }

    if (offered < minAllowedPrice) {
      throw new Error(
        `Offer must be at least €${minAllowedPrice.toFixed(
          2
        )} (50% of original price)`
      );
    }

    const additionalAmount = offered - original;

    // Create offer
    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .insert({
        conversation_id: conversationId,
        offered_price: offered,
        additional_amount: additionalAmount,
        original_price: original,
        offered_by: user.id,
      })
      .select()
      .single();

    if (offerError) throw offerError;

    // Create message
    const offerText =
      additionalAmount >= 0
        ? `Made an offer: €${offered.toFixed(2)} (+€${additionalAmount.toFixed(
            2
          )} additional)`
        : `Made an offer: €${offered.toFixed(2)} (€${Math.abs(
            additionalAmount
          ).toFixed(2)} discount requested)`;

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: offerText,
        message_type: "offer",
      })
      .select(
        `
        *,
        sender:profiles(id, full_name)
      `
      )
      .single();

    if (messageError) throw messageError;

    // Link offer to message
    await supabase
      .from("offers")
      .update({ message_id: message.id })
      .eq("id", offer.id);

    return { offer, message };
  }

  async respondToOffer(offerId, accept) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("offers")
      .update({
        status: accept ? "accepted" : "rejected",
        responded_by: user.id,
        responded_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .select()
      .single();

    if (error) throw error;

    // Create system message
    await supabase.from("messages").insert({
      conversation_id: data.conversation_id,
      sender_id: user.id,
      content: accept
        ? `✓ Offer accepted! The agreed price is €${data.offered_price.toFixed(
            2
          )}`
        : "✗ Offer rejected",
      message_type: "system",
    });

    return data;
  }
  async getTotalUnreadCount(userId) {
    if (!userId) return 0;

    // Step 1: Get conversation IDs the user participates in
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`);

    if (convError) throw convError;
    if (!conversations?.length) return 0;

    const conversationIds = conversations.map((c) => c.id);

    // Step 2: Count unread messages across those conversations
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", userId);

    if (error) throw error;

    return count ?? 0;
  }
}

export const chatApi = new ChatAPI();
