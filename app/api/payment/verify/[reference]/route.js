// app/api/payment/verify/[reference]/route.js - Updated with Supabase & Resend
import { NextResponse } from "next/server";
import { saveOrderToDatabase, updateOrderStatus } from "@/lib/database";
import { sendPaymentConfirmationEmail, updateInventory } from "@/lib/email";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export async function GET(request, { params }) {
  try {
    const { reference } = params;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await response.json();

    if (!response.ok || !paystackData.status) {
      console.error("Paystack verification failed:", paystackData);
      return NextResponse.json(
        {
          success: false,
          message: paystackData.message || "Payment verification failed",
        },
        { status: 400 }
      );
    }

    const transaction = paystackData.data;

    // Check if payment was successful
    if (transaction.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment was not successful",
          status: transaction.status,
        },
        { status: 400 }
      );
    }

    // Process the successful payment
    try {
      // Extract order data from metadata
      const orderData = transaction.metadata?.order_data;

      if (orderData) {
        // Save order to Supabase
        const order = await saveOrderToDatabase({
          ...orderData,
          paymentReference: reference,
          paymentStatus: "completed",
          paymentMethod: "paystack",
          paystackData: {
            transaction_id: transaction.id,
            gateway_response: transaction.gateway_response,
            paid_at: transaction.paid_at,
            channel: transaction.channel,
          },
        });

        // Send confirmation email using Resend
        await sendPaymentConfirmationEmail({
          customerEmail: transaction.customer.email,
          customerName: orderData.customerInfo.name,
          reference: transaction.reference,
          amount: transaction.amount / 100,
          currency: transaction.currency,
          orderData,
        });

        // Update inventory
        await updateInventory(orderData.items);
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          reference: transaction.reference,
          amount: transaction.amount / 100,
          currency: transaction.currency,
          paid_at: transaction.paid_at,
          channel: transaction.channel,
          customer: {
            email: transaction.customer.email,
          },
        },
      });
    } catch (processingError) {
      console.error("Order processing error:", processingError);
      return NextResponse.json({
        success: true,
        message: "Payment successful but order processing incomplete",
        warning: "Please contact support with your payment reference",
        data: {
          reference: transaction.reference,
          amount: transaction.amount / 100,
        },
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
