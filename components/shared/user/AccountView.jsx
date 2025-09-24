import React from "react";
import { motion } from "framer-motion";

const AccountView = ({ profile, setIsEditing, setIsDeleteModalOpen }) => {
  return (
    <div className="">
      {/* Header */}

      {/* Profile Content */}
      <div className="px-4 py-6">
        {/* Profile Title and Description */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-3">My Profile</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage your personal information, preferences, and account settings
            all in one place.
          </p>
        </motion.div>

        {/* Personal Details Section */}
        <motion.div
          className="bg-white rounded-lg p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal details
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="space-y-1">
            <p className="font-medium text-gray-900">
              {profile?.fullName || "John Doe"}
            </p>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-600 font-medium">
                Verified
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              {profile?.email || "user@example.com"}
            </p>
            {profile?.phone && <p className="text-gray-600">{profile.phone}</p>}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-sm text-red-600 hover:text-red-800 underline block"
            >
              Delete account
            </button>
          </div>
        </motion.div>

        {/* Billing Address Section */}
        <motion.div
          className="bg-white rounded-lg p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Billing address
            </h2>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Edit
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            {profile?.billingAddress ||
              "No billing address on file. Add one to speed up checkout."}
          </p>
        </motion.div>

        {/* Shipping Address Section */}
        <motion.div
          className="bg-white rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Shipping address
            </h2>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Edit
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            {profile?.shippingAddress ||
              "No shipping address on file. Add one for faster delivery."}
          </p>
        </motion.div>
      </div>

      {/* Bottom Navigation Bar (iOS style) */}
    </div>
  );
};

export default AccountView;
