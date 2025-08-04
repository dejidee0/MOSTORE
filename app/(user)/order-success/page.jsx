// app/order-success/page.js - Order Success Page
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Calendar,
  ArrowRight,
  Home,
} from "lucide-react";

export default function OrderSuccessPage() {
  const [mounted, setMounted] = useState(false);
  const [orderNumber] = useState(
    () =>
      `ORD-${Date.now().toString().slice(-6)}-${Math.random()
        .toString(36)
        .substr(2, 4)
        .toUpperCase()}`
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Success Animation */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <CheckCircle
              className="w-24 h-24 text-green-500 animate-bounce"
              style={{ animationDuration: "2s", animationIterationCount: "3" }}
            />
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-gray-500">
            Your order has been successfully placed and is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Order #{orderNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  Placed on{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle size={16} className="mr-1" />
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Confirmation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Email Confirmation
                </h3>
                <p className="text-gray-600 text-sm">Check your inbox</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              We've sent a confirmation email with your order details confirming
              your payment.
            </p>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delivery Info</h3>
                <p className="text-gray-600 text-sm">Expected timeline</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Admin will reach out to you via Whatsappp/Call for delivery
              process
            </p>
          </div>
        </div>

        {/* Customer Support */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="text-orange-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about your order or need assistance,
                our customer support team is here to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Contact Support
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 border border-orange-300 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Quick View */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-medium text-gray-900">{orderNumber}</span>
            </div>

            <div className="flex justify-between">
              <span>Order Date:</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span className="font-medium text-gray-900">
                {new Date(
                  Date.now() + 5 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-colors font-medium"
            >
              <Home size={20} />
              Continue Shopping
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              <Calendar size={20} />
              View Order History
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            You can track your order status and view details in your account.
          </p>
        </div>
      </main>
    </div>
  );
}
