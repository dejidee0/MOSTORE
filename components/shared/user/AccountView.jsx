import React from "react";
import { motion } from "framer-motion";
import { User, Trash2 } from "lucide-react";

const AccountView = ({ profile, setIsEditing, setIsDeleteModalOpen }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">My Account</h2>
        </div>
        <div className="flex gap-4">
          <motion.button
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-md"
          >
            Edit Profile
          </motion.button>
          <motion.button
            onClick={() => setIsDeleteModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
          >
            <Trash2 className="w-5 h-5 inline-block mr-2" />
            Delete Account
          </motion.button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50/50 p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <p className="mt-1 text-gray-900">{profile.firstName || "Not set"}</p>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <p className="mt-1 text-gray-900">{profile.lastName || "Not set"}</p>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="mt-1 text-gray-900">{profile.email || "Not set"}</p>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <p className="mt-1 text-gray-900">{profile.phone || "Not set"}</p>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <p className="mt-1 text-gray-900">{profile.gender || "Not set"}</p>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <p className="mt-1 text-gray-900">
            {profile.dateOfBirth || "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountView;
