// src/components/messages/ChatWindow/MessageBubble.jsx
"use client";

import { useMemo } from "react";
import { DollarSign, Check, X, Clock } from "lucide-react";
import { useRespondToOffer } from "@/hooks/useChat";
import { useToast } from "@/lib/toast";

export default function MessageBubble({
  message,
  currentUserId,
  originalPrice,
  isVendor,
  showDateSeparator,
}) {
  const { addToast } = useToast();
  const respondToOffer = useRespondToOffer();

  const isSender = message.sender_id === currentUserId;
  const isOffer = message.message_type === "offer";
  const isSystem = message.message_type === "system";

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        onError: (error) => {
          addToast(error.message || "Failed to respond to offer", "error");
        },
      }
    );
  };

  if (showDateSeparator) {
    return (
      <>
        <DateSeparator date={message.created_at} />
        <MessageContent
          message={message}
          isSender={isSender}
          isOffer={isOffer}
          isSystem={isSystem}
          isVendor={isVendor}
          currentUserId={currentUserId}
          formatPrice={formatPrice}
          formatTime={formatTime}
          handleRespondToOffer={handleRespondToOffer}
        />
      </>
    );
  }

  return (
    <MessageContent
      message={message}
      isSender={isSender}
      isOffer={isOffer}
      isSystem={isSystem}
      isVendor={isVendor}
      currentUserId={currentUserId}
      formatPrice={formatPrice}
      formatTime={formatTime}
      handleRespondToOffer={handleRespondToOffer}
    />
  );
}

function DateSeparator({ date }) {
  const formatDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="flex justify-center my-4">
      <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs px-3 py-1.5 rounded-full shadow-sm font-medium">
        {formatDate(date)}
      </span>
    </div>
  );
}

// src/components/messages/ChatWindow/MessageBubble.jsx

