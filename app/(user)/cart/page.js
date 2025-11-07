"use client";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const {
    items: cartItems,
    totalItems,
    totalPrice,
    isLoading,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
  } = useCart();

  const { addToast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const handleRemoveItem = async (item) => {
    try {
      const success = removeItem(
        item.id,
        item.selectedColor,
        item.selectedSize
      );
      if (success) {
        addToast(`${item.name} removed from cart`, "success");
      } else {
        addToast("Failed to remove item", "error");
      }
    } catch (error) {
      addToast("Failed to remove item", "error");
    }
  };

  const handleQuantityChange = async (item, newQuantity) => {
    const itemKey = `${item.id}-${item.selectedColor || "default"}-${
      item.selectedSize || "default"
    }`;

    // Add to updating set
    setUpdatingItems((prev) => new Set([...prev, itemKey]));

    try {
      if (newQuantity <= 0) {
        await handleRemoveItem(item);
      } else {
        const success = updateQuantity(
          item.id,
          newQuantity,
          item.selectedColor,
          item.selectedSize
        );

        if (!success) {
          addToast("Failed to update quantity", "error");
        }
      }
    } catch (error) {
      addToast("Failed to update quantity", "error");
    } finally {
      // Remove from updating set
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      const success = clearCart();
      if (success) {
        addToast("Cart cleared successfully", "success");
      } else {
        addToast("Failed to clear cart", "error");
      }
    } catch (error) {
      addToast("Failed to clear cart", "error");
    } finally {
      setIsClearing(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = (cartItems || []).reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 0;
      return total + itemPrice * itemQuantity;
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50000 ? 0 : 5990; // Free shipping over €50,000
    const total = subtotal;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const totals = calculateTotals();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 8.2M7 13h10"
              />
            </svg>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Discover amazing products and start shopping today!
            </p>
            <div className="space-y-3">
              <Link
                href="/products"
                className="inline-block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                Start Shopping
              </Link>
              <button
                onClick={refreshCart}
                className="inline-block w-full text-orange-600 hover:text-orange-700 py-2 text-sm font-medium"
              >
                Refresh Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refreshCart}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <button
              onClick={handleClearCart}
              disabled={isClearing}
              className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
            >
              {isClearing ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  Clearing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear Cart
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {cartItems.map((item) => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemQuantity = parseInt(item.quantity) || 0;
                const itemKey = `${item.id}-${
                  item.selectedColor || "default"
                }-${item.selectedSize || "default"}`;
                const isUpdating = updatingItems.has(itemKey);

                return (
                  <div
                    key={itemKey}
                    className={`p-6 border-b border-gray-100 last:border-b-0 transition-opacity duration-200 ${
                      isUpdating ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={
                            item.image ||
                            item.images?.[0] ||
                            "/placeholder-image.jpg"
                          }
                          alt={item.name || "Product"}
                          className="w-24 h-24 object-cover rounded-lg shadow-sm"
                        />
                        {isUpdating && (
                          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg mb-2">
                              {item.name || "Unknown Product"}
                            </h3>
                            {/* Item variants */}
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="text-sm text-gray-500 mb-3 flex items-center gap-4">
                                {item.selectedColor && (
                                  <span className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor:
                                          item.selectedColor.toLowerCase(),
                                      }}
                                    ></div>
                                    {item.selectedColor}
                                  </span>
                                )}
                                {item.selectedSize && (
                                  <span>
                                    Size: <strong>{item.selectedSize}</strong>
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Price */}{" "}
                            <div className="text-gray-800 font-semibold text-lg">
                              €{(itemPrice * itemQuantity).toLocaleString()}
                            </div>
                          </div>

                          {/* Remove Item Button */}
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-red-600 hover:text-red-800 ml-4 p-1 rounded-full transition-colors"
                            aria-label="Remove item"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(item, itemQuantity - 1)
                            }
                            disabled={itemQuantity <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                          >
                            -
                          </button>
                          <span className="px-3">{itemQuantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item, itemQuantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>€{parseFloat(totals.subtotal).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-gray-600 mb-4">
              <span>Delivery</span>
              <span>Free</span>
            </div>

            <div className="flex justify-between font-bold text-gray-900 text-lg mb-6">
              <span>Total incl. VAT</span>
              <span>€{parseFloat(totals.total).toLocaleString()}</span>
            </div>

            <button
              onClick={() => (window.location.href = "/checkout")}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={refreshCart}
              className="mt-3 w-full text-center text-orange-600 hover:text-orange-700 py-2 text-sm font-medium"
            >
              Refresh Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
