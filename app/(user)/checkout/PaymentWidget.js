// app/(user)/checkout/PaymentWidget.js
"use client";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore";
import { saveOrderToDatabase } from "@/lib/database";

export default function PaymentWidget({ checkoutId, formData }) {
  const containerRef = useRef(null);
  const [widgetId, setWidgetId] = useState(null);
  const { cart, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const { user } = useUserStore();

  const verifyPayment = async (checkoutId) => {
    const res = await fetch(`/api/payment/verify/${checkoutId}`);
    if (!res.ok) throw new Error("Payment verification failed");
    return res.json();
  };

  useEffect(() => {
    if (!checkoutId || !window.SumUpCard) return;

    // Generate a unique widget ID
    const newWidgetId = `sumup-widget-${Date.now()}`;
    setWidgetId(newWidgetId);

    // Create container div if it doesn't exist
    if (
      containerRef.current &&
      !containerRef.current.querySelector(`#${newWidgetId}`)
    ) {
      const containerDiv = document.createElement("div");
      containerDiv.id = newWidgetId;
      containerRef.current.appendChild(containerDiv);
    }

    // Mount widget
    window.SumUpCard.mount({
      id: newWidgetId,
      checkoutId,
      onResponse: async (type, body) => {
        console.log("SumUp response:", type, body);
        try {
          if (type === "success") {
            const verification = await verifyPayment(checkoutId);
            if (verification.success) {
              const orderForDatabase = {
                id: `order_${Date.now()}_${Math.random()
                  .toString(36)
                  .slice(2, 9)}`,
                customerInfo: formData,
                customer_id: user?.id,
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
                  subtotal: cart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  ),
                  tax: 0, // You'll need to calculate this
                  shipping: 0, // You'll need to calculate this
                  total: cart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  ),
                },
                paymentMethod: "sumup",
                paymentStatus: "completed",
                paymentReference: checkoutId,
                status: "confirmed",
                sumupData: {
                  status: verification.status,
                  transactionId: verification.transactionId,
                },
                orderDate: new Date().toISOString(),
              };

              await saveOrderToDatabase(orderForDatabase);
              clearCart();

              addToast(
                "Payment successful! Thank you for your purchase.",
                "success",
                5000
              );

              router.push(
                `/order-success?reference=${checkoutId}&txn=${
                  verification.transactionId || ""
                }`
              );
            } else {
              throw new Error(
                "Payment verification failed. Please contact support."
              );
            }
          } else if (type === "cancel") {
            addToast("Payment cancelled", "warning");
          } else {
            const msg =
              body?.error_message ||
              body?.message ||
              "Payment was not successful. Please try again.";
            throw new Error(msg);
          }
        } catch (err) {
          console.error("Card widget response handling error:", err);
          addToast(
            err.message || "Payment processing failed. Please try again.",
            "error"
          );
        }
      },
    });

    return () => {
      // Cleanup
      if (window.SumUpCard?.unmount && widgetId) {
        window.SumUpCard.unmount(widgetId);
      }
      if (containerRef.current && widgetId) {
        const element = document.getElementById(widgetId);
        if (element) {
          containerRef.current.removeChild(element);
        }
      }
    };
  }, [checkoutId]);

  return (
    <div
      ref={containerRef}
      className="sumup-container"
      style={{ minHeight: "300px" }}
    />
  );
}
