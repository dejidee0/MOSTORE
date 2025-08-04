// app/api/webhooks/paystack/route.js - Webhook handler for Paystack events
import { NextResponse } from "next/server";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request) {
  try {
    // Get the raw body
    const body = await request.text();

    // Get Paystack signature from headers
    const paystackSignature = request.headers.get("x-paystack-signature");

    if (!paystackSignature) {
      console.error("No Paystack signature found");
      return NextResponse.json(
        { success: false, message: "No signature found" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (paystackSignature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(body);

    console.log("Received Paystack webhook event:", event.event);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data);
        break;

      case "charge.failed":
        await handleFailedPayment(event.data);
        break;

      case "charge.dispute.create":
        await handleDispute(event.data);
        break;

      case "refund.processed":
        await handleRefund(event.data);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data) {
  try {
    console.log("Processing successful payment:", data.reference);

    // Extract order data from metadata
    const orderData = data.metadata?.order_data;

    if (!orderData) {
      console.error("No order data found in payment metadata");
      return;
    }

    // Update order status in database
    await updateOrderStatus(data.reference, "completed", {
      transaction_id: data.id,
      gateway_response: data.gateway_response,
      paid_at: data.paid_at,
      channel: data.channel,
      amount: data.amount / 100, // Convert from kobo
      currency: data.currency,
    });

    // Process inventory updates
    await updateInventory(orderData.items);

    // Send confirmation email
    await sendPaymentConfirmationEmail({
      customerEmail: data.customer.email,
      customerName: orderData.customerInfo.name,
      reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      orderData,
    });

    console.log("Payment processed successfully:", data.reference);
  } catch (error) {
    console.error("Error processing successful payment:", error);
  }
}

async function handleFailedPayment(data) {
  try {
    console.log("Processing failed payment:", data.reference);

    // Update order status in database
    await updateOrderStatus(data.reference, "failed", {
      failure_reason: data.gateway_response,
      failed_at: new Date().toISOString(),
    });

    // Send failure notification email
    await sendPaymentFailureEmail({
      customerEmail: data.customer.email,
      reference: data.reference,
      reason: data.gateway_response,
    });

    console.log("Failed payment processed:", data.reference);
  } catch (error) {
    console.error("Error processing failed payment:", error);
  }
}

async function handleDispute(data) {
  try {
    console.log("Processing dispute:", data.reference);

    // Update order status in database
    await updateOrderStatus(data.reference, "disputed", {
      dispute_id: data.id,
      dispute_reason: data.reason,
      disputed_at: data.created_at,
    });

    // Notify admin about dispute
    await notifyAdminAboutDispute({
      reference: data.reference,
      reason: data.reason,
      amount: data.amount / 100,
    });

    console.log("Dispute processed:", data.reference);
  } catch (error) {
    console.error("Error processing dispute:", error);
  }
}

async function handleRefund(data) {
  try {
    console.log("Processing refund:", data.transaction_reference);

    // Update order status in database
    await updateOrderStatus(data.transaction_reference, "refunded", {
      refund_id: data.id,
      refunded_amount: data.amount / 100,
      refunded_at: data.created_at,
    });

    // Send refund confirmation email
    await sendRefundConfirmationEmail({
      customerEmail: data.customer.email,
      reference: data.transaction_reference,
      amount: data.amount / 100,
    });

    console.log("Refund processed:", data.transaction_reference);
  } catch (error) {
    console.error("Error processing refund:", error);
  }
}

// Helper functions

async function updateOrderStatus(reference, status, additionalData = {}) {
  try {
    // Update order in your database
    /* Example with your database:
    const order = await findOrderByReference(reference);
    if (order) {
      await updateOrder(order.id, {
        paymentStatus: status,
        ...additionalData,
        updatedAt: new Date().toISOString(),
      });
    }
    */

    console.log(
      `Order ${reference} status updated to: ${status}`,
      additionalData
    );
  } catch (error) {
    console.error("Error updating order status:", error);
  }
}

async function updateInventory(items) {
  try {
    for (const item of items) {
      // Update product inventory in your database
      /* Example:
      await updateProductInventory(item.id, -item.quantity);
      */
      console.log(`Inventory updated for ${item.id}: -${item.quantity}`);
    }
  } catch (error) {
    console.error("Error updating inventory:", error);
  }
}

async function sendPaymentConfirmationEmail(data) {
  try {
    // Send confirmation email using your email service
    /* Example with SendGrid:
    const msg = {
      to: data.customerEmail,
      from: process.env.FROM_EMAIL,
      subject: `Payment Confirmed - ${data.reference}`,
      html: generatePaymentConfirmationHTML(data),
    };
    await sgMail.send(msg);
    */

    console.log("Payment confirmation email sent to:", data.customerEmail);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

async function sendPaymentFailureEmail(data) {
  try {
    console.log("Payment failure email sent to:", data.customerEmail);
  } catch (error) {
    console.error("Error sending failure email:", error);
  }
}

async function notifyAdminAboutDispute(data) {
  try {
    console.log("Admin notified about dispute:", data.reference);
  } catch (error) {
    console.error("Error notifying admin about dispute:", error);
  }
}

async function sendRefundConfirmationEmail(data) {
  try {
    console.log("Refund confirmation email sent to:", data.customerEmail);
  } catch (error) {
    console.error("Error sending refund email:", error);
  }
}