function MessageContent({
  message,
  isSender,
  isOffer,
  isSystem,
  isVendor,
  currentUserId,
  formatPrice,
  formatTime,
  handleRespondToOffer,
}) {
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm">
          {message.content}
        </span>
      </div>
    );
  }

  // **FIX**: Safely extract offer from array or object
  const offerData = useMemo(() => {
    if (!message.offer) return null;

    // If it's an array, get the first item
    if (Array.isArray(message.offer)) {
      return message.offer.length > 0 ? message.offer[0] : null;
    }

    // If it's already an object, use it
    return message.offer;
  }, [message.offer]);

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-1`}>
      <div className="max-w-[85%] sm:max-w-md">
        {isOffer && offerData ? (
          <OfferBubble
            message={message}
            offer={offerData}
            isSender={isSender}
            isVendor={isVendor}
            currentUserId={currentUserId}
            formatPrice={formatPrice}
            formatTime={formatTime}
            handleRespondToOffer={handleRespondToOffer}
          />
        ) : (
          <TextBubble
            message={message}
            isSender={isSender}
            formatTime={formatTime}
          />
        )}
      </div>
    </div>
  );
}

function OfferBubble({
  message,
  offer, // Now passed as a separate prop
  isSender,
  isVendor,
  currentUserId,
  formatPrice,
  formatTime,
  handleRespondToOffer,
}) {
  // **FIX**: Add safety checks
  if (!offer) {
    console.warn("OfferBubble rendered without offer data");
    return null;
  }

  // Determine if current user can respond to this offer
  const canRespond = useMemo(() => {
    return isVendor && !isSender && offer.status === "pending";
  }, [isVendor, isSender, offer.status]);

  // Check if offer has expired
  const isExpired = useMemo(() => {
    if (!offer.expires_at) return false;
    return new Date(offer.expires_at) < new Date();
  }, [offer.expires_at]);

  // **FIX**: Ensure numeric values
  const offeredPrice = parseFloat(offer.offered_price) || 0;
  const originalPrice = parseFloat(offer.original_price) || 0;
  const additionalAmount = parseFloat(offer.additional_amount) || 0;

  // Determine offer type
  const isDiscount = additionalAmount < 0;
  const isExactPrice = additionalAmount === 0;

  return (
    <div
      className={`rounded-lg p-3 shadow-md ${
        isSender
          ? "bg-orange-500 text-white rounded-tr-none"
          : "bg-white text-gray-800 rounded-tl-none"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="flex-shrink-0" />
          <span className="font-semibold text-sm">
            {isSender ? "Your Offer" : "Price Offer"}
          </span>
        </div>

        {/* Status Badge */}
        {offer.status !== "pending" && (
          <StatusBadge status={offer.status} isSender={isSender} />
        )}
        {isExpired && offer.status === "pending" && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isSender ? "bg-white/20" : "bg-gray-200"
            }`}
          >
            Expired
          </span>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 text-sm mb-3">
        {/* Original Price */}
        <div className="flex justify-between items-center">
          <span className={isSender ? "text-white/80" : "text-gray-600"}>
            Original Price:
          </span>
          <span className="font-medium">{formatPrice(originalPrice)}</span>
        </div>

        {/* Offer Amount */}
        <div className="flex justify-between items-center">
          <span className={isSender ? "text-white/80" : "text-gray-600"}>
            Offered Price:
          </span>
          <span className="font-bold text-lg">{formatPrice(offeredPrice)}</span>
        </div>

        {/* Difference (only show if not exact price) */}
        {!isExactPrice && (
          <div
            className={`flex justify-between items-center pt-2 border-t ${
              isSender ? "border-white/20" : "border-gray-200"
            }`}
          >
            <span className={isSender ? "text-white/80" : "text-gray-600"}>
              {isDiscount ? "Discount:" : "Additional:"}
            </span>
            <span
              className={`font-semibold ${
                isSender
                  ? "text-white"
                  : isDiscount
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {isDiscount ? "-" : "+"}
              {formatPrice(Math.abs(additionalAmount))}
              {!isDiscount && !isSender && originalPrice > 0 && (
                <span className="text-xs ml-1">
                  ({((additionalAmount / originalPrice) * 100).toFixed(0)}%
                  more)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canRespond && !isExpired && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => handleRespondToOffer(offer.id, true)}
            className="flex-1 bg-green-500 text-white px-3 py-2.5 rounded-lg hover:bg-green-600 active:bg-green-700 flex items-center justify-center gap-1.5 font-medium shadow-sm transition-all"
          >
            <Check size={16} />
            Accept
          </button>
          <button
            onClick={() => handleRespondToOffer(offer.id, false)}
            className="flex-1 bg-red-500 text-white px-3 py-2.5 rounded-lg hover:bg-red-600 active:bg-red-700 flex items-center justify-center gap-1.5 font-medium shadow-sm transition-all"
          >
            <X size={16} />
            Decline
          </button>
        </div>
      )}

      {/* Status Message */}
      {offer.status !== "pending" && (
        <div
          className={`mt-3 pt-3 border-t ${
            isSender ? "border-white/20" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                isSender
                  ? "text-white/90"
                  : offer.status === "accepted"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {offer.status === "accepted"
                ? "✓ Offer Accepted"
                : offer.status === "rejected"
                ? "✗ Offer Declined"
                : "Offer Expired"}
            </span>
            {offer.responded_at && (
              <span
                className={`text-xs ${
                  isSender ? "text-white/60" : "text-gray-500"
                }`}
              >
                {formatTime(offer.responded_at)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <p
          className={`text-xs ${isSender ? "text-white/75" : "text-gray-500"}`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status, isSender }) {
  const getStatusStyles = () => {
    if (status === "accepted") {
      return isSender
        ? "bg-green-500/20 text-white"
        : "bg-green-100 text-green-700";
    }
    if (status === "rejected") {
      return isSender ? "bg-red-500/20 text-white" : "bg-red-100 text-red-700";
    }
    if (status === "expired") {
      return isSender
        ? "bg-gray-500/20 text-white"
        : "bg-gray-100 text-gray-700";
    }
    return "";
  };

  const getStatusText = () => {
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Declined";
    if (status === "expired") return "Expired";
    return status;
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyles()}`}
    >
      {getStatusText()}
    </span>
  );
}

function TextBubble({ message, isSender, formatTime }) {
  return (
    <div
      className={`rounded-lg px-3 py-2 shadow-md ${
        isSender
          ? "bg-orange-500 text-white rounded-tr-none"
          : "bg-white text-gray-800 rounded-tl-none"
      }`}
    >
      <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>
      <div className="flex items-center justify-end gap-1 mt-1">
        <p
          className={`text-xs ${isSender ? "text-white/75" : "text-gray-500"}`}
        >
          {formatTime(message.created_at)}
        </p>
        {isSender && (
          <span className="text-xs text-white/75">
            {message.is_read ? "✓✓" : "✓"}
          </span>
        )}
      </div>
    </div>
  );
}
