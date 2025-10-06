"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AccountEdit from "../../../../../components/supplierDashboard/SupAccountEdit";
import BankDetailsEdit from "../../../../../components/supplierDashboard/BankDetailsEdit";
import useUserStore from "@/lib/stores/useUserStore";
import { supabase } from "@/lib/supabase-client";

const MyAccountPage = () => {
  const { user } = useUserStore();

  // Profile state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    bankName: "",
    accountNumber: "",
    SwiftCode: "",
    bankAddress: "",
  });

  // Modal states
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            fullName: data.full_name || "",
            email: user.email || data.email || "",
            phone: data.phone || "",
            gender: data.gender || "",
            address: data.address || "",
            bankName: data.bank_name || "",
            accountNumber: data.bank_account_number || "",
            SwiftCode: data.bic_swiftCode || "",
            dateOfBirth: data.dateOfBirth || "",
            bankAddress: data.bank_address || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle profile changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile submission
  const handleProfileSubmit = async (profileData) => {
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      setError("");

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (error) throw error;

      // Refetch profile to update state
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          fullName: data.full_name || "",
          email: user.email || data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          address: data.address || "",
          bankName: data.bank_name || "",
          accountNumber: data.bank_account_number || "",
          SwiftCode: data.bic_swiftCode || "",
          dateOfBirth: data.dateOfBirth || "",
          bankAddress: data.bank_address || "",
        });
      }

      setIsPersonalModalOpen(false);
      setIsBankModalOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setError("");
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      // Sign out user
      await supabase.auth.signOut();

      // Redirect to home or login page
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
            Manage your personal and store information, and account settings all
            in one place.
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
                {profile?.fullName || "John Doe"}
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
            {profile?.bankName ||
            profile?.accountNumber ||
            profile?.SwiftCode ||
            profile?.bankAddress ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="text-gray-900">
                    {profile.bankName || "Set your Bank Name"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="text-gray-900 font-mono">
                    {profile.accountNumber || "Set your account number"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">SWIFT/BIC Code</p>
                  <p className="text-gray-900 font-mono">
                    {profile.SwiftCode || "Set your SWIFT/BIC code"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Bank Address</p>
                  <p className="text-gray-900">
                    {profile.bankAddress || "Set your Bank Address"}
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
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition border border-red-200"
          >
            Delete account
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm mt-4 text-center bg-red-50 p-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {isPersonalModalOpen && (
            <AccountEdit
              profileForm={profile}
              handleProfileChange={handleProfileChange}
              handleProfileSubmit={handleProfileSubmit}
              resetForm={resetForm}
              isSubmitting={isSubmitting}
              message={{ type: "", text: "" }}
              setIsEditing={setIsPersonalModalOpen}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isBankModalOpen && (
            <BankDetailsEdit
              profileForm={profile}
              handleProfileChange={handleProfileChange}
              handleProfileSubmit={handleProfileSubmit}
              resetForm={resetForm}
              isSubmitting={isSubmitting}
              message={{ type: "", text: "" }}
              setIsEditing={setIsBankModalOpen}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-2xl"
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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete Account"}
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
