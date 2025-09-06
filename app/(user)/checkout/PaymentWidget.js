// app/(user)/checkout/PaymentWidget.js
"use client";
import { useEffect, useState, useRef } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore";
import { saveOrderToDatabase } from "@/lib/database";

export default function PaymentWidget({
  clientSecret,
  formData,
  onPaymentReady,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, total, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const { user } = useUserStore();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use ref to prevent multiple submissions
  const isSubmittingRef = useRef(false);
  const hasNotifiedParentRef = useRef(false);

  // Notify parent when ready (only once)
  useEffect(() => {
    if (
      stripe &&
      elements &&
      isReady &&
      onPaymentReady &&
      !hasNotifiedParentRef.current
    ) {
      hasNotifiedParentRef.current = true;
      onPaymentReady();
    }
  }, [stripe, elements, isReady, onPaymentReady]);

  const handleSuccessfulPayment = async (paymentIntent) => {
    try {
      const subtotal = total || 0;
      const shippingFee = subtotal > 50 ? 0 : 5;
      const tax = subtotal * 0.08;
      const finalTotal = subtotal + shippingFee + tax;

      const orderData = {
        id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        customerInfo: formData,
        customer_id: user?.id || null,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        customerCompany: formData.company || "",
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          image: item.image || "",
        })),
        pricing: {
          subtotal,
          tax,
          shipping: shippingFee,
          total: finalTotal,
        },
        paymentMethod: paymentIntent.payment_method?.type || "stripe",
        paymentStatus: "completed",
        paymentReference: paymentIntent.id,
        status: "confirmed",
        stripeData: {
          status: paymentIntent.status,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentMethodType: paymentIntent.payment_method?.type,
          paymentMethodDetails: paymentIntent.payment_method,
        },
        orderDate: new Date().toISOString(),
      };
      console.log("Saving to db...");
      await saveOrderToDatabase(orderData);
      clearCart();

      // Success message varies by payment method
      const paymentMethodType = paymentIntent.payment_method?.type;
      let successMessage = "Payment successful! Thank you for your purchase.";

      if (paymentMethodType === "sepa_debit") {
        successMessage =
          "SEPA payment initiated! We'll confirm once the transfer is complete.";
      } else if (paymentMethodType === "ideal") {
        successMessage =
          "iDEAL payment successful! Thank you for your purchase.";
      } else if (paymentMethodType === "paypal") {
        successMessage =
          "PayPal payment successful! Thank you for your purchase.";
      } else if (paymentMethodType === "klarna") {
        successMessage =
          "Klarna payment approved! Thank you for your purchase.";
      }

      addToast(successMessage, "success", 5000);

      // Navigate to success page
      router.push(`/order-success?reference=${paymentIntent.id}`);
    } catch (err) {
      console.error("Order saving error:", err);
      addToast(
        "Payment succeeded but order saving failed. Please contact support with reference: " +
          paymentIntent.id,
        "warning",
        10000
      );
      // Still redirect to success page with payment reference
      router.push(
        `/order-success?reference=${paymentIntent.id}&warning=order_save_failed`
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent multiple submissions
    if (isSubmittingRef.current || !stripe || !elements) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Submit the payment element to validate
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        addToast(submitError.message, "error");
        return;
      }

      setIsProcessing(true);

      // Confirm the payment with enhanced return URL
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?payment_intent_client_secret=${clientSecret}`,
          receipt_email: formData.email,
          payment_method_data: {
            billing_details: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address,
                city: formData.city,
                country: "IE", // You can make this dynamic based on customer location
              },
            },
          },
        },
        redirect: "if_required", // Only redirect for payment methods that require it
      });

      if (error) {
        console.error("Payment confirmation error:", error);

        // Handle different error types with more specific messages
        let errorMessage = error.message;

        if (error.type === "card_error") {
          errorMessage = `Card error: ${error.message}`;
        } else if (error.type === "validation_error") {
          errorMessage = `Please check your payment information: ${error.message}`;
        } else if (error.code === "payment_intent_authentication_failure") {
          errorMessage =
            "Payment authentication failed. Please try again or use a different payment method.";
        }

        setErrorMessage(errorMessage);
        addToast(errorMessage, "error");
        return;
      }

      // Handle successful payment
      if (paymentIntent) {
        if (paymentIntent.status === "succeeded") {
          await handleSuccessfulPayment(paymentIntent);
        } else if (paymentIntent.status === "processing") {
          // Handle asynchronous payment methods (SEPA, bank transfers, etc.)
          addToast(
            "Payment is being processed. We'll notify you once it's confirmed.",
            "info",
            8000
          );

          // Save order with processing status
          await handleSuccessfulPayment(paymentIntent);
        } else if (paymentIntent.status === "requires_action") {
          // 3D Secure or other actions required - this should trigger a redirect
          addToast(
            "Additional authentication required. Please complete the verification.",
            "info"
          );
        } else if (paymentIntent.status === "requires_source_action") {
          // Alternative payment methods that need additional steps
          addToast(
            "Please complete the payment verification in the new window.",
            "info"
          );
        } else {
          setErrorMessage(`Payment status: ${paymentIntent.status}`);
          addToast(
            `Payment ${paymentIntent.status}. Please try again.`,
            "warning"
          );
        }
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setErrorMessage(
        "An unexpected error occurred during payment processing."
      );
      addToast("Payment processing failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const paymentElementOptions = {
    layout: "tabs", // Shows different payment methods in tabs
    defaultValues: {
      billingDetails: {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        address: {
          line1: formData.address || "",
          city: formData.city || "",
          country: "IE", // Default to Ireland for EUR
        },
      },
    },
    paymentMethodOrder: [
      "card",
      "paypal",
      "sepa_debit",
      "ideal",
      "sofort",
      "bancontact",
      "klarna",
      "afterpay_clearpay",
    ],
    // Additional configuration for better UX
    fields: {
      billingDetails: {
        name: "auto",
        email: "auto",
        phone: "auto",
        address: {
          country: "never", // Don't show country field as we handle it
          line1: "auto",
          line2: "auto",
          city: "auto",
          state: "auto",
          postalCode: "auto",
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement
          options={paymentElementOptions}
          onReady={() => {
            setIsReady(true);
            console.log("Payment element ready with multiple payment methods");
          }}
          onChange={(event) => {
            if (event.error) {
              setErrorMessage(event.error.message);
            } else {
              setErrorMessage(null);
            }

            // Log the selected payment method for debugging
            if (event.value?.type) {
              console.log("Payment method selected:", event.value.type);
            }
          }}
          onLoaderStart={() => {
            console.log("Payment element loading...");
          }}
          onLoadError={(error) => {
            console.error("Payment element load error:", error);
            setErrorMessage(
              "Failed to load payment methods. Please refresh the page."
            );
          }}
        />

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {!isReady && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <span className="text-sm text-gray-600">
                Loading payment options...
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={
              !stripe || !elements || !isReady || isSubmitting || isProcessing
            }
            className="w-full h-14 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Payment...
              </>
            ) : isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Validating...
              </>
            ) : (
              <>
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Pay Now
              </>
            )}
          </button>

          {isReady && (
            <p className="text-xs text-gray-500 text-center">
              Select your preferred payment method above. All methods are secure
              and encrypted.
            </p>
          )}
        </div>
      </form>

      {/* Processing Overlay */}
      {(isProcessing || isSubmitting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isProcessing ? "Processing Payment" : "Validating Details"}
              </h3>
              <p className="text-gray-600 text-sm">
                {isProcessing
                  ? "Please wait while we process your payment. Do not close this page."
                  : "Checking your payment information..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
