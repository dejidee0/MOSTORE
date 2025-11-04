// app/(user)/checkout/CheckoutContent.js - Create this new file
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import {
  Package,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Lock,
  Wallet,
  Building2,
} from "lucide-react";
import useUserStore from "@/lib/stores/useUserStore";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Validate environment variables
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable"
  );
}

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Dynamically import the PaymentWidget with SSR disabled
const PaymentWidget = dynamic(() => import("./PaymentWidget"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
        <span className="text-sm text-gray-600">Loading payment form...</span>
      </div>
    </div>
  ),
});

export default function CheckoutContent() {
  const { cart, total, itemCount, clearCart } = useCart();
  const { user } = useUserStore();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core states
  const [mounted, setMounted] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  // Payment flow states
  const [currentStep, setCurrentStep] = useState("form"); // "form" | "payment"
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentReady, setPaymentReady] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    saveInfo: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  // Check if Stripe is loaded
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripe = await stripePromise;
        if (stripe) {
          setStripeLoaded(true);
        } else {
          throw new Error("Stripe failed to initialize");
        }
      } catch (err) {
        console.error("Failed to load Stripe:", err);
        addToast(
          "Payment system unavailable. Please check your connection and refresh the page.",
          "error"
        );
      }
    };

    initializeStripe();
  }, [addToast]);

  // Handle redirect back from Stripe for 3DS authentication
  useEffect(() => {
    if (!mounted || !stripeLoaded) return;

    const clientSecretParam = searchParams.get("payment_intent_client_secret");
    if (clientSecretParam) {
      handlePaymentReturn(clientSecretParam);
    }
  }, [searchParams, stripeLoaded, mounted]);

  const handlePaymentReturn = async (clientSecret) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe not available");
      }

      const { paymentIntent, error } = await stripe.retrievePaymentIntent(
        clientSecret
      );

      if (error) {
        console.error("Payment retrieval error:", error);
        addToast(error.message, "error");
        return;
      }

      if (!paymentIntent) {
        addToast("Unable to retrieve payment information", "error");
        return;
      }

      switch (paymentIntent.status) {
        case "succeeded":
          clearCart();
          addToast("Payment successful!", "success");
          router.push(`/order-success?reference=${paymentIntent.id}`);
          break;
        case "processing":
          addToast("Payment is processing. We'll update you soon.", "info");
          router.push(
            `/order-success?reference=${paymentIntent.id}&status=processing`
          );
          break;
        case "requires_payment_method":
          addToast(
            "Payment failed. Please try with a different payment method.",
            "error"
          );
          setCurrentStep("form");
          break;
        default:
          addToast(
            `Payment status: ${paymentIntent.status}. Please contact support.`,
            "warning"
          );
          break;
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      addToast("Error confirming payment. Please contact support.", "error");
    }
  };

  useEffect(() => setMounted(true), []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Calculate order totals
  const subtotal = total || 0;
  const shippingFee = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal;

  const validateForm = () => {
    const errors = {};
    const required = {
      name: "Full name",
      address: "Address",
      city: "City",
      phone: "Phone number",
      email: "Email address",
    };

    // Check required fields
    Object.entries(required).forEach(([field, label]) => {
      if (!formData[field]?.trim()) {
        errors[field] = `${label} is required`;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (
      formData.phone &&
      !/^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/.test(formData.phone)
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const initializePayment = async () => {
    try {
      const orderData = {
        customerInfo: formData,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          vendor_id: item.supplier_id || null,
          image: item.image || "",
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

      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(finalTotal.toFixed(2)),
          currency: "EUR",
          orderData,
          customerEmail: formData.email,
          description: `Order for ${formData.name} - ${itemCount} items`,
          automatic_payment_methods: {
            enabled: true,
          },
          payment_method_types: [
            "card",
            "sepa_debit",
            "ideal",
            "sofort",
            "bancontact",
            "eps",
            "giropay",
            "p24",
            "alipay",
            "wechat_pay",
            "paypal",
            "klarna",
            "afterpay_clearpay",
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || "Payment initialization failed";
        } catch {
          errorMessage = `Payment initialization failed (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Payment initialization failed");
      }

      return result.clientSecret;
    } catch (error) {
      console.error("Payment initialization error:", error);
      throw error;
    }
  };

  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      addToast("Please fill in all required fields correctly", "error");
      return;
    }

    if (!cart?.length) {
      addToast("Your cart is empty", "error");
      return;
    }

    if (!stripeLoaded) {
      addToast(
        "Payment system is still loading. Please wait a moment.",
        "warning"
      );
      return;
    }

    setIsInitializingPayment(true);

    try {
      const secret = await initializePayment();
      setClientSecret(secret);
      setCurrentStep("payment");
      addToast("Payment form loaded successfully", "success");
    } catch (error) {
      console.error("Payment initialization error:", error);
      addToast(
        error.message || "Failed to initialize payment. Please try again.",
        "error"
      );
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
    setClientSecret(null);
    setPaymentReady(false);
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
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            {currentStep === "payment" && (
              <button
                onClick={handleBackToForm}
                className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm"
              >
                <ArrowLeft size={16} />
                Back to Form
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {currentStep === "form"
              ? "Enter your billing details below"
              : "Choose your preferred payment method to complete the order"}
          </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form or Payment */}
            <div className="space-y-6">
              {currentStep === "form" ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Billing Details
                  </h2>
                  <div className="space-y-4">
                    {[
                      { field: "name", label: "Full Name", required: true },
                      {
                        field: "company",
                        label: "Company Name (Optional)",
                        required: false,
                      },
                      { field: "address", label: "Address", required: true },
                      { field: "city", label: "City", required: true },
                      {
                        field: "phone",
                        label: "Phone Number",
                        required: true,
                        type: "tel",
                      },
                      {
                        field: "email",
                        label: "Email Address",
                        required: true,
                        type: "email",
                      },
                    ].map(({ field, label, required, type = "text" }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label} {required && "*"}
                        </label>
                        <input
                          type={type}
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          placeholder={`Enter your ${field
                            .replace(/([A-Z])/g, " $1")
                            .toLowerCase()}`}
                          className={`w-full h-12 px-4 bg-gray-50 rounded-md border-0 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                            formErrors[field]
                              ? "focus:ring-red-500 ring-2 ring-red-500"
                              : "focus:ring-orange-500"
                          }`}
                          required={required}
                        />
                        {formErrors[field] && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors[field]}
                          </p>
                        )}
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
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet size={18} />
                    Payment Methods
                    <Lock size={14} className="text-green-500 ml-auto" />
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose your preferred payment method. All methods are secure
                    and encrypted.
                  </p>
                  {clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#f97316",
                            borderRadius: "6px",
                            fontFamily: "system-ui, sans-serif",
                          },
                        },
                      }}
                    >
                      <PaymentWidget
                        clientSecret={clientSecret}
                        formData={formData}
                        onPaymentReady={() => setPaymentReady(true)}
                      />
                    </Elements>
                  )}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="text-green-600" size={16} />
                      <span className="text-xs text-green-800 font-medium">
                        Secured by Stripe • SSL Encrypted • PCI Compliant
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
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {currentStep === "form" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Available Payment Methods
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Wallet className="text-blue-600" size={20} />
                        <span className="font-medium text-gray-800">
                          Multiple Payment Options
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} />
                          Credit/Debit Cards
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 size={14} />
                          Bank Transfer
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet size={14} />
                          Digital Wallets
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield size={14} />
                          Local Methods
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Available methods will be shown based on your location
                        and order details
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    disabled={isInitializingPayment || !stripeLoaded}
                    className="w-full h-14 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isInitializingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Loading Payment Options...
                      </>
                    ) : (
                      <>
                        <Wallet size={20} />
                        Continue to Payment
                      </>
                    )}
                  </button>

                  {!stripeLoaded && (
                    <div className="text-xs text-orange-500 mt-2 text-center flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-500"></div>
                      Loading payment system...
                    </div>
                  )}
                </div>
              )}

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
        )}
      </main>
    </div>
  );
}
