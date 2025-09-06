// app/api/webhooks/stripe/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { saveOrderToDatabase } from "@/lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        await handlePaymentIntentFailed(failedPaymentIntent);
        break;

      case "payment_intent.requires_action":
        const actionRequiredPaymentIntent = event.data.object;
        await handlePaymentIntentRequiresAction(actionRequiredPaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  // You can update order status in database here
  // This is useful for cases where the client-side completion might have failed
  try {
    // Example: Update order status to 'paid' if it exists
    // await updateOrderStatus(paymentIntent.id, 'paid');
    console.log("Payment confirmed via webhook");
  } catch (error) {
    console.error("Error updating order after payment success:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);

  try {
    // Example: Update order status to 'failed' if it exists
    // await updateOrderStatus(paymentIntent.id, 'payment_failed');
    console.log("Payment failure recorded via webhook");
  } catch (error) {
    console.error("Error updating order after payment failure:", error);
  }
}

async function handlePaymentIntentRequiresAction(paymentIntent) {
  console.log(`Payment requires action: ${paymentIntent.id}`);

  try {
    // Example: Update order status to 'requires_action' if it exists
    // await updateOrderStatus(paymentIntent.id, 'requires_action');
    console.log("Payment action requirement recorded via webhook");
  } catch (error) {
    console.error("Error updating order after payment requires action:", error);
  }
}

// Helper function to update order status (implement based on your database structure)
async function updateOrderStatus(paymentIntentId, status) {
  // Implement this function based on your database structure
  // Example:
  // const order = await findOrderByPaymentReference(paymentIntentId);
  // if (order) {
  //   await updateOrder(order.id, { paymentStatus: status });
  // }
}
