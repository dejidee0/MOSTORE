"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore";
import { supabase } from "@/lib/supabase-client";
import Breadcrumbs from "@/components/shared/user/BreadCrumbs";
import LoadingSpinner from "@/components/shared/user/LoadingSpinner";

const MyProfile = () => {
  const router = useRouter();
  const { user, loading, isAuthenticated, initialized } = useUserStore();

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    address: "",
    bank_account_number: "",
    bank_name: "",
    bic_swiftCode: "",
    bankAddress: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      (async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "full_name,username,phone,address,bank_account_number,bank_name,bankAddress,bic_swiftCode,is_active"
          )
          .eq("id", user.id)
          .single();
        if (data) setProfileForm(data);
      })();
    }
  }, [user]);

  useEffect(() => {
    if (initialized && !loading && !isAuthenticated()) {
      router.push("/sign-in");
    }
  }, [initialized, loading, isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const { is_active, ...updateData } = profileForm;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    if (user) {
      (async () => {
        const { data } = await supabase
          .from("profiles")
          .select(
            "full_name,username,phone,address,bank_account_number,bank_name,bic_swiftCode,bankAddress,is_active"
          )
          .eq("id", user.id)
          .single();
        if (data) setProfileForm(data);
      })();
    }
    setMessage({ type: "", text: "" });
  };

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="lg:grid lg:grid-cols-12 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="lg:col-span-9 py-4 lg:pl-28">
          <Breadcrumbs activeTab="profile" />

          {message.text && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm text-center mb-4 ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key="profile-page"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  My Profile
                </h2>
                <p className="mb-6 text-gray-500">
                  View and update your information
                </p>

                {/* Account Status Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Account Status
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profileForm.is_active !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profileForm.is_active !== false ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Disabled
                        </>
                      )}
                    </span>
                    {profileForm.is_active === false && (
                      <span className="text-xs text-red-600">
                        Contact support if you believe this is an error
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={profileForm.full_name}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileForm.address}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      name="bank_account_number"
                      value={profileForm.bank_account_number}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={profileForm.bank_name}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      BIC/Swift Code
                    </label>
                    <input
                      type="text"
                      name="bank_bic_swiftCode"
                      value={profileForm.bic_swiftCode}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bank Address
                    </label>
                    <input
                      type="text"
                      name="bank_address"
                      value={profileForm.bankAddress}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
                      disabled={isSubmitting}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:bg-gray-400"
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;
