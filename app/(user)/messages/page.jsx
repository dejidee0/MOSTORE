"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import {
  useConversations,
  useConversation,
  useUpdatePresence,
} from "@/hooks/useChat";

import { MessageCircle, ArrowLeft } from "lucide-react";
import ChatWindow from "@/components/shared/messages/window";
import ConversationList from "@/components/shared/messages/conversation";

function MessagesContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const vendorId = searchParams.get("vendor");

  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const hasCreatedConversation = useRef(false); // Prevent duplicate creation

  useUpdatePresence(); // Track user presence

  const { data: conversations, isLoading } = useConversations(user?.id);
  const createConversation = useConversation(productId, vendorId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-create or find conversation if product and vendor are in URL
  useEffect(() => {
    // Prevent running if:
    // 1. No productId or vendorId
    // 2. No user
    // 3. Already created/found conversation
    // 4. Mutation is pending
    if (
      !productId ||
      !vendorId ||
      !user ||
      hasCreatedConversation.current ||
      createConversation.isPending
    ) {
      return;
    }

    // Check if conversation already exists in the list
    if (conversations && conversations.length > 0) {
      const existingConv = conversations.find(
        (conv) =>
          conv.product_id === parseInt(productId) &&
          conv.vendor_id === vendorId &&
          conv.customer_id === user.id
      );

      if (existingConv) {
        setSelectedConversation(existingConv);
        hasCreatedConversation.current = true;
        return;
      }
    }

    // Only create if we haven't tried yet
    if (!hasCreatedConversation.current) {
      hasCreatedConversation.current = true;

      createConversation.mutate(undefined, {
        onSuccess: (conv) => {
          setSelectedConversation(conv);
        },
        onError: (error) => {
          console.error("Error creating conversation:", error);
          hasCreatedConversation.current = false; // Allow retry on error
        },
      });
    }
  }, [productId, vendorId, user, conversations, createConversation]);

  // Reset ref when productId or vendorId changes
  useEffect(() => {
    hasCreatedConversation.current = false;
  }, [productId, vendorId]);

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view messages</p>
        </div>
      </div>
    );
  }

  // Mobile: Show either list or chat
  if (isMobileView) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {!selectedConversation ? (
          // Conversation List
          <div className="flex-1 flex flex-col bg-white">
            <div className="bg-orange-500 text-white p-4 shadow-md">
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations || []}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  currentUserId={user.id}
                />
              )}
            </div>
          </div>
        ) : (
          // Chat Window
          <div className="flex-1 flex flex-col">
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user.id}
              onBack={handleBackToList}
              isMobile={true}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop: Show both side by side
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversation List */}
      <div className="w-96 border-r bg-white flex flex-col">
        <div className="bg-orange-500 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle />
            Messages
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <ConversationList
              conversations={conversations || []}
              selectedId={selectedConversation?.id}
              onSelect={setSelectedConversation}
              currentUserId={user.id}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={user.id}
            isMobile={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
