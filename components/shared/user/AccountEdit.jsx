import React from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import LoadingSpinner from "./LoadingSpinner";

const AccountEdit = ({
  profileForm,
  handleProfileChange,
  handleProfileSubmit,
  resetForm,
  isSubmitting,
  message,
  setIsEditing,
}) => {
  return (
    <Tooltip.Provider>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
            <p className="text-gray-500 mt-1">Update your personal details</p>
          </div>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <motion.button
                onClick={resetForm}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Reset
              </motion.button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                sideOffset={5}
              >
                Reset form to original values
                <Tooltip.Arrow className="fill-gray-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

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

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100"
              />
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100"
              />
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100"
              />
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={profileForm.gender}
                onChange={handleProfileChange}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={profileForm.dateOfBirth}
                onChange={handleProfileChange}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100"
              />
            </motion.div>
          </div>
          <div className="flex justify-end gap-4">
            <motion.button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-md hover:shadow-lg disabled:bg-gray-400"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : <Save size={16} />}
              {isSubmitting ? "Updating..." : "Save Changes"}
            </motion.button>
          </div>
        </form>
      </div>
    </Tooltip.Provider>
  );
};

export default AccountEdit;
