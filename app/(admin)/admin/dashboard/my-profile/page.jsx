"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore";
import { supabase } from "@/lib/supabase-client";

const MyProfile = () => {
  const router = useRouter();
  const { user, loading, isAuthenticated, updateProfile, initialized } =
    useUserStore();
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    address: "",
    bank_account_number: "",
    bank_name: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    if (user) {
      (async () => {
        try {
          console.log("Fetching profile for user ID:", user.id);
          const { data, error } = await supabase
            .from("profiles")
            .select(
              "full_name,username,phone,address,bank_account_number,bank_name"
            )
            .eq("id", user.id)
            .single();
          console.log("Fetch response:", { data, error });
          if (error) throw error;
          if (data) {
            setOriginalProfile(data);
            setProfileForm({
              full_name: data.full_name || "",
              username: data.username,
              phone: data.phone || "",
              address: data.address || "",
              bank_account_number: data.bank_account_number || "",
              bank_name: data.bank_name || "",
            });
          }
        } catch (err) {
          console.error("Profile fetch error:", err.message);
        }
      })();
    } else {
      console.log("User is not available, skipping profile fetch");
    }
  }, [user]);

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated()) {
      console.log("Redirecting to sign-in due to unauthenticated state");
      router.push("/sign-in");
    }
  }, [initialized, loading, isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter your current password",
      });
      return false;
    }
    if (!passwordForm.newPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter a new password",
      });
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters long",
      });
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return false;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password must be different from current password",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const updatedProfile = {
      ...profileForm,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", user.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setOriginalProfile({ ...originalProfile, ...updatedProfile });
    }
    setIsSubmitting(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        setPasswordMessage({
          type: "error",
          text: "Current password is incorrect",
        });
        setIsChangingPassword(false);
        return;
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (updateError) {
        setPasswordMessage({ type: "error", text: updateError.message });
      } else {
        setPasswordMessage({
          type: "success",
          text: "Password changed successfully!",
        });
        // Clear the password form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Clear success message after 5 seconds
        setTimeout(() => {
          setPasswordMessage({ type: "", text: "" });
        }, 5000);
      }
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: "An error occurred while changing password",
      });
    }

    setIsChangingPassword(false);
  };

  const resetForm = () => {
    if (user && originalProfile) {
      setProfileForm({
        full_name: originalProfile.full_name || "",
        username: originalProfile.username,
        phone: originalProfile.phone || "",
        address: originalProfile.address || "",
        bank_account_number: originalProfile.bank_account_number || "",
        bank_name: originalProfile.bank_name || "",
      });
    }
    setMessage({ type: "", text: "" });
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMessage({ type: "", text: "" });
  };

  if (!initialized || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-gray-500"
        >
          Loading...
        </motion.div>
      </div>
    );
  }
  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-6xl overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-500">
              Manage your personal information and security
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Original Profile */}
          {originalProfile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 p-5 rounded-xl shadow-inner"
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Original Profile
              </h3>
              <div className="space-y-3 text-gray-600">
                <p>
                  <span className="font-medium">Full Name:</span>{" "}
                  {originalProfile.full_name || "-"}
                </p>
                <p>
                  <span className="font-medium">Username:</span>{" "}
                  {originalProfile.username}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {originalProfile.phone || "-"}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {originalProfile.address || "-"}
                </p>
                <p>
                  <span className="font-medium">Bank Account Number:</span>{" "}
                  {originalProfile.bank_account_number || "-"}
                </p>
                <p>
                  <span className="font-medium">Bank Name:</span>{" "}
                  {originalProfile.bank_name || "-"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Editable Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-5 bg-gray-50 rounded-xl shadow-inner"
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Update Profile
            </h3>
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 p-3 rounded mb-4 ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profileForm.full_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={profileForm.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={profileForm.bank_account_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={profileForm.bank_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Password Change Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl shadow-inner border border-orange-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">
              Change Password
            </h3>
          </div>

          <AnimatePresence>
            {passwordMessage.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 p-3 rounded mb-4 ${
                  passwordMessage.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{passwordMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    disabled={isChangingPassword}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    disabled={isChangingPassword}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    disabled={isChangingPassword}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={resetPasswordForm}
                className="flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 transition-all duration-200"
                disabled={isChangingPassword}
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200"
                disabled={isChangingPassword}
              >
                <Lock className="w-5 h-5" />
                {isChangingPassword ? "Changing..." : "Change Password"}
              </motion.button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Password Requirements:</span> Must
              be at least 6 characters long and different from your current
              password.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MyProfile;
