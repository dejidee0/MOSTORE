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

    // Single optimized query with aggregations
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        product:products(id, name, price, images, slug),
        vendor:profiles!conversations_vendor_id_fkey(id, full_name),
        customer:profiles!conversations_customer_id_fkey(id, full_name),
        messages!inner(
          id,
          content,
          created_at,
          is_read,
          sender_id,
          message_type
        )
      `
      )
      .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    // Process conversations with derived data
    return (data || []).map((conv) => {
      const messages = conv.messages || [];

      // Get last message
      const lastMessage = messages.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];

      // Count unread messages
      const unreadCount = messages.filter(
        (msg) => !msg.is_read && msg.sender_id !== userId
      ).length;

      // Remove messages array from response
      const { messages: _, ...conversationData } = conv;

      return {
        ...conversationData,
        lastMessage,
        unreadCount,
      };
    });
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
}

export const chatApi = new ChatAPI();
