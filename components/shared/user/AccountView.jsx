import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, ShoppingBag, Heart } from "lucide-react";

const AccountView = ({ profile, setIsEditing, setIsDeleteModalOpen }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header with Title */}
      <motion.h1
        className="text-3xl font-bold text-gray-800 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        My Profile
      </motion.h1>

      {/* Personal Information Card */}
      <motion.div
        className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Personal Information
        </h2>
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">
            <strong>Name:</strong> {profile.fullName || "Not provided"}
          </p>
          <p className="text-gray-600">
            <strong>Email:</strong> {profile.email}
          </p>
          <p className="text-gray-600">
            <strong>Phone:</strong> {profile.phone || "Not provided"}
          </p>
          <p className="text-gray-600">
            <strong>Gender:</strong> {profile.gender || "Not provided"}
          </p>
          <p className="text-gray-600">
            <strong>Date of Birth:</strong>{" "}
            {profile.dateOfBirth || "Not provided"}
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex justify-end space-x-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Edit size={18} />
          Edit
        </motion.button>
        <motion.button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={18} />
          Delete
        </motion.button>
      </motion.div>

      {/* Quick Actions Card */}
      <motion.div
        className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <motion.a
            href="/my-account?tab=orders"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="text-orange-500" size={20} />
            <span className="text-sm text-gray-700">View Order History</span>
          </motion.a>
          <motion.a
            href="/my-account?tab=wishlist"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart className="text-orange-500" size={20} />
            <span className="text-sm text-gray-700">View Wishlist</span>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccountView;
