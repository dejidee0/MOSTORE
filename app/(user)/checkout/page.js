// app/checkout/page.js - Paystack Integration (NGN only, no coupons)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import {
  Package,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Check,
  Lock,
} from "lucide-react";
import { saveOrderToDatabase } from "@/lib/database";
import useUserStore from "@/lib/stores/useUserStore";

export default function CheckoutPage() {
  const { cart, total, itemCount, clearCart } = useCart();
  const { user } = useUserStore();
  const { addToast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    saveInfo: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("paystack");

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      addToast("Payment system unavailable. Please try again later.", "error");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Calculate totals (all in NGN)
  const subtotal = total || 0;
  const shippingFee = subtotal > 5000 ? 0 : 1000; // Free shipping above ₦5,000
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + shippingFee + tax;

  const validateForm = () => {
    const requiredFields = ["name", "address", "city", "phone", "email"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      addToast(`Please fill in: ${missingFields.join(", ")}`, "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      addToast("Please enter a valid email address", "error");
      return false;
    }

    const phoneRegex = /^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      addToast("Please enter a valid phone number", "error");
      return false;
    }

    return true;
  };

  // Initialize payment with backend
  const initializePayment = async (orderData) => {
    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          amount: Math.round(finalTotal * 100), // Convert to kobo
          currency: "NGN",
          orderData,
        }),
      });

      if (!response.ok) {
        console.error(
          "API response not ok:",
          response.status,
          response.statusText
        );
        // If API fails, we can still proceed with a client-side reference
        return {
          success: true,
          reference: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: "Using client-side reference (API unavailable)",
        };
      }

      const data = await response.json();
      console.log("Payment initialization API response:", data);
      return data;
    } catch (error) {
      console.error("Payment initialization error:", error);
      // Fallback to client-side reference generation
      return {
        success: true,
        reference: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: "Using client-side reference (API error)",
      };
    }
  };

  // Verify payment with backend
  const verifyPayment = async (reference) => {
    try {
      const response = await fetch(`/api/payment/verify/${reference}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Payment verification failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  };

  // Save order to database

  // Handle Paystack payment
  const handlePaystackPayment = async (orderData) => {
    if (!paystackLoaded || !window.PaystackPop) {
      addToast("Payment system not ready. Please try again.", "error");
      return;
    }

    try {
      console.log("Initializing payment with data:", {
        email: formData.email,
        amount: Math.round(finalTotal * 100),
        currency: "NGN",
      });

      // Initialize payment with backend
      const initData = await initializePayment(orderData);
      console.log("Backend initialization response:", initData);

      if (!initData.success) {
        throw new Error(initData.message || "Payment initialization failed");
      }

      // Use the reference from backend or generate one
      const paymentReference =
        initData.reference ||
        `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log("Setting up Paystack with reference:", paymentReference);

      // Configure Paystack popup
      const paystackConfig = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount: Math.round(finalTotal * 100), // Convert to kobo
        currency: "NGN",
        reference: paymentReference,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: formData.name,
            },
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: formData.phone,
            },
          ],
        },
        callback: function (response) {
          console.log("Payment callback triggered:", response);
          setIsProcessing(false);

          // Handle verification without async/await in callback
          verifyPayment(response.reference)
            .then((verificationResult) => {
              console.log("Verification result:", verificationResult);
              if (verificationResult.success) {
                // Prepare order data for database
                const orderForDatabase = {
                  id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  customerInfo: formData,
                  customer_id: user.id,
                  customerName: formData.name,
                  customerEmail: formData.email,
                  customerPhone: formData.phone,
                  customerAddress: formData.address,
                  customerCity: formData.city,
                  customerCompany: formData.company,
                  items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor,
                    selectedSize: item.selectedSize,
                    image: item.image,
                  })),
                  pricing: {
                    subtotal,
                    tax,
                    shipping: shippingFee,
                    total: finalTotal,
                  },
                  subtotal,
                  tax,
                  shipping: shippingFee,
                  total: finalTotal,
                  paymentMethod: "paystack",
                  paymentStatus: "completed",
                  paymentReference: response.reference,
                  status: "confirmed",
                  paystackData: response,
                  orderDate: new Date().toISOString(),
                };

                // Save order to database
                return saveOrderToDatabase(orderForDatabase);
              } else {
                throw new Error("Payment verification failed");
              }
            })
            .then((savedOrder) => {
              console.log("Order saved successfully:", savedOrder);

              // Clear cart and show success
              clearCart();
              addToast(
                "Payment successful! Thank you for your purchase.",
                "success",
                5000
              );

              // Reset form
              setFormData({
                name: "",
                company: "",
                address: "",
                city: "",
                phone: "",
                email: "",
                saveInfo: false,
              });

              // Redirect to success page with order ID
              setTimeout(() => {
                router.push(
                  `/order-success?reference=${response.reference}&orderId=${savedOrder.id}`
                );
              }, 2000);
            })
            .catch((error) => {
              console.error("Order processing error:", error);
              addToast(
                error.message ||
                  "Order processing failed. Please contact support.",
                "error"
              );
            });
        },
        onClose: function () {
          console.log("Payment popup closed by user");
          setIsProcessing(false);
          addToast("Payment cancelled", "warning");
        },
      };

      console.log("Paystack configuration:", paystackConfig);

      // Validate required fields before opening popup
      if (!paystackConfig.key) {
        throw new Error(
          "Paystack public key not found. Check your environment variables."
        );
      }

      if (!paystackConfig.email || !paystackConfig.amount) {
        throw new Error("Missing required payment information.");
      }

      const handler = window.PaystackPop.setup(paystackConfig);

      console.log("Opening Paystack popup...");
      handler.openIframe();
    } catch (error) {
      console.error("Paystack payment error:", error);
      setIsProcessing(false);
      addToast(
        error.message || "Payment initialization failed. Please try again.",
        "error"
      );
    }
  };

  // Handle cash on delivery

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cart || cart.length === 0) {
      addToast("Your cart is empty", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        customerInfo: formData,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          image: item.image,
        })),
        pricing: {
          subtotal,
          tax,
          shipping: shippingFee,
          total: finalTotal,
        },
        paymentMethod,
        orderDate: new Date().toISOString(),
      };

      // Handle payment based on selected method

      await handlePaystackPayment(orderData);
    } catch (error) {
      console.error("Order processing error:", error);
      addToast("Failed to process order. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format price in Naira
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package
            className="mx-auto text-orange-500 mb-4 animate-pulse"
            size={64}
          />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Package className="text-orange-500" size={32} />
              <h1 className="text-2xl font-bold text-gray-900">Your Store</h1>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                href="/cart"
                className="text-orange-500 hover:text-orange-600 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Cart
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order below</p>
        </div>

        {!cart || cart.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto text-gray-400 mb-6" size={80} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some products to your cart before checking out.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
            >
              <Package size={20} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Billing Details */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Billing Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Enter company name"
                        className="w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your street address"
                        className="w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        className="w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        name="saveInfo"
                        checked={formData.saveInfo}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <label className="text-sm text-gray-700">
                        Save this information for faster checkout next time
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order Summary ({itemCount} items)
                  </h2>

                  {/* Product Items */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"
                      >
                        <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-gray-400" size={24} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.selectedColor &&
                                `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && " • "}
                              {item.selectedSize &&
                                `Size: ${item.selectedSize}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span
                        className={
                          shippingFee === 0 ? "text-green-600" : "text-gray-900"
                        }
                      >
                        {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (8%):</span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(tax)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Method
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 border-2 rounded-lg transition-colors hover:border-orange-200 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                      <input
                        type="radio"
                        name="payment"
                        value="paystack"
                        checked={paymentMethod === "paystack"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                      />
                      <label className="text-sm text-gray-700 flex items-center gap-2 flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} />
                          <div>
                            <div className="font-medium">
                              Pay With Card, Bank Transfers, USSD
                            </div>
                            <div className="text-xs text-gray-500">
                              Secured by Paystack
                            </div>
                          </div>
                        </div>
                        <Lock size={14} className="text-green-500 ml-auto" />
                      </label>
                    </div>
                  </div>

                  {/* Payment Security Info */}
                  {paymentMethod === "paystack" && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="text-green-600" size={16} />
                        <span className="text-sm font-medium text-green-800">
                          Secure Payment
                        </span>
                      </div>
                      <p className="text-xs text-green-700">
                        Your payment information is encrypted and secured by
                        Paystack. We don`&apos`t store your card details.
                      </p>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={
                      isProcessing ||
                      (paymentMethod === "paystack" && !paystackLoaded)
                    }
                    className="w-full h-14 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing Order...
                      </>
                    ) : paymentMethod === "paystack" ? (
                      <>
                        <CreditCard size={20} />
                        Pay {formatPrice(finalTotal)}
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Place Order - {formatPrice(finalTotal)}
                      </>
                    )}
                  </button>

                  {paymentMethod === "paystack" && !paystackLoaded && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Loading payment system...
                    </p>
                  )}
                </div>

                {/* Security Features */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200">
                    <Shield className="text-orange-500" size={24} />
                    <span className="text-xs text-gray-600 font-medium">
                      Secure Payment
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200">
                    <Package className="text-orange-500" size={24} />
                    <span className="text-xs text-gray-600 font-medium">
                      Easy Returns
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200">
                    <Truck className="text-orange-500" size={24} />
                    <span className="text-xs text-gray-600 font-medium">
                      Fast Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
