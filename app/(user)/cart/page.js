"use client";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import Link from "next/link";

export default function CartPage() {
  const {
    items: cartItems,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const { addToast } = useToast();

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

  const handleClearCart = () => {
    clearCart();
    addToast("Cart cleared", "info");
  };

  const calculateTotals = () => {
    const subtotal = (cartItems || []).reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 0;
      return total + itemPrice * itemQuantity;
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const totals = calculateTotals();

  if (cartItems.length === 0) {
    return (
      <div className="max-h-max bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
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
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600">
              Start shopping to add items to your cart
            </p>
            <Link
              href="/"
              className="mt-6 inline-block bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
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
            <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-600">{totalItems} items in your cart</p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item) => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemQuantity = parseInt(item.quantity) || 0;

                return (
                  <div
                    key={`${item.id}-${item.selectedColor || "default"}-${
                      item.selectedSize || "default"
                    }`}
                    className="p-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image || "/placeholder-image.jpg"}
                        alt={item.name || "Product"}
                        className="w-20 h-20 object-cover rounded-md"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {item.name || "Unknown Product"}
                        </h3>

                        {/* Item variants */}
                        <div className="text-sm text-gray-500 mb-2">
                          {item.selectedColor && (
                            <span className="mr-4">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span>Size: {item.selectedSize}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-800">
                              ₦{itemPrice.toFixed(2)}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item, itemQuantity - 1)
                                }
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={itemQuantity <= 1}
                              >
                                −
                              </button>
                              <span className="px-4 py-1 border-l border-r border-gray-300 min-w-12 text-center">
                                {itemQuantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item, itemQuantity + 1)
                                }
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-lg text-gray-800">
                              ₦{(itemPrice * itemQuantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item)}
                              className="text-red-500 hover:text-red-700 p-1 transition-colors"
                              aria-label="Remove item"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-medium">₦{totals.subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {parseFloat(totals.shipping) === 0
                      ? "Free"
                      : `₦${totals.shipping}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">₦{totals.tax}</span>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{totals.total}</span>
                </div>
              </div>

              {parseFloat(totals.subtotal) < 50000 &&
                parseFloat(totals.shipping) > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800">
                      <strong>Free Shipping:</strong> Add ₦
                      {(50000 - parseFloat(totals.subtotal)).toFixed(2)} more
                      for free shipping!
                    </p>
                  </div>
                )}

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors text-center block font-medium"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors text-center block font-medium"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Secure Checkout
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Money Back Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
