"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Home,
  Menu,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/shared/Footer";
import NavBar from "@/components/shared/NavBar";
import useUserStore from "@/lib/stores/useUserStore";
import OrderHistory from "@/components/orderHistory";
import { supabase } from "@/lib/supabase-client";

export const LoadingSpinner = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin`}
    />
  );
};

const Breadcrumbs = ({ activeTab }) => {
  const pathname = usePathname();
  const tabDisplayNames = {
    profile: "My Profile",
    orders: "My Orders",
    wishlist: "Wishlist",
  };

  return (
    <nav className="flex mb-4 py-4 px-4 md:mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center flex-wrap gap-y-1 space-x-2">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-orange-500 transition-colors text-base md:text-sm"
          >
            <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Home
          </Link>
        </li>
        <li className="inline-flex items-center">
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mx-1" />
          <Link
            href="/my-account"
            className="text-gray-500 hover:text-orange-500 transition-colors text-xs md:text-sm capitalize"
          >
            My Account
          </Link>
        </li>
        <li className="inline-flex items-center">
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mx-1" />
          <span className="text-orange-500 font-medium text-xs md:text-sm capitalize">
            {tabDisplayNames[activeTab] || "My Profile"}
          </span>
        </li>
      </ol>
    </nav>
  );
};

const MyProfileClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    loading,
    isAuthenticated,
    updateProfile,
    updatePassword,
    getUserEmail,
    getUserMetadata,
    initialized,
  } = useUserStore();

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");

  // Form State
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Set active tab based on query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs = ["profile", "orders", "wishlist"];
    setActiveTab(validTabs.includes(tab) ? tab : "profile");
  }, [searchParams]);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      const metadata = getUserMetadata();
      setProfileForm({
        firstName: metadata.firstName || metadata.first_name || "",
        lastName: metadata.lastName || metadata.last_name || "",
        email: getUserEmail() || "",
        phone: metadata.phone || "",
        gender: metadata.gender || "",
        dateOfBirth: metadata.date_of_birth || "",
      });
    }
  }, [user, getUserEmail, getUserMetadata]);

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !loading && !isAuthenticated()) {
      router.push("/sign-in");
    }
  }, [initialized, loading, isAuthenticated, router]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setMessage({ type: "error", text: "Current password is required" });
      return false;
    }
    if (!passwordForm.newPassword) {
      setMessage({ type: "error", text: "New password is required" });
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long",
      });
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return false;
    }
    return true;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const updates = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        gender: profileForm.gender,
        date_of_birth: profileForm.dateOfBirth,
      };

      const { data, error } = await updateProfile(updates);

      if (error) {
        throw error;
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const { data, error } = await updatePassword(passwordForm.newPassword);

      if (error) {
        throw error;
      }

      setMessage({ type: "success", text: "Password updated successfully!" });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Password update error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (user) {
      const metadata = getUserMetadata();
      setProfileForm({
        firstName: metadata.firstName || metadata.first_name || "",
        lastName: metadata.lastName || metadata.last_name || "",
        email: getUserEmail() || "",
        phone: metadata.phone || "",
        gender: metadata.gender || "",
        dateOfBirth: metadata.date_of_birth || "",
      });
    }
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMessage({ type: "", text: "" });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`/my-account?${params.toString()}`);
  };

  if (!initialized || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 w-full overflow-hidden font-raleway flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
          <Breadcrumbs activeTab={activeTab} />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-between w-full py-3 px-4 bg-white rounded-lg shadow-sm mb-4"
              aria-expanded={mobileMenuOpen}
            >
              <span className="font-medium text-gray-800">Account Menu</span>
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-500" />
              ) : (
                <Menu className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Sidebar */}
            <aside
              className={`${
                mobileMenuOpen ? "block" : "hidden"
              } lg:block w-full lg:w-1/4 space-y-6 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg shadow-lg lg:shadow-none`}
            >
              <div>
                <h3 className="font-bold text-base md:text-lg mb-3 text-gray-800">
                  Manage My Account
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleTabChange("profile")}
                      className={`flex items-center py-2 px-3 w-full text-left rounded-lg transition-colors ${
                        activeTab === "profile"
                          ? "text-orange-500 font-medium bg-orange-50"
                          : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      <span
                        className={`w-1 h-6 mr-3 rounded-full ${
                          activeTab === "profile"
                            ? "bg-orange-500"
                            : "bg-transparent"
                        }`}
                      ></span>
                      My Profile
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg mb-3 text-gray-800">
                  My Orders
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleTabChange("orders")}
                      className={`flex items-center py-2 px-3 w-full text-left rounded-lg transition-colors ${
                        activeTab === "orders"
                          ? "text-orange-500 font-medium bg-orange-50"
                          : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      <span
                        className={`w-1 h-6 mr-3 rounded-full ${
                          activeTab === "orders"
                            ? "bg-orange-500"
                            : "bg-transparent"
                        }`}
                      ></span>
                      View Order History
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg mb-3 text-gray-800">
                  My WishList
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleTabChange("wishlist")}
                      className={`flex items-center py-2 px-3 w-full text-left rounded-lg transition-colors ${
                        activeTab === "wishlist"
                          ? "text-orange-500 font-medium bg-orange-50"
                          : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      <span
                        className={`w-1 h-6 mr-3 rounded-full ${
                          activeTab === "wishlist"
                            ? "bg-orange-500"
                            : "bg-transparent"
                        }`}
                      ></span>
                      View Wishlist
                    </button>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 bg-white shadow-sm rounded-xl p-5 sm:p-6 md:p-8"
            >
              {activeTab === "profile" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
                        Edit Your Profile
                      </h2>
                      <p className="text-gray-500 text-sm md:text-base">
                        Update your personal information
                      </p>
                    </div>
                    <button
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reset form"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>

                  {/* Status Message */}
                  {message.text && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
                        message.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
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

                  {/* Profile Form */}
                  <form
                    onSubmit={handleProfileSubmit}
                    className="space-y-5 md:space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileForm.firstName}
                          onChange={handleProfileChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileForm.lastName}
                          onChange={handleProfileChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          disabled={true}
                          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                          title="Email cannot be changed here. Contact support if needed."
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="+234 XXX XXX XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={profileForm.gender}
                          onChange={handleProfileChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileForm.dateOfBirth}
                          onChange={handleProfileChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Updating Profile...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Update Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="border-t border-gray-200 pt-6 mt-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                      Password Changes
                    </h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("current")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("new")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirm")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Updating Password...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {activeTab === "orders" && (
                <OrderHistory user={user} supabase={supabase} />
              )}

              {activeTab === "wishlist" && (
                <div className="text-center py-12">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                    Wishlist
                  </h2>
                  <p className="text-gray-500">
                    Wishlist functionality coming soon...
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfileClient;
