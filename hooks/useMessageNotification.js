// src/hooks/useMessageNotifications.js
"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/lib/toast";
import { usePathname, useRouter } from "next/navigation";

export function useMessageNotifications() {
  const { addToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const channelRef = useRef(null);
  const processedMessageIds = useRef(new Set());

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!user?.id) return;

    // Don't show notifications if user is on messages page
    const isOnMessagesPage = pathname?.startsWith("/messages");

    // Subscribe to messages where user is recipient
    const setupSubscription = async () => {
      // Get user's conversations
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`customer_id.eq.${user.id},vendor_id.eq.${user.id}`);

      if (!conversations?.length) return;

      const conversationIds = conversations.map((c) => c.id);

      // Clean up existing channel
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }

      // Create new channel for message notifications
      const channel = supabase
        .channel("message-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=in.(${conversationIds.join(",")})`,
          },
          async (payload) => {
            const newMessage = payload.new;

            // Don't notify if:
            // 1. User sent the message
            // 2. User is on messages page
            // 3. Message already processed
            if (
              newMessage.sender_id === user.id ||
              isOnMessagesPage ||
              processedMessageIds.current.has(newMessage.id)
            ) {
              return;
            }

            // Mark as processed
            processedMessageIds.current.add(newMessage.id);

            // Fetch complete message data
            const { data: messageData } = await supabase
              .from("messages")
              .select(
                `
                *,
                sender:profiles(id, full_name),
                conversation:conversations(
                  id,
                  product:products(name, images)
                )
              `
              )
              .eq("id", newMessage.id)
              .single();

            if (!messageData) return;

            // Show notification
            showMessageNotification(messageData, router, addToast);
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setupSubscription();

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      processedMessageIds.current.clear();
    };
  }, [user?.id, pathname, router, addToast]);
}

function showMessageNotification(message, router, addToast) {
  const senderName = message.sender?.full_name || "Someone";
  const productName = message.conversation?.product?.name || "a product";

  let notificationContent = message.content;

  // Truncate long messages
  if (notificationContent.length > 60) {
    notificationContent = notificationContent.substring(0, 60) + "...";
  }

  // Create custom toast
  addToast(
    <MessageNotificationContent
      senderName={senderName}
      productName={productName}
      content={notificationContent}
      messageType={message.message_type}
    />,
    "message",
    {
      duration: 6000,
      onClick: () => {
        router.push(`/messages?id=${message.conversation_id}`);
      },
    }
  );

  // Play notification sound (optional)
  playNotificationSound();
}

function MessageNotificationContent({
  senderName,
  productName,
  content,
  messageType,
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          {senderName.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-gray-900 text-sm truncate">
            {senderName}
          </p>
          {messageType === "offer" && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              Offer
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-1 truncate">Re: {productName}</p>
        <p className="text-sm text-gray-700 line-clamp-2">
          {messageType === "offer" && "💰 "}
          {content}
        </p>
        <p className="text-xs text-orange-600 font-medium mt-1">
          Click to view message →
        </p>
      </div>
    </div>
  );
}

function playNotificationSound() {
  try {
    const audio = new Audio("/audio/notify.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (error) {}
}
