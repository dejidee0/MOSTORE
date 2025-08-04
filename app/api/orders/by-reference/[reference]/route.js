// app/api/orders/by-reference/[reference]/route.js - Get order by payment reference
import { NextResponse } from "next/server";
import { findOrderByReference } from "@/lib/database";

export async function GET(request, { params }) {
  try {
    const { reference } = params;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Payment reference is required" },
        { status: 400 }
      );
    }

    const order = await findOrderByReference(reference);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order by reference:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
