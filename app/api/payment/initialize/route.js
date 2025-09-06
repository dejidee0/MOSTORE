// app/api/payment/initialize/route.js
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,
      currency = "EUR",
      orderData,
      customerEmail,
      description,
      automatic_payment_methods,
      payment_method_types,
    } = body;

    // Validate required fields
    if (!amount || !customerEmail || !orderData) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: amount, customerEmail, or orderData",
        },
        { status: 400 }
      );
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Determine customer location for payment method filtering
    const customerCountry = orderData.customerInfo?.country || "IE"; // Default to Ireland

    // Configure payment methods based on currency and region
    let enabledPaymentMethods = [];
    let automaticPaymentMethods = automatic_payment_methods || {
      enabled: true,
    };

    if (currency === "EUR") {
      enabledPaymentMethods = [
        "card",
        "sepa_debit",
        "ideal",
        "sofort",
        "bancontact",
        "eps",
        "giropay",
        "p24",
        "blik",
        "paypal", // if you've enabled PayPal in Stripe
        "klarna", // if you've enabled Klarna
        "afterpay_clearpay", // if you've enabled Afterpay
        "alipay",
        "wechat_pay",
      ];
    } else if (currency === "USD") {
      enabledPaymentMethods = [
        "card",
        "us_bank_account",
        "link",
        "paypal",
        "klarna",
        "afterpay_clearpay",
        "affirm",
        "cashapp",
        "alipay",
        "wechat_pay",
      ];
    } else if (currency === "GBP") {
      enabledPaymentMethods = [
        "card",
        "bacs_debit",
        "paypal",
        "klarna",
        "afterpay_clearpay",
        "alipay",
        "wechat_pay",
      ];
    }

    // Use provided payment methods or fall back to our defaults
    const finalPaymentMethods = payment_method_types || enabledPaymentMethods;

    // Create PaymentIntent with multiple payment methods
    const paymentIntentParams = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderData.id || `order_${Date.now()}`,
        customerName: orderData.customerInfo?.name || "",
        customerEmail: customerEmail,
        itemCount: orderData.items?.length || 0,
      },
      receipt_email: customerEmail,
      description: description || `Payment for order`,
      shipping: {
        name: orderData.customerInfo?.name || "",
        address: {
          line1: orderData.customerInfo?.address || "",
          city: orderData.customerInfo?.city || "",
          country: customerCountry,
          postal_code: orderData.customerInfo?.postalCode || "",
        },
      },
    };

    // Add payment methods configuration
    if (automaticPaymentMethods.enabled) {
      paymentIntentParams.automatic_payment_methods = {
        enabled: true,
        allow_redirects: "always", // Allow redirect-based payment methods
      };
    } else {
      paymentIntentParams.payment_method_types = finalPaymentMethods;
    }

    // Create the PaymentIntent
    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentParams);

    // Log successful creation
    console.log(
      `PaymentIntent created: ${paymentIntent.id} for ${customerEmail}`
    );

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      availablePaymentMethods: finalPaymentMethods,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeCardError") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          type: "card_error",
        },
        { status: 400 }
      );
    }

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment configuration. Please contact support.",
          type: "invalid_request",
        },
        { status: 400 }
      );
    }

    if (error.type === "StripeAPIError") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment service temporarily unavailable. Please try again.",
          type: "api_error",
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        message: "Payment initialization failed. Please try again.",
        type: "unknown_error",
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: "Payment initialization endpoint. Use POST method.",
    supportedMethods: ["POST"],
  });
}
