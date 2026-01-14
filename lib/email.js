import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@yourdomain.com",
      to: [orderData.customerEmail || orderData.customerInfo.email],
      subject: `Order Confirmation - ${orderData.id}`,
      html: generateOrderConfirmationHTML(orderData),
    });

    if (error) {
      console.error("Resend email error:", error);
      throw error;
    }

    console.log("Order confirmation email sent successfully:", data.id);
    return data;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    throw error;
  }
};

export const sendPaymentConfirmationEmail = async (data) => {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@yourdomain.com",
      to: [data.customerEmail],
      subject: `Payment Confirmed - ${data.reference}`,
      html: generatePaymentConfirmationHTML(data),
    });

    if (error) {
      console.error("Resend payment confirmation error:", error);
      throw error;
    }

    console.log("Payment confirmation email sent successfully:", emailData.id);
    return emailData;
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    throw error;
  }
};

export const sendPaymentFailureEmail = async (data) => {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@yourdomain.com",
      to: [data.customerEmail],
      subject: `Payment Failed - ${data.reference}`,
      html: generatePaymentFailureHTML(data),
    });

    if (error) {
      console.error("Resend payment failure error:", error);
      throw error;
    }

    console.log("Payment failure email sent successfully:", emailData.id);
    return emailData;
  } catch (error) {
    console.error("Failed to send payment failure email:", error);
    throw error;
  }
};

export const notifyAdminAboutDispute = async (data) => {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@yourdomain.com",
      to: [process.env.ADMIN_EMAIL || "admin@yourdomain.com"],
      subject: `Payment Dispute Alert - ${data.reference}`,
      html: generateDisputeNotificationHTML(data),
    });

    if (error) {
      console.error("Resend dispute notification error:", error);
      throw error;
    }

    console.log("Dispute notification sent successfully:", emailData.id);
    return emailData;
  } catch (error) {
    console.error("Failed to send dispute notification:", error);
    throw error;
  }
};

export const sendRefundConfirmationEmail = async (data) => {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@yourdomain.com",
      to: [data.customerEmail],
      subject: `Refund Processed - ${data.reference}`,
      html: generateRefundConfirmationHTML(data),
    });

    if (error) {
      console.error("Resend refund confirmation error:", error);
      throw error;
      return;
    }

    console.log("Refund confirmation email sent successfully:", emailData.id);
    return emailData;
  } catch (error) {
    console.error("Failed to send refund confirmation email:", error);
    throw error;
  }
};
