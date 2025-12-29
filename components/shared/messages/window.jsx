"use client";

import { useState, useEffect, useRef } from "react";
import {
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useCreateOffer,
  useRespondToOffer,
  useUserPresence,
} from "@/hooks/useChat";
import {
  Send,
  Package,
  DollarSign,
  Check,
  X,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useToast } from "@/lib/toast";

export default function ChatWindow({
  conversation,
  currentUserId,
  onBack,
  isMobile = false,
}) {
  const [messageText, setMessageText] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  const { data: messages, isLoading } = useMessages(conversation.id);
  const sendMessage = useSendMessage(conversation.id);
  const markAsRead = useMarkAsRead(conversation.id, currentUserId);
  const createOffer = useCreateOffer(conversation.id);
  const respondToOffer = useRespondToOffer();

  const isVendor = conversation.vendor_id === currentUserId;
  const otherUser = isVendor ? conversation.customer : conversation.vendor;
  const presence = useUserPresence(otherUser?.id);

  const originalPrice = parseFloat(conversation.product?.price);
  const minAllowedPrice = originalPrice * 0.5;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (messages && messages.length > 0) {
      const timer = setTimeout(() => {
        markAsRead.mutate();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessage.mutate(
      { content: messageText, messageType: "text" },
      {
        onSuccess: () => {
          setMessageText("");
        },
      }
    );
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    const offered = parseFloat(offerAmount);

    if (isNaN(offered)) {
      addToast("Please enter a valid price", "error");
      return;
    }

    if (offered < minAllowedPrice) {
      addToast(
        `Offer must be at least €${minAllowedPrice.toFixed(
          2
        )} (50% of original price)`,
        "error"
      );
      return;
    }

    createOffer.mutate(
      {
        offeredPrice: offered,
        originalPrice: originalPrice,
      },
      {
        onSuccess: () => {
          setShowOfferModal(false);
          setOfferAmount("");
          addToast("Offer sent successfully!", "success");
        },
        onError: (error) => {
          addToast(error.message || "Failed to send offer", "error");
        },
      }
    );
  };

  const handleRespondToOffer = (offerId, accept) => {
    respondToOffer.mutate(
      { offerId, accept },
      {
        onSuccess: () => {
          addToast(
            accept ? "Offer accepted!" : "Offer rejected",
            accept ? "success" : "info"
          );
        },
      }
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header - WhatsApp Style */}
      <div className="bg-orange-500 text-white shadow-md">
        <div className="flex items-center gap-3 p-3">
          {isMobile && onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-orange-600 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="relative">
            <img
              src={
                conversation.product?.images?.[0] || "/placeholder-image.jpg"
              }
              alt={conversation.product?.name}
              className="w-10 h-10 object-cover rounded-full"
            />
            {presence?.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base truncate">
              {otherUser?.full_name}
            </h2>
            <p className="text-xs text-orange-100">
              {presence?.is_online ? "Online" : "Offline"}
            </p>
          </div>

          <button className="p-2 hover:bg-orange-600 rounded-full">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Product Info Bar */}
      <div className="bg-white border-b px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Package size={16} className="text-orange-600 flex-shrink-0" />
            <span className="text-gray-700 truncate font-medium">
              {conversation.product?.name}
            </span>
            <span className="text-orange-600 font-bold flex-shrink-0">
              {formatPrice(originalPrice)}
            </span>
          </div>
          <Link
            href={`/product/${
              conversation.product?.slug || conversation.product?.id
            }`}
            className="text-orange-600 hover:text-orange-700 font-medium flex-shrink-0 ml-2"
          >
            View →
          </Link>
        </div>
      </div>

      {/* Messages Area - WhatsApp Style */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message) => {
            const isSender = message.sender_id === currentUserId;
            const isOffer = message.message_type === "offer";
            const isSystem = message.message_type === "system";

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center my-2">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm">
                    {message.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${
                  isSender ? "justify-end" : "justify-start"
                } mb-1`}
              >
                <div className={`max-w-[85%] sm:max-w-md`}>
                  {isOffer && message.offer ? (
                    <div
                      className={`rounded-lg p-3 shadow-md ${
                        isSender
                          ? "bg-orange-500 text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={18} className="flex-shrink-0" />
                        <span className="font-semibold text-sm">
                          {isSender ? "Your Offer" : "Received Offer"}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="opacity-90">Original:</span>
                          <span className="font-medium">
                            {formatPrice(message.offer?.original_price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-90">
                            {message.offer.additional_amount >= 0
                              ? "Additional:"
                              : "Discount:"}
                          </span>
                          <span className="font-medium">
                            {message.offer.additional_amount >= 0 ? "+" : ""}
                            {formatPrice(message.offer.additional_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/20">
                          <span className="font-bold">Total Offer:</span>
                          <span className="font-bold text-lg">
                            {formatPrice(message.offer.offered_price)}
                          </span>
                        </div>
                      </div>

                      {message.offer.status === "pending" &&
                        !isSender &&
                        isVendor && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                handleRespondToOffer(message.offer.id, true)
                              }
                              className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-1 font-medium shadow-sm"
                            >
                              <Check size={16} />
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleRespondToOffer(message.offer.id, false)
                              }
                              className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-1 font-medium shadow-sm"
                            >
                              <X size={16} />
                              Decline
                            </button>
                          </div>
                        )}

                      {message.offer.status !== "pending" && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <span
                            className={`text-xs font-semibold ${
                              isSender
                                ? "text-white/90"
                                : message.offer.status === "accepted"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {message.offer.status === "accepted"
                              ? "✓ Accepted"
                              : "✗ Rejected"}
                          </span>
                        </div>
                      )}

                      <p className="text-xs opacity-75 mt-2 text-right">
                        {new Date(message.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg px-3 py-2 shadow-md ${
                        isSender
                          ? "bg-orange-500 text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          isSender ? "text-white/75" : "text-gray-500"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 bg-white/50 backdrop-blur-sm p-6 rounded-lg">
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - WhatsApp Style */}
      <div className="bg-white border-t p-3 shadow-lg">
        {!isVendor && (
          <button
            onClick={() => setShowOfferModal(true)}
            className="w-full mb-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <DollarSign size={18} />
            Make an Offer
          </button>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sendMessage.isPending}
            className="bg-orange-500 text-white p-2.5 rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Offer Modal - Beautiful Glossy Design */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - Glossy White */}
          <div
            className="absolute inset-0 backdrop-blur-md bg-white/40"
            onClick={() => setShowOfferModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-md w-full border border-white/50">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent rounded-2xl pointer-events-none"></div>

            <div className="relative">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign className="text-orange-500" />
                Make an Offer
              </h3>

              <div className="space-y-5">
                {/* Product Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Product</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {conversation.product?.name}
                  </p>
                </div>

                {/* Original Price */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50 shadow-sm">
                  <p className="text-sm text-gray-700 mb-1">Original Price</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {formatPrice(originalPrice)}
                  </p>
                </div>

                {/* Offer Input */}
                <form onSubmit={handleCreateOffer}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={minAllowedPrice}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={`Min: €${minAllowedPrice.toFixed(2)}`}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold bg-white/50 backdrop-blur-sm"
                    required
                    autoFocus
                  />

                  {/* Price Difference Display */}
                  {offerAmount && !isNaN(parseFloat(offerAmount)) && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl border border-green-200/50 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700">
                          Difference:
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            parseFloat(offerAmount) >= originalPrice
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {parseFloat(offerAmount) >= originalPrice ? "+" : ""}
                          {formatPrice(parseFloat(offerAmount) - originalPrice)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-green-200/50">
                        <p className="text-xs text-gray-600 mb-1">
                          Your total offer:
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatPrice(parseFloat(offerAmount))}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Min Price Info */}
                  <p className="text-xs text-gray-500 mt-2">
                    * Minimum allowed: {formatPrice(minAllowedPrice)} (50% of
                    original price)
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOfferModal(false);
                        setOfferAmount("");
                      }}
                      className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createOffer.isPending || !offerAmount}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 transition-all font-medium shadow-lg disabled:shadow-none"
                    >
                      {createOffer.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </span>
                      ) : (
                        "Send Offer"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
