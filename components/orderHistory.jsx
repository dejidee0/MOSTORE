import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderItems, setOrderItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});

  // Fetch user's orders
  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);

      let query = supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId] || loadingItems[orderId]) return;

    try {
      setLoadingItems((prev) => ({ ...prev, [orderId]: true }));

      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products (
            name,
            images,
            sku
          )
        `,
        )
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching order items:", error);
        return;
      }

      setOrderItems((prev) => ({
        ...prev,
        [orderId]: data || [],
      }));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  fetchOrders();

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle order expansion and fetch items if needed
  const toggleOrderExpansion = async (orderId) => {
    const newExpanded = new Set(expandedOrders);

    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      await fetchOrderItems(orderId);
    }

    setExpandedOrders(newExpanded);
  };

  // Status badge component
  const StatusBadge = ({ status, paymentStatus }) => {
    const getStatusConfig = (status, paymentStatus) => {
      if (paymentStatus === "failed") {
        return {
          color: "bg-red-100 text-red-800",
          icon: XCircle,
          text: "Payment Failed",
        };
      }

      switch (status) {
        case "pending":
          return {
            color: "bg-yellow-100 text-yellow-800",
            icon: Clock,
            text: "Pending",
          };
        case "confirmed":
          return {
            color: "bg-blue-100 text-blue-800",
            icon: CheckCircle,
            text: "Confirmed",
          };
        case "processing":
          return {
            color: "bg-purple-100 text-purple-800",
            icon: Package,
            text: "Processing",
          };
        case "shipped":
          return {
            color: "bg-orange-100 text-orange-800",
            icon: Truck,
            text: "Shipped",
          };
        case "delivered":
          return {
            color: "bg-green-100 text-green-800",
            icon: CheckCircle,
            text: "Delivered",
          };
        case "cancelled":
          return {
            color: "bg-red-100 text-red-800",
            icon: XCircle,
            text: "Cancelled",
          };
        default:
          return {
            color: "bg-gray-100 text-gray-800",
            icon: AlertCircle,
            text: status,
          };
      }
    };

    const config = getStatusConfig(status, paymentStatus);
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  // Order item component
  const OrderItem = ({ item }) => {
    const product = item.products;
    const productImage = product?.images?.[0] || "/api/placeholder/80/80";

    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <img
          src={productImage}
          alt={product?.name || "Product"}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {product?.name || "Product"}
          </h4>
          <p className="text-sm text-gray-500">SKU: {product?.sku}</p>
          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">
            €{item.price?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Total: €{(item.quantity * item.price)?.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            Order History
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Track and manage your orders
          </p>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}{" "}
          found
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "You haven't placed any orders yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id || order.order_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <StatusBadge
                        status={order.status}
                        paymentStatus={order.payment_status}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />€
                        {order.total?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.payment_method}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleOrderExpansion(order.id || order.order_number)
                    }
                    className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                    {expandedOrders.has(order.id || order.order_number) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrders.has(order.id || order.order_number) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* Customer & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Customer Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{order.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{order.customer_phone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span>
                              {order.customer_address}, {order.customer_city}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Order Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>€{order.subtotal?.toLocaleString()}</span>
                          </div>
                          {order.tax > 0 && (
                            <div className="flex justify-between">
                              <span>Tax:</span>
                              <span>€{order.tax?.toLocaleString()}</span>
                            </div>
                          )}
                          {order.shipping > 0 && (
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>€{order.shipping?.toLocaleString()}</span>
                            </div>
                          )}
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-€{order.discount?.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-base border-t pt-2">
                            <span>Total:</span>
                            <span>€{order.total?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Order Items
                      </h4>
                      {loadingItems[order.id || order.order_number] ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                        </div>
                      ) : orderItems[order.id || order.order_number] ? (
                        <div className="space-y-3">
                          {orderItems[order.id || order.order_number].map(
                            (item) => (
                              <OrderItem key={item.id} item={item} />
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 py-4">
                          Failed to load order items
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
