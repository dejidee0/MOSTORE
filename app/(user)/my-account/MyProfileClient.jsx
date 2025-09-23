"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  User,
  ShoppingBag,
  Heart,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import useUserStore from "@/lib/stores/useUserStore";
import OrderHistory from "@/components/orderHistory";
import { supabase } from "@/lib/supabase-client";

const LoadingSpinner = ({ size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin`}
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
    <nav className="flex mb-6 px-4 md:px-0" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2 text-sm text-gray-600">
        <li className="flex items-center">
          <Link
            href="/"
            className="hover:text-orange-500 transition-colors flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          <Link
            href="/my-account"
            className="hover:text-orange-500 transition-colors"
          >
            My Account
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          <span className="text-orange-500 font-medium">
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

  // Set active tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs = ["profile", "orders", "wishlist"];
    setActiveTab(validTabs.includes(tab) ? tab : "profile");
  }, [searchParams]);

  // Load user data
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
    if (!passwordForm.currentPassword)
      return (
        setMessage({ type: "error", text: "Current password is required" }),
        false
      );
    if (!passwordForm.newPassword)
      return (
        setMessage({ type: "error", text: "New password is required" }), false
      );
    if (passwordForm.newPassword.length < 6)
      return (
        setMessage({
          type: "error",
          text: "New password must be at least 6 characters long",
        }),
        false
      );
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return (
        setMessage({ type: "error", text: "New passwords do not match" }), false
      );
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
      await updateProfile(updates);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await updatePassword(passwordForm.newPassword);
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update password.",
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
    router.push(`/my-account?tab=${tab}`);
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) return null;

  const userMetadata = getUserMetadata();
  const fullName =
    `${profileForm.firstName} ${profileForm.lastName}`.trim() || "User";

  return (
    <Tooltip.Provider>
      <div className="min-h-screen bg-gray-50 font-sans antialiased">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <Breadcrumbs activeTab={activeTab} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <DropdownMenu.Root
                open={mobileMenuOpen}
                onOpenChange={setMobileMenuOpen}
              >
                <DropdownMenu.Trigger asChild className="lg:hidden">
                  <button className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow-sm mb-4 backdrop-blur-sm">
                    <span className="font-medium text-gray-800">Menu</span>
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="lg:hidden bg-white rounded-xl shadow-lg p-4 w-full max-w-[90vw] mx-auto mt-2 backdrop-blur-md"
                    sideOffset={5}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <UserCircle className="w-8 h-8 text-orange-500" />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {fullName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {profileForm.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu.Item
                      onSelect={() => handleTabChange("profile")}
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${
                        activeTab === "profile"
                          ? "bg-orange-50 text-orange-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <User className="w-5 h-5 mr-3" />
                      My Profile
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleTabChange("orders")}
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${
                        activeTab === "orders"
                          ? "bg-orange-50 text-orange-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5 mr-3" />
                      My Orders
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleTabChange("wishlist")}
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${
                        activeTab === "wishlist"
                          ? "bg-orange-50 text-orange-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Heart className="w-5 h-5 mr-3" />
                      Wishlist
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <nav className="hidden lg:block bg-white rounded-xl shadow-sm p-6 space-y-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <UserCircle className="w-10 h-10 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{fullName}</h3>
                    <p className="text-sm text-gray-500">{profileForm.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Manage Account
                  </h3>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => handleTabChange("profile")}
                        className={`w-full flex items-center p-3 rounded-lg transition ${
                          activeTab === "profile"
                            ? "bg-orange-50 text-orange-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <User className="w-5 h-5 mr-3" />
                        My Profile
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                        sideOffset={5}
                      >
                        Edit your personal information
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Shopping
                  </h3>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => handleTabChange("orders")}
                        className={`w-full flex items-center p-3 rounded-lg transition ${
                          activeTab === "orders"
                            ? "bg-orange-50 text-orange-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5 mr-3" />
                        My Orders
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                        sideOffset={5}
                      >
                        View your order history
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => handleTabChange("wishlist")}
                        className={`w-full flex items-center p-3 rounded-lg transition ${
                          activeTab === "wishlist"
                            ? "bg-orange-50 text-orange-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Heart className="w-5 h-5 mr-3" />
                        Wishlist
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                        sideOffset={5}
                      >
                        Manage your saved items
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="col-span-1 lg:col-span-3 bg-white rounded-xl shadow-sm p-6 md:p-8 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "profile" && (
                    <>
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            Edit Profile
                          </h2>
                          <p className="text-gray-500 mt-1">
                            Update your personal details
                          </p>
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
                            <CheckCircle size={20} />
                          ) : (
                            <AlertCircle size={20} />
                          )}
                          {message.text}
                        </motion.div>
                      )}

                      <form
                        onSubmit={handleProfileSubmit}
                        className="space-y-6"
                      >
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
                        <div className="flex justify-end">
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-md hover:shadow-lg disabled:bg-gray-400"
                          >
                            {isSubmitting ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Save size={16} />
                            )}
                            {isSubmitting ? "Updating..." : "Update Profile"}
                          </motion.button>
                        </div>
                      </form>

                      <div className="mt-12 border-t border-gray-200 pt-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">
                          Change Password
                        </h3>
                        <form
                          onSubmit={handlePasswordSubmit}
                          className="space-y-6"
                        >
                          <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-gray-50/50 p-4 rounded-lg shadow-sm backdrop-blur-sm"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={
                                  showPasswords.current ? "text" : "password"
                                }
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                disabled={isSubmitting}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  togglePasswordVisibility("current")
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              >
                                {showPasswords.current ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
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
                                {showPasswords.new ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
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
                                type={
                                  showPasswords.confirm ? "text" : "password"
                                }
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                disabled={isSubmitting}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-gray-100 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  togglePasswordVisibility("confirm")
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
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
                              {isSubmitting ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Save size={16} />
                              )}
                              {isSubmitting ? "Updating..." : "Change Password"}
                            </motion.button>
                          </div>
                        </form>
                      </div>
                    </>
                  )}

                  {activeTab === "orders" && (
                    <OrderHistory user={user} supabase={supabase} />
                  )}

                  {activeTab === "wishlist" && (
                    <div className="text-center py-16">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Heart className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Your Wishlist
                      </h2>
                      <p className="text-gray-500">
                        Wishlist functionality coming soon...
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default MyProfileClient;
