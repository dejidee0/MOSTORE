"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Package, Calendar } from "lucide-react";
import useUserStore from "@/lib/stores/useUserStore";
import { supabase } from "@/lib/supabase-client";

const WelcomePage = () => {
  const { user, signOut } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fullName = user?.user_metadata?.full_name || "Guest";
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("vendor_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-white p-4 md:p-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <motion.h1
                className="text-3xl md:text-4xl font-light text-gray-900 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Welcome back,
              </motion.h1>
              <p className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                {fullName}
              </p>
            </div>

            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Info */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                Account Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-orange-100">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.email || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-orange-100">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {joinDate}
                </span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm font-medium text-gray-900">
                  Free Tier
                </span>
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200">
              Upgrade Plan
            </button>
          </motion.div>
          <motion.div
            className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Membership Overview
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-900 font-bold">Plan:</span>
                <span className="text-gray-500 font-medium">Free Tier</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-900 font-bold">Join Date:</span>
                <span className="text-gray-500 font-medium">
                  September 23, 2025
                </span>
              </div>
              <a
                href="#"
                className="inline-block text-sm text-orange-500 hover:text-orange-600 font-medium underline underline-offset-4 transition-colors"
              >
                Upgrade Plan
              </a>
            </div>
          </motion.div>
          {/* Recent Orders */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Package size={20} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                Recent Orders
              </h2>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : error ? (
                <p className="text-sm text-red-500 py-4">
                  Error loading orders: {error}
                </p>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Package size={32} className="mx-auto text-orange-200 mb-3" />
                  <p className="text-sm text-gray-500 mb-3">No orders yet</p>
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors">
                    Start Shopping →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
