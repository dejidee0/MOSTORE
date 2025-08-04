import { NextResponse } from "next/server";
import { saveOrderToDatabase, reserveInventory } from "@/lib/database";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const orderData = await request.json();

    // Validate order data
    if (
      !orderData.customerInfo ||
      !orderData.items ||
      !orderData.items.length
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `ORD_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Prepare order for Supabase
    const order = {
      id: orderId,
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save order to Supabase
    const savedOrder = await saveOrderToDatabase(order);

    // Send order confirmation email using Resend
    await sendOrderConfirmationEmail(savedOrder);

    // Reserve inventory for cash on delivery
    await reserveInventory(orderData.items);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: savedOrder.id,
      data: savedOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
