"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      // Fetch profile from Supabase
      (async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "full_name,username,phone,address,bank_account_number,bank_name"
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
    const { error } = await supabase
      .from("profiles")
      .update(profileForm)
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
            "full_name,username,phone,address,bank_account_number,bank_name"
          )
          .eq("id", user.id)
          .single();
        if (data) setProfileForm(data);
      })();
    }
    setMessage({ type: "", text: "" });
  };

  if (!initialized || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow rounded-xl p-6 w-full max-w-xl"
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-800">My Profile</h2>
        <p className="mb-6 text-gray-500">View and update your information</p>
        {message.text && (
          <div
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
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
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
            <label className="block text-sm font-medium mb-1">Username</label>
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
            <label className="block text-sm font-medium mb-1">Phone</label>
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
            <label className="block text-sm font-medium mb-1">Address</label>
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
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              value={profileForm.bank_name}
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
      </motion.div>
    </div>
  );
};

export default MyProfile;
