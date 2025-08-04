// app/api/payment/initialize/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export async function POST(request) {
  try {
    const { email, amount, currency, orderData } = await request.json();

    // Validate required fields
    if (!email || !amount || !currency) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `order_${Date.now()}_${crypto
      .randomBytes(8)
      .toString("hex")}`;

    // Prepare Paystack payload
    const paystackPayload = {
      email,
      amount: Math.round(amount), // Ensure it's an integer (kobo)
      currency,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      metadata: {
        order_data: orderData,
        customer_name: orderData.customerInfo.name,
        customer_phone: orderData.customerInfo.phone,
      },
    };

    // Initialize payment with Paystack
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackPayload),
      }
    );

    const paystackData = await response.json();

    if (!response.ok || !paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      return NextResponse.json(
        {
          success: false,
          message: paystackData.message || "Payment initialization failed",
        },
        { status: 400 }
      );
    }

    // Store order data temporarily (you might want to use a database)
    // For now, we'll rely on the metadata in Paystack

    return NextResponse.json({
      success: true,
      data: paystackData.data,
      reference,
      authorization_url: paystackData.data.authorization_url,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions (implement these based on your database and email service)

async function saveOrderToDatabase(orderData) {
  // Example using your preferred database (MongoDB, PostgreSQL, etc.)

  /* Example with MongoDB/Mongoose:
  const Order = require('../../../models/Order');
  const order = new Order(orderData);
  return await order.save();
  */

  /* Example with PostgreSQL/Prisma:
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  return await prisma.order.create({
    data: {
      id: orderData.id,
      customerName: orderData.customerInfo.name,
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      customerAddress: orderData.customerInfo.address,
      customerCity: orderData.customerInfo.city,
      customerCompany: orderData.customerInfo.company,
      items: JSON.stringify(orderData.items),
      subtotal: orderData.pricing.subtotal,
      tax: orderData.pricing.tax,
      shipping: orderData.pricing.shipping,
      discount: orderData.pricing.discount,
      total: orderData.pricing.total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      paymentReference: orderData.paymentReference,
      status: orderData.status,
      createdAt: new Date(orderData.createdAt),
      paystackData: orderData.paystackData ? JSON.stringify(orderData.paystackData) : null,
    },
  });
  */

  // For demo purposes, just return the order data
  console.log("Saving order to database:", orderData);
  return orderData;
}

async function sendOrderConfirmationEmail(order) {
  // Example using your preferred email service (SendGrid, Nodemailer, etc.)

  /* Example with SendGrid:
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: order.customerInfo.email,
    from: process.env.FROM_EMAIL,
    subject: `Order Confirmation - ${order.id}`,
    html: generateOrderEmailHTML(order),
  };
  
  try {
    await sgMail.send(msg);
    console.log('Order confirmation email sent');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
  */

  // For demo purposes, just log
  console.log(
    "Sending confirmation email to:",
    order.customerInfo?.email || order.customerEmail
  );
}

async function updateInventory(items) {
  // Update product inventory after successful payment
  for (const item of items) {
    // Decrease product quantity in database
    console.log(`Updating inventory for product ${item.id}: -${item.quantity}`);
  }
}

async function reserveInventory(items) {
  // Reserve inventory for cash on delivery orders
  for (const item of items) {
    // Mark quantity as reserved in database
    console.log(`Reserving inventory for product ${item.id}: ${item.quantity}`);
  }
}

function generateOrderEmailHTML(order) {
  // Generate HTML email template
  return `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order, ${
      order.customerInfo?.name || order.customerName
    }!</p>
    <p>Order ID: ${order.id}</p>
    <p>Total: ${order.pricing?.total || order.total}</p>
    <!-- Add more order details -->
  `;
}
