import { supabase } from "./supabase-client";

export const chatApi = {
  // ========== PRESENCE METHODS ==========

  /**
   * Update user's online presence status
   * @param {boolean} isOnline - Whether user is online
   */
  async updatePresence(isOnline = true) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("user_presence").upsert(
      {
        user_id: user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) console.error("Error updating presence:", error);
  },

  /**
   * Get user's presence status
   * @param {string} userId - User ID to check
   * @returns {Object|null} Presence data with is_online status
   */
  async getUserPresence(userId) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_presence")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;

    // Consider user online if last_seen is within 5 minutes and is_online is true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isRecentlyActive = new Date(data.last_seen) > fiveMinutesAgo;

    return {
      ...data,
      is_online: data.is_online && isRecentlyActive,
    };
  },

  /**
   * Subscribe to user presence changes
   * @param {string} userId - User ID to subscribe to
   * @param {Function} callback - Callback function to handle presence updates
   * @returns {Object} Supabase channel subscription
   */
  subscribeToPresence(userId, callback) {
    return supabase
      .channel(`presence:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
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
  },

  // ========== CONVERSATION METHODS ==========

  /**
   * Get or create a conversation between customer and vendor for a product
   * @param {number} productId - Product ID
   * @param {string} vendorId - Vendor's user ID
   * @returns {Object} Conversation data with product and user details
   */
  async getOrCreateConversation(productId, vendorId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Try to find existing conversation
    const { data: existing, error: fetchError } = await supabase
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
      .single();

    if (existing) return existing;

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
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

    if (createError) throw createError;
    return newConv;
  },

  /**
   * Get all conversations for a user
   * @param {string} userId - User ID
   * @returns {Array} List of conversations with metadata
   */
  async getConversations(userId) {
    if (!userId) throw new Error("User ID required");

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
      *,
      product:products(id, name, price, images, slug),
      vendor:profiles!conversations_vendor_id_fkey(id, full_name),
      customer:profiles!conversations_customer_id_fkey(id, full_name)
    `
      )
      .or(`customer_id.eq.${userId},vendor_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    // Fetch unread counts and last messages separately for better performance
    const conversationIds = data.map((c) => c.id);

    if (conversationIds.length === 0) return [];

    // Get last message for each conversation
    const { data: lastMessages } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at, is_read, sender_id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    // Get unread counts
    const { data: unreadCounts } = await supabase
      .from("messages")
      .select("conversation_id, id")
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", userId);

    // Create lookup maps
    const lastMessageMap = {};
    lastMessages?.forEach((msg) => {
      if (!lastMessageMap[msg.conversation_id]) {
        lastMessageMap[msg.conversation_id] = msg;
      }
    });

    const unreadMap = {};
    unreadCounts?.forEach((msg) => {
      unreadMap[msg.conversation_id] =
        (unreadMap[msg.conversation_id] || 0) + 1;
    });

    return data.map((conv) => ({
      ...conv,
      lastMessage: lastMessageMap[conv.id],
      unreadCount: unreadMap[conv.id] || 0,
    }));
  },

  /**
   * Update conversation status
   * @param {string} conversationId - Conversation ID
   * @param {string} status - New status ('active', 'archived', 'closed')
   */
  async updateConversationStatus(conversationId, status) {
    const { error } = await supabase
      .from("conversations")
      .update({ status })
      .eq("id", conversationId);

    if (error) throw error;
  },

  // ========== MESSAGE METHODS ==========

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum number of messages to fetch
   * @returns {Array} List of messages with sender details
   */
  async getMessages(conversationId, limit = 50) {
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
  },

  /**
   * Send a message in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} content - Message content
   * @param {string} messageType - Type of message ('text', 'offer', 'system')
   * @returns {Object} Created message with sender details
   */
  async sendMessage(conversationId, content, messageType = "text") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (!content || !content.trim()) {
      throw new Error("Message content cannot be empty");
    }

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
  },

  /**
   * Mark messages as read in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user's ID
   */
  async markMessagesAsRead(conversationId, userId) {
    if (!conversationId || !userId) return;

    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);

    if (error) console.error("Error marking messages as read:", error);
  },

  /**
   * Delete a message (soft delete by updating content)
   * @param {string} messageId - Message ID
   */
  async deleteMessage(messageId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("messages")
      .update({ content: "This message was deleted", message_type: "system" })
      .eq("id", messageId)
      .eq("sender_id", user.id);

    if (error) throw error;
  },

  /**
   * Subscribe to new messages in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {Function} callback - Callback function to handle new messages
   * @returns {Object} Supabase channel subscription
   */
  subscribeToMessages(conversationId, callback) {
    return supabase
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
          // Fetch the full message with sender info and offer details
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
  },

  // ========== OFFER METHODS ==========

  /**
   * Create a price offer for a product
   * @param {string} conversationId - Conversation ID
   * @param {number} offeredPrice - Total price being offered
   * @param {number} originalPrice - Original product price
   * @returns {Object} Created offer and associated message
   */

  // src/lib/chat/api.js

  async createOffer(conversationId, offeredPrice, originalPrice) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const offered = parseFloat(offeredPrice);
    const original = parseFloat(originalPrice);
    const minAllowedPrice = original * 0.5;

    // Validation
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

    // Generate offer message text
    const offerText =
      additionalAmount >= 0
        ? `Made an offer: €${offered.toFixed(2)} (+€${additionalAmount.toFixed(
            2
          )} additional)`
        : `Made an offer: €${offered.toFixed(2)} (€${Math.abs(
            additionalAmount
          ).toFixed(2)} discount requested)`;

    try {
      // Step 1: Create message
      const { data: message, error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: offerText,
          message_type: "offer",
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Step 2: Create offer with message_id
      const { data: offer, error: offerError } = await supabase
        .from("offers")
        .insert({
          conversation_id: conversationId,
          message_id: message.id,
          offered_price: offered,
          additional_amount: additionalAmount,
          original_price: original,
          offered_by: user.id,
        })
        .select()
        .single();

      if (offerError) {
        // Rollback: Delete orphaned message
        await supabase.from("messages").delete().eq("id", message.id);
        throw offerError;
      }

      // Step 3: Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      // Fetch complete message with all relations
      const { data: completeMessage } = await supabase
        .from("messages")
        .select(
          `
        *,
        sender:profiles(id, full_name),
        offer:offers(*)
      `
        )
        .eq("id", message.id)
        .single();

      return {
        offer,
        message: completeMessage || message,
      };
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  },

  /**
   * Respond to an offer (accept or reject)
   * @param {string} offerId - Offer ID
   * @param {boolean} accept - Whether to accept (true) or reject (false)
   * @returns {Object} Updated offer data
   */
  async respondToOffer(offerId, accept) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Update offer status
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

    // Create a system message to notify about the response
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
  },

  /**
   * Get all offers for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Array} List of offers
   */
  async getOffers(conversationId) {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `
        *,
        offered_by_user:profiles!offers_offered_by_fkey(id, full_name),
        responded_by_user:profiles!offers_responded_by_fkey(id, full_name)
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Cancel a pending offer
   * @param {string} offerId - Offer ID
   */
  async cancelOffer(offerId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("offers")
      .update({ status: "expired" })
      .eq("id", offerId)
      .eq("offered_by", user.id)
      .eq("status", "pending")
      .select()
      .single();

    if (error) throw error;

    // Create system message
    await supabase.from("messages").insert({
      conversation_id: data.conversation_id,
      sender_id: user.id,
      content: "Offer cancelled",
      message_type: "system",
    });

    return data;
  },

  // ========== UTILITY METHODS ==========

  /**
   * Get total unread message count for user
   * @param {string} userId - User ID
   * @returns {number} Total unread count
   */
  async getTotalUnreadCount(userId) {
    if (!userId) return 0;

    const { data, error } = await supabase
      .from("messages")
      .select("id", { count: "exact" })
      .eq("is_read", false)
      .neq("sender_id", userId);

    if (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }

    return data?.length || 0;
  },

  /**
   * Search messages in conversations
   * @param {string} userId - User ID
   * @param {string} searchTerm - Search term
   * @returns {Array} Matching messages
   */
  async searchMessages(userId, searchTerm) {
    if (!userId || !searchTerm) return [];

    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles(id, full_name),
        conversation:conversations(
          *,
          product:products(id, name, images)
        )
      `
      )
      .ilike("content", `%${searchTerm}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error searching messages:", error);
      return [];
    }

    // Filter to only conversations the user is part of
    return (data || []).filter(
      (msg) =>
        msg.conversation?.customer_id === userId ||
        msg.conversation?.vendor_id === userId
    );
  },

  /**
   * Block a user in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - User to block
   */
  async blockUser(conversationId, userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Update conversation status to closed
    const { error } = await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", conversationId);

    if (error) throw error;

    // Create system message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: "This conversation has been closed",
      message_type: "system",
    });
  },
};
