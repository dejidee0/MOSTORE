// app/api/payment/verify/[id]/route.js
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  const { id } = params || {};
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing checkout id." },
      { status: 400 }
    );
  }

  try {
    const sumupApiKey = process.env.SUMUP_SECRET_KEY;
    if (!sumupApiKey) {
      return NextResponse.json(
        { success: false, message: "SumUp server credentials are missing." },
        { status: 500 }
      );
    }

    const res = await fetch(`https://api.sumup.com/v0.1/checkouts/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sumupApiKey}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, message: `SumUp verify failed: ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    // SumUp returns various fields; consider both "status" and "payment_status"
    const status = data?.status || data?.payment_status || "";
    const paid =
      String(status).toUpperCase() === "PAID" ||
      String(status).toUpperCase() === "SUCCESSFUL";

    return NextResponse.json(
      {
        success: paid,
        status: status || "UNKNOWN",
        transactionId: data?.transaction_id || data?.transaction_code || null,
        amount: data?.amount,
        currency: data?.currency,
        raw: data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
