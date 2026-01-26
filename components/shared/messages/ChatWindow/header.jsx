// src/components/messages/ChatWindow/ChatHeader.jsx
"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import PresenceIndicator from "../presenceIndicator";

export default function ChatHeader({
  conversation,
  otherUser,
  presence,
  isMobile,
  onBack,
}) {
  return (
    <div className="bg-orange-500 text-white shadow-md">
      <div className="flex items-center gap-3 p-3">
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="p-1 hover:bg-orange-600 rounded-full transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={24} />
          </button>
        )}

        <div className="relative">
          <img
            src={conversation.product?.images?.[0] || "/placeholder-image.jpg"}
            alt={conversation.product?.name || "Product"}
            className="w-10 h-10 object-cover rounded-full"
          />
          <PresenceIndicator
            isOnline={presence?.is_online}
            className="absolute bottom-0 right-0"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base truncate">
            {otherUser?.full_name || "Unknown User"}
          </h2>
          <p className="text-xs text-orange-100">
            {presence?.is_online ? "Online" : "Offline"}
          </p>
        </div>

        <button
          className="p-2 hover:bg-orange-600 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Product Info Bar */}
      <ProductInfoBar product={conversation.product} />
    </div>
  );
}

function ProductInfoBar({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="bg-white border-b px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Package size={16} className="text-orange-600 flex-shrink-0" />
          <span className="text-gray-700 truncate font-medium">
            {product?.name || "Product"}
          </span>
          <span className="text-orange-600 font-bold flex-shrink-0">
            {formatPrice(product?.price || 0)}
          </span>
        </div>
        <a
          href={`/products/${product?.id}`}
          className="text-orange-600 hover:text-orange-700 font-medium flex-shrink-0 ml-2 transition-colors"
        >
          View →
        </a>
      </div>
    </div>
  );
}

function Package({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" x2="12" y1="22.08" y2="12" />
    </svg>
  );
}
