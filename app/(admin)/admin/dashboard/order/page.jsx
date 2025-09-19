"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaPhone, FaEnvelope, FaUser } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";

import { supabase } from "@/lib/supabase-client";

const statusColors = {
  pending: "bg-yellow-400 text-black",
  confirmed: "bg-blue-500 text-white",
  processing: "bg-orange-500 text-white",
  shipped: "bg-purple-500 text-white",
  delivered: "bg-green-700 text-white",
  cancelled: "bg-red-500 text-white",
};

const paymentStatusColors = {
  pending: "bg-yellow-400 text-black",
  completed: "bg-green-700 text-white",
  failed: "bg-red-500 text-white",
  refunded: "bg-gray-500 text-white",
};

const Page = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      setLoading(true);

      let query = supabase.from("orders").select("*");

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.payment_status) {
        query = query.eq("payment_status", filters.payment_status);
      }

      // Apply sorting
      query = query.order(filters.sortBy, {
        ascending: filters.sortOrder === "asc",
      });

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setOrders(data || []);

      // Set first order as selected if none selected
      if (data && data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "€",
    }).format(amount);
  };

  // Get customer initials
  const getCustomerInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: status === filters.status ? "" : status,
    }));
  };

  // Handle payment status filter change
  const handlePaymentStatusFilter = (paymentStatus) => {
    setFilters((prev) => ({
      ...prev,
      payment_status:
        paymentStatus === filters.payment_status ? "" : paymentStatus,
    }));
  };

  // Handle sort change
  const handleSortChange = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white p-4 md:p-6 md:pt-10 flex flex-col lg:flex-col gap-6">
      <h1 className="text-3xl font-bold text-orange-500">Orders</h1>{" "}
      {/* Orders Table (Desktop) */}
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors appearance-none pr-8"
              >
                <option value="">Any Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filters.payment_status}
                onChange={(e) => handlePaymentStatusFilter(e.target.value)}
                className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors appearance-none pr-8"
              >
                <option value="">Any Payment Status</option>
                <option value="pending">Payment Pending</option>
                <option value="completed">Payment Completed</option>
                <option value="failed">Payment Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSortChange}
            className="flex items-center gap-1 px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Sort by Date {filters.sortOrder === "desc" ? "↓" : "↑"}
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-hidden rounded-xl border shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="py-3 pl-6 w-8">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="py-3 font-medium">Order</th>
                <th className="py-3 font-medium">Customer</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Payment</th>
                <th className="py-3 font-medium">Total</th>
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, idx) => (
                <tr
                  key={order.order_number}
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedOrder?.order_number === order.order_number
                      ? "bg-gray-50"
                      : ""
                  }`}
                >
                  <td className="py-3 pl-6">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">
                        {getCustomerInitials(order.customer_name)}
                      </div>
                      <div>
                        <span className="text-sm font-medium block">
                          {order.customer_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.customer_email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status] || "bg-gray-500 text-white"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paymentStatusColors[order.payment_status] ||
                        "bg-gray-500 text-white"
                      }`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-3 pr-6 text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 8H12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 12V4"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="space-y-3 lg:hidden">
          {orders.map((order) => (
            <div
              key={order.order_number}
              onClick={() => setSelectedOrder(order)}
              className={`p-4 rounded-xl border ${
                selectedOrder?.order_number === order.order_number
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              } shadow-xs cursor-pointer transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center font-medium">
                    {getCustomerInitials(order.customer_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer_name}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[order.status] || "bg-gray-500 text-white"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <div>
                  <span className="text-gray-500">Total: </span>
                  <span className="font-medium">
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <div className="text-gray-500">
                  {formatDate(order.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Order Summary */}
      {selectedOrder && (
        <motion.div
          key={selectedOrder?.order_number}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full lg:w-96 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-h-max"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">
                  Order {selectedOrder.order_number}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedOrder.created_at)},{" "}
                  {new Date(selectedOrder.created_at).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[selectedOrder.status] ||
                    "bg-gray-500 text-white"
                  }`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paymentStatusColors[selectedOrder.payment_status] ||
                    "bg-gray-500 text-white"
                  }`}
                >
                  {selectedOrder.payment_status.charAt(0).toUpperCase() +
                    selectedOrder.payment_status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 p-6 mb-6 bg-gray-50 rounded-lg">
              <div className="h-20 w-20 rounded-full border-2 border-primary/20 bg-gray-200 text-gray-600 text-2xl flex items-center justify-center font-medium">
                {getCustomerInitials(selectedOrder.customer_name)}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedOrder.customer_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.customer_email}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.customer_phone}
                </p>
                {selectedOrder.customer_company && (
                  <p className="text-sm text-gray-500">
                    {selectedOrder.customer_company}
                  </p>
                )}
                <div className="flex justify-center gap-4 text-gray-500 mt-4">
                  <a
                    href={`tel:${selectedOrder.customer_phone}`}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <FaPhone className="text-lg" />
                  </a>
                  <a
                    href={`mailto:${selectedOrder.customer_email}`}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <FaEnvelope className="text-lg" />
                  </a>
                  <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <FaUser className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-medium">Order Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                {selectedOrder.shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{formatCurrency(selectedOrder.shipping)}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">
                      -{formatCurrency(selectedOrder.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize">
                    {selectedOrder.payment_method}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-medium">Shipping Address</h4>
              <div className="text-sm text-gray-600">
                <p>{selectedOrder.customer_address}</p>
                <p>{selectedOrder.customer_city}</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold">
                {formatCurrency(selectedOrder.total)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Page;
