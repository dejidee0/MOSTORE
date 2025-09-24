import React from "react";
import { motion } from "framer-motion";
import { LogOut, User, ShoppingBag, Heart } from "lucide-react";

const WelcomePage = ({ fullName, recentOrders, handleLogout }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header with Welcome Message */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <motion.h1
          className="text-4xl font-bold text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome, {fullName || "Guest"}!
        </motion.h1>
      </div>

      {/* Membership Overview and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
        <motion.div
          className="bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Recent Orders
          </h2>
          {recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {recentOrders.map((order, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Order #{order.id} - {order.date} - ${order.total}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No recent orders found.</p>
          )}
        </motion.div>
      </div>

      {/* Logout Button at Bottom */}
      <motion.div
        className="mt-6 pt-6 border-t border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={18} />
          Logout
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomePage;
