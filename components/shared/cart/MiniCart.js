// components/cart/MiniCart.js - Mini Cart Dropdown
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";

export const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cart, removeItem, updateQuantity, getCartItemsCount, getCartTotal } =
    useCart();
  const { addToast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveItem = (item) => {
    removeItem(item.id, item.selectedColor, item.selectedSize);
    addToast(`${item.name} removed from cart`, "info");
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
    } else {
      updateQuantity(
        item.id,
        newQuantity,
        item.selectedColor,
        item.selectedSize
      );
    }
  };

  const itemCount = getCartItemsCount();
  const total = getCartTotal();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md"
        aria-label="Shopping cart"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 8.2M7 13h10M16 18a2 2 0 11-4 0 2 2 0 014 0zM6 18a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>

        {/* Cart Item Count Badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Shopping Cart
            </h3>
            <p className="text-sm text-gray-500">{itemCount} items</p>
          </div>

          {cart.items.length === 0 ? (
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 8.2M7 13h10"
                />
              </svg>
              <p className="mt-2 text-gray-500">Your cart is empty</p>
              <Link
                href="/"
                className="mt-3 inline-block text-orange-500 hover:text-orange-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="max-h-64 overflow-y-auto">
                {cart.items.slice(0, 3).map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                    className="p-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || "/placeholder-image.jpg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </h4>
                        <div className="text-xs text-gray-500">
                          {item.selectedColor && (
                            <span className="mr-2">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span>Size: {item.selectedSize}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-semibold text-gray-800">
                            ${item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() =>
                                handleQuantityChange(item, item.quantity - 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item, item.quantity + 1)
                              }
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Remove item"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {cart.items.length > 3 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    +{cart.items.length - 3} more items
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-800">Total:</span>
                  <span className="font-bold text-lg text-gray-800">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/cart"
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors text-center block font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition-colors text-center block font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// components/cart/CartPage.js - Full Cart Page Component
