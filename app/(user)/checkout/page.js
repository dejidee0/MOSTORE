// app/checkout/page.js — SumUp Card Widget Integration
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
  Lock,
} from "lucide-react";
import { saveOrderToDatabase } from "@/lib/database";
import useUserStore from "@/lib/stores/useUserStore";

// Dynamically import the PaymentWidget with SSR disabled
const PaymentWidget = dynamic(() => import("./PaymentWidget"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
});

export default function CheckoutPage() {
  const { cart, total, itemCount, clearCart } = useCart();
  const { user } = useUserStore();
  const { addToast } = useToast();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sumupLoaded, setSumupLoaded] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    saveInfo: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("sumup");

  // Load SumUp Card Widget script
  useEffect(() => {
    const scriptSrc = "https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js";

    if (window.SumUpCard) {
      setSumupLoaded(true);
      return;
    }

    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existing) {
      const checkLoaded = () => {
        if (window.SumUpCard) {
          setSumupLoaded(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;

    const handleLoad = () => {
      setSumupLoaded(true);
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const handleError = () => {
      console.error("Failed to load SumUp script");
      addToast("Payment system unavailable. Please try again later.", "error");
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [addToast]);

  useEffect(() => setMounted(true), []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Calculate order totals
  const subtotal = total || 0;
  const shippingFee = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + shippingFee + tax;

  const validateForm = () => {
    const required = ["name", "address", "city", "phone", "email"];
    const missing = required.filter((f) => !formData[f]);
    if (missing.length) {
      addToast(`Please fill in: ${missing.join(", ")}`, "error");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      addToast("Please enter a valid email address", "error");
      return false;
    }
    if (!/^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/.test(formData.phone)) {
      addToast("Please enter a valid phone number", "error");
      return false;
    }
    return true;
  };

  const initializePayment = async (orderData) => {
    const res = await fetch("/api/payment/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(finalTotal.toFixed(2)),
        currency: "EUR",
        orderData,
        customerEmail: formData.email,
        description: `Order for ${formData.name}`,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Payment initialization failed: ${text}`);
    }
    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!cart?.length) {
      addToast("Your cart is empty", "error");
      return;
    }
    if (paymentMethod !== "sumup") {
      addToast("Please select a valid payment method", "error");
      return;
    }
    if (!sumupLoaded) {
      addToast("Payment system is loading. Please wait...", "warning");
      return;
    }

    setIsProcessing(true);

    try {
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
        pricing: { subtotal, tax, shipping: shippingFee, total: finalTotal },
        paymentMethod,
        orderDate: new Date().toISOString(),
      };

      const { checkoutId } = await initializePayment(orderData);
      setCheckoutId(checkoutId);
      setShowWidget(true);
    } catch (error) {
      console.error("Checkout error:", error);
      addToast(error.message || "Payment processing failed", "error");
      setShowWidget(false);
      setCheckoutId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order below</p>
        </div>

        {!cart?.length ? (
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
                    {[
                      "name",
                      "company",
                      "address",
                      "city",
                      "phone",
                      "email",
                    ].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field === "company"
                            ? "Company Name (Optional)"
                            : `${
                                field.charAt(0).toUpperCase() + field.slice(1)
                              } *`}
                        </label>
                        <input
                          type={
                            field === "email"
                              ? "email"
                              : field === "phone"
                              ? "tel"
                              : "text"
                          }
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          placeholder={`Enter your ${field}`}
                          className="w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                          required={field !== "company"}
                        />
                      </div>
                    ))}
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

                {/* Payment Widget Section */}
                {showWidget && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard size={18} />
                      Enter Card Details
                      <Lock size={14} className="text-green-500 ml-auto" />
                    </h2>
                    <PaymentWidget
                      checkoutId={checkoutId}
                      formData={formData}
                    />
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="text-green-600" size={16} />
                        <span className="text-xs text-green-800 font-medium">
                          Secured by SumUp • SSL Encrypted • PCI Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order Summary ({itemCount} items)
                  </h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
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
                              {[item.selectedColor, item.selectedSize]
                                .filter(Boolean)
                                .join(" • ")}
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

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    {[
                      { label: "Subtotal", value: subtotal },
                      {
                        label: "Shipping",
                        value: shippingFee,
                        free: shippingFee === 0,
                      },
                      { label: "Tax (8%)", value: tax },
                    ].map(({ label, value, free }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-600">{label}:</span>
                        <span
                          className={
                            free
                              ? "text-green-600"
                              : "text-gray-900 font-medium"
                          }
                        >
                          {free ? "Free" : formatPrice(value)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Method
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 border-2 rounded-lg transition-colors hover:border-orange-200 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                      <input
                        type="radio"
                        name="payment"
                        value="sumup"
                        checked={paymentMethod === "sumup"}
                        onChange={() => setPaymentMethod("sumup")}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                      />
                      <label className="text-sm text-gray-700 flex items-center gap-2 flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} />
                          <div>
                            <div className="font-medium">
                              Credit / Debit Card
                            </div>
                            <div className="text-xs text-gray-500">
                              Visa, Mastercard, American Express
                            </div>
                          </div>
                        </div>
                        <Lock size={14} className="text-green-500 ml-auto" />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isProcessing ||
                      (paymentMethod === "sumup" && !sumupLoaded) ||
                      showWidget
                    }
                    className="w-full h-14 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        {showWidget
                          ? "Complete payment above"
                          : "Continue to Payment"}
                      </>
                    )}
                  </button>

                  {!sumupLoaded && (
                    <div className="text-xs text-orange-500 mt-2 text-center flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-500"></div>
                      Loading payment system...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { icon: Shield, text: "Secure Payment" },
                    { icon: Package, text: "Easy Returns" },
                    { icon: Truck, text: "Fast Delivery" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <Icon className="text-orange-500" size={24} />
                      <span className="text-xs text-gray-600 font-medium">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
