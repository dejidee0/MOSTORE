// app/api/payment/initialize/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, currency = "EUR", description } = body;

    if (!amount || !currency) {
      return NextResponse.json(
        { success: false, message: "Amount and currency are required" },
        { status: 400 }
      );
    }

    // Step 1: Get OAuth token
    const tokenRes = await fetch("https://api.sumup.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SUMUP_CLIENT_ID,
        client_secret: process.env.SUMUP_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(`Failed to get token: ${JSON.stringify(tokenData)}`);
    }

    // Step 2: Create checkout
    const checkoutReference = `chk_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const sumupRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: checkoutReference,
        amount: Number(amount).toFixed(2),
        currency,
        description:
          description || `Order ${checkoutReference} via Online Store`,
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-success?ref=${checkoutReference}`,
      }),
    });

    const checkoutData = await sumupRes.json();
    if (!sumupRes.ok) {
      throw new Error(
        `Checkout creation failed: ${JSON.stringify(checkoutData)}`
      );
    }

    return NextResponse.json({ success: true, checkout: checkoutData });
  } catch (err) {
    console.error("Initialize payment error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
