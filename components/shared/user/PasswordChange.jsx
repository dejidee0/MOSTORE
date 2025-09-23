import React from "react";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const PasswordChange = ({
  passwordForm,
  handlePasswordChange,
  handlePasswordSubmit,
  showPasswords,
  togglePasswordVisibility,
  isSubmitting,
  message,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Change Password</h3>
      {message.text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          } backdrop-blur-sm`}
        >
          {message.type === "success" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {message.text}
        </motion.div>
      )}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100 pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100 pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100 pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-md hover:shadow-lg disabled:bg-gray-400"
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : <Save size={16} />}
            {isSubmitting ? "Updating..." : "Change Password"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChange;
