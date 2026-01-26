"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import AccountEdit from "../../../../../components/supplierDashboard/SupAccountEdit";
import BankDetailsEdit from "../../../../../components/supplierDashboard/BankDetailsEdit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useCurrentUser, useCurrentVendor } from "@/hooks/use-auth";

const MyAccountPage = () => {
  const queryClient = useQueryClient();

  // Modal states
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Password state
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
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  // Get user and vendor data
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const userId = user?.id;

  const { data: profile, isLoading: vendorLoading } = useCurrentVendor({
    userId,
  });

  // Profile update mutation with optimistic updates
  const profileMutation = useMutation({
    mutationFn: async (profileData) => {
      if (!userId) throw new Error("User ID not found");

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", userId);

      if (error) throw error;

      // Fetch updated data
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;
      return data;
    },
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["vendor", userId] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(["vendor", userId]);

      // Optimistically update
      queryClient.setQueryData(["vendor", userId], (old) => ({
        ...old,
        ...newData,
      }));

      return { previousProfile };
    },
    onError: (context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(["vendor", userId], context.previousProfile);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["vendor", userId] });
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      if (!user?.email) throw new Error("User email not found");

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) throw new Error("Current password is incorrect");

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
    },
  });

  // Account deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID not found");

      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (error) throw error;

      await supabase.auth.signOut();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Validate password form
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

  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setPasswordMessage({ type: "", text: "" });

    try {
      await passwordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordMessage({
        type: "success",
        text: "Password changed successfully!",
      });

      // Clear form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordMessage({ type: "", text: "" });
      }, 2000);
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error.message || "An error occurred while changing password",
      });
    }
  };

  // Reset password form
  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMessage({ type: "", text: "" });
  };

  // Handle profile submission
  const handleProfileSubmit = async (profileData) => {
    await profileMutation.mutateAsync(profileData);
    setIsPersonalModalOpen(false);
    setIsBankModalOpen(false);
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
    } catch (err) {
      console.error("Error deleting account:", err);
      alert(err.message || "Failed to delete account");
    }
  };

  const isLoading = userLoading || vendorLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="px-4 py-6">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Account Information
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage your personal and store information, security settings, and
            account preferences all in one place.
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
            <motion.button
              onClick={() => setIsPersonalModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Edit
            </motion.button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">
                {profile?.full_name || "John Doe"}
              </p>
              <p className="font-medium text-gray-900">
                {profile?.username || "Mostore"}
              </p>
              <div className="flex items-center gap-2 mt-1">
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
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">
                {profile?.email || "user@example.com"}
              </p>
            </div>

            {profile?.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{profile.phone}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Store Address</p>
              <p className="text-gray-900 text-sm">
                {profile?.address ||
                  "No store address on file. Add one to complete your profile."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bank Details Section */}
        <motion.div
          className="bg-white rounded-lg p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Bank details
            </h2>
            <motion.button
              onClick={() => setIsBankModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Edit
            </motion.button>
          </div>
          <div className="space-y-3">
            {profile?.bank_name ||
            profile?.bank_account_number ||
            profile?.bic_swiftcode ||
            profile?.bank_address ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="text-gray-900">
                    {profile.bank_name || "Set your Bank Name"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Number / IBAN</p>
                  <p className="text-gray-900 font-mono">
                    {profile.bank_account_number || "Set your account number"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">SWIFT/BIC Code</p>
                  <p className="text-gray-900 font-mono">
                    {profile.bic_swiftcode || "Set your SWIFT/BIC code"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Bank Address</p>
                  <p className="text-gray-900">
                    {profile.bank_address || "Set your Bank Address"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-600 text-sm">
                No bank details on file. Add your bank information to receive
                payments.
              </p>
            )}
          </div>
        </motion.div>

        {/* Password & Security Section */}
        <motion.div
          className="bg-white rounded-lg p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Password & Security
              </h2>
            </div>
            <motion.button
              onClick={() => setIsPasswordModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Change Password
            </motion.button>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 text-sm">
              Keep your account secure by using a strong password and updating
              it regularly.
            </p>
            <p className="text-gray-500 text-xs">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>

        {/* Delete Account Section */}
        <motion.div
          className="bg-white rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Danger Zone
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition border border-red-200 disabled:opacity-50"
          >
            Delete account
          </button>
        </motion.div>

        {profileMutation.isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm mt-4 text-center bg-red-50 p-3 rounded-lg"
          >
            {profileMutation.error?.message || "An error occurred"}
          </motion.div>
        )}

        {/* Personal Details Edit Modal */}
        <AnimatePresence>
          {isPersonalModalOpen && (
            <AccountEdit
              profile={profile}
              handleProfileSubmit={handleProfileSubmit}
              isSubmitting={profileMutation.isPending}
              setIsEditing={setIsPersonalModalOpen}
            />
          )}
        </AnimatePresence>

        {/* Bank Details Edit Modal */}
        <AnimatePresence>
          {isBankModalOpen && (
            <BankDetailsEdit
              profile={profile}
              handleProfileSubmit={handleProfileSubmit}
              isSubmitting={profileMutation.isPending}
              setIsEditing={setIsBankModalOpen}
            />
          )}
        </AnimatePresence>

        {/* Password Change Modal */}
        <AnimatePresence>
          {isPasswordModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setIsPasswordModalOpen(false);
                resetPasswordForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Change Password
                  </h3>
                </div>

                {passwordMessage.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                    <span className="text-sm">{passwordMessage.text}</span>
                  </motion.div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                        disabled={passwordMutation.isPending}
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
                        disabled={passwordMutation.isPending}
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
                        disabled={passwordMutation.isPending}
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

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <span className="font-medium">
                        Password Requirements:
                      </span>{" "}
                      Must be at least 6 characters long and different from your
                      current password.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPasswordModalOpen(false);
                        resetPasswordForm();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      disabled={passwordMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      disabled={passwordMutation.isPending}
                    >
                      <Lock className="w-4 h-4" />
                      {passwordMutation.isPending
                        ? "Changing..."
                        : "Change Password"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete Account
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete your account? This action
                  cannot be undone and all your data will be permanently
                  removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending
                      ? "Deleting..."
                      : "Delete Account"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyAccountPage;
