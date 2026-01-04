// src/components/messages/ChatWindow/OfferModal.jsx
"use client";

import { useState, useMemo } from "react";
import { DollarSign, X } from "lucide-react";
import { useCreateOffer } from "@/hooks/useChat";
import { useToast } from "@/lib/toast";

export default function OfferModal({ conversation, originalPrice, onClose }) {
  const [offerAmount, setOfferAmount] = useState("");
  const { addToast } = useToast();
  const createOffer = useCreateOffer(conversation.id);

  const minAllowedPrice = useMemo(() => originalPrice * 0.5, [originalPrice]);

  const priceDifference = useMemo(() => {
    const offered = parseFloat(offerAmount);
    if (isNaN(offered)) return null;
    return offered - originalPrice;
  }, [offerAmount, originalPrice]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const offered = parseFloat(offerAmount);

    if (isNaN(offered)) {
      addToast("Please enter a valid price", "error");
      return;
    }

    if (offered < minAllowedPrice) {
      addToast(
        `Offer must be at least ${formatPrice(
          minAllowedPrice
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
          addToast("Offer sent successfully!", "success");
          onClose();
        },
        onError: (error) => {
          addToast(error.message || "Failed to send offer", "error");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-white/40"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-md w-full border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent rounded-2xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="text-orange-500" />
              Make an Offer
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

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
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Offer Price (€)
              </label>
              <input
                type="number"
                step="0.01"
                min={minAllowedPrice}
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder={`Min: ${formatPrice(minAllowedPrice)}`}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold bg-white/50 backdrop-blur-sm"
                required
                autoFocus
              />

              {/* Price Difference Display */}
              {priceDifference !== null && (
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl border border-green-200/50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Difference:</span>
                    <span
                      className={`text-lg font-bold ${
                        priceDifference >= 0
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {priceDifference >= 0 ? "+" : ""}
                      {formatPrice(priceDifference)}
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
                  onClick={onClose}
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
  );
}
