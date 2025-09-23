"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import useUserStore from "@/lib/stores/useUserStore";
import Breadcrumbs from "@/components/shared/user/BreadCrumbs";
import Sidebar from "@/components/shared/user/Sidebar";
import WelcomePage from "@/components/shared/user/WelcomePage"; // New component
import AccountView from "@/components/shared/user/AccountView";
import AccountEdit from "@/components/shared/user/AccountEdit";
import PasswordChange from "@/components/shared/user/PasswordChange";
import DeleteAccountModal from "@/components/shared/user/DeleteAccountModal";
import OrderHistory from "@/components/orderHistory";
import LoadingSpinner from "@/components/shared/user/LoadingSpinner";
import { Heart, LogOut } from "lucide-react";

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("welcome"); // Default to "welcome"
  console.log(user);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs = ["welcome", "account", "orders", "wishlist"];
    setActiveTab(validTabs.includes(tab) ? tab : "welcome"); // Default to "welcome"
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const metadata = getUserMetadata();
      setProfileForm({
        fullName: metadata.full_name || "",
        email: getUserEmail() || "",
        phone: metadata.phone || "",
        gender: metadata.gender || "",
        dateOfBirth: metadata.date_of_birth || "",
      });
    }
  }, [user, getUserEmail, getUserMetadata]);

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
      setMessage({
        type: "error",
        text: "New password and confirm password do not match",
      });
      return false;
    }
    return true;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth,
      });
      setMessage({ type: "success", text: "Profile updated successfully" });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
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
      await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setMessage({ type: "success", text: "Password updated successfully" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (user) {
      const metadata = getUserMetadata();
      setProfileForm({
        fullName: metadata.full_name || "",
        email: getUserEmail() || "",
        phone: metadata.phone || "",
        gender: metadata.gender || "",
        dateOfBirth: metadata.date_of_birth || "",
      });
      setMessage({ type: "", text: "" });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/my-account?tab=${tab}`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="lg:grid lg:grid-cols-12 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="lg:col-span-9 py-4 lg:pl-28">
          <Breadcrumbs />
          <AnimatePresence mode="wait">
            {activeTab === "welcome" && (
              <motion.div
                key="welcome-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <WelcomePage
                  fullName={profileForm.fullName || "Guest"}
                  recentOrders={[]} // Placeholder, replace with actual data
                  handleLogout={handleLogout}
                />
              </motion.div>
            )}
            {activeTab === "account" && !isEditing && (
              <motion.div
                key="account-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AccountView
                  profile={profileForm}
                  setIsEditing={setIsEditing}
                  setIsDeleteModalOpen={setIsDeleteModalOpen}
                />
              </motion.div>
            )}
            {activeTab === "account" && isEditing && (
              <motion.div
                key="account-edit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AccountEdit
                  profileForm={profileForm}
                  handleProfileChange={handleProfileChange}
                  handleProfileSubmit={handleProfileSubmit}
                  resetForm={resetForm}
                  isSubmitting={isSubmitting}
                  message={message}
                  setIsEditing={setIsEditing}
                />
              </motion.div>
            )}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OrderHistory />
              </motion.div>
            )}
            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Wishlist
                  </h2>
                  <p className="text-gray-500">
                    Your saved items will appear here.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-4"
            >
              <PasswordChange
                passwordForm={passwordForm}
                handlePasswordChange={handlePasswordChange}
                handlePasswordSubmit={handlePasswordSubmit}
                showPasswords={showPasswords}
                togglePasswordVisibility={togglePasswordVisibility}
                isSubmitting={isSubmitting}
                message={message}
              />
            </motion.div>
          )}
        </main>
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
        />
      </div>
    </div>
  );
};

export default MyProfileClient;
