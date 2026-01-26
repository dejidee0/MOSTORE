"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Breadcrumbs from "@/components/shared/user/BreadCrumbs";
import WelcomePage from "@/components/shared/user/WelcomePage";
import AccountView from "@/components/shared/user/AccountView";
import PasswordChange from "@/components/shared/user/PasswordChange";
import DeleteAccountModal from "@/components/shared/user/DeleteAccountModal";
import OrderHistory from "@/components/orderHistory";
import LoadingSpinner from "@/components/shared/user/LoadingSpinner";
import { useCurrentCustomer, useCurrentUser } from "@/hooks/use-auth";

const MyProfileClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth hooks
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: customer, isLoading: customerLoading } = useCurrentCustomer({
    userId: user?.id,
  });

  // UI State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Active tab state - sync with URL
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    const validTabs = ["welcome", "account", "orders", "wishlist"];
    return validTabs.includes(tab) ? tab : "welcome";
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    billingFirstName: "",
    billingLastName: "",
    billingStreetAddress: "",
    billingZipCode: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingPhone: "",
    deliveryFirstName: "",
    deliveryLastName: "",
    deliveryStreetAddress: "",
    deliveryZipCode: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryCountry: "",
    deliveryPhone: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync activeTab with URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs = ["welcome", "account", "orders", "wishlist"];
    const newTab = validTabs.includes(tab) ? tab : "welcome";

    if (activeTab !== newTab) {
      setActiveTab(newTab);
    }
  }, [searchParams, activeTab]);

  // Fetch and populate profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfileForm({
          fullName: data.full_name || "",
          email: customer?.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          dateOfBirth: data.date_of_birth || "",
          billingFirstName: data.billing_first_name || "",
          billingLastName: data.billing_last_name || "",
          billingStreetAddress: data.billing_street_address || "",
          billingZipCode: data.billing_zip_code || "",
          billingCity: data.billing_city || "",
          billingState: data.billing_state || "",
          billingCountry: data.billing_country || "",
          billingPhone: data.billing_phone || "",
          deliveryFirstName: data.delivery_first_name || "",
          deliveryLastName: data.delivery_last_name || "",
          deliveryStreetAddress: data.delivery_street_address || "",
          deliveryZipCode: data.delivery_zip_code || "",
          deliveryCity: data.delivery_city || "",
          deliveryState: data.delivery_state || "",
          deliveryCountry: data.delivery_country || "",
          deliveryPhone: data.delivery_phone || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data" });
      }
    };

    fetchProfile();
  }, [user?.id, customer?.email]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, userLoading, router]);

  // Form handlers
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

  // Validation
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

  // Profile submission handler
  const handleProfileSubmit = async (profileData) => {
    if (!user?.id) {
      setMessage({ type: "error", text: "User not authenticated" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const dataToUpdate = {
        full_name: profileData.fullName || profileForm.fullName,
        phone: profileData.phone || profileForm.phone,
        gender: profileData.gender || profileForm.gender,
        date_of_birth: profileData.dateOfBirth || profileForm.dateOfBirth,
        billing_first_name:
          profileData.billing_first_name || profileForm.billingFirstName,
        billing_last_name:
          profileData.billing_last_name || profileForm.billingLastName,
        billing_street_address:
          profileData.billing_street_address ||
          profileForm.billingStreetAddress,
        billing_zip_code:
          profileData.billing_zip_code || profileForm.billingZipCode,
        billing_city: profileData.billing_city || profileForm.billingCity,
        billing_state: profileData.billing_state || profileForm.billingState,
        billing_country:
          profileData.billing_country || profileForm.billingCountry,
        billing_phone: profileData.billing_phone || profileForm.billingPhone,
        delivery_first_name:
          profileData.delivery_first_name || profileForm.deliveryFirstName,
        delivery_last_name:
          profileData.delivery_last_name || profileForm.deliveryLastName,
        delivery_street_address:
          profileData.delivery_street_address ||
          profileForm.deliveryStreetAddress,
        delivery_zip_code:
          profileData.delivery_zip_code || profileForm.deliveryZipCode,
        delivery_city: profileData.delivery_city || profileForm.deliveryCity,
        delivery_state: profileData.delivery_state || profileForm.deliveryState,
        delivery_country:
          profileData.delivery_country || profileForm.deliveryCountry,
        delivery_phone: profileData.delivery_phone || profileForm.deliveryPhone,
      };

      // Update email in Supabase auth if changed
      if (profileData.email && profileData.email !== profileForm.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: profileData.email,
        });

        if (authError) {
          throw new Error(authError.message || "Failed to update email");
        }
      }

      // Update profile in database
      const { data, error } = await supabase
        .from("profiles")
        .update(dataToUpdate)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProfileForm((prev) => ({
        ...prev,
        fullName: dataToUpdate.full_name,
        phone: dataToUpdate.phone,
        gender: dataToUpdate.gender,
        dateOfBirth: dataToUpdate.date_of_birth,
        billingFirstName: dataToUpdate.billing_first_name,
        billingLastName: dataToUpdate.billing_last_name,
        billingStreetAddress: dataToUpdate.billing_street_address,
        billingZipCode: dataToUpdate.billing_zip_code,
        billingCity: dataToUpdate.billing_city,
        billingState: dataToUpdate.billing_state,
        billingCountry: dataToUpdate.billing_country,
        billingPhone: dataToUpdate.billing_phone,
        deliveryFirstName: dataToUpdate.delivery_first_name,
        deliveryLastName: dataToUpdate.delivery_last_name,
        deliveryStreetAddress: dataToUpdate.delivery_street_address,
        deliveryZipCode: dataToUpdate.delivery_zip_code,
        deliveryCity: dataToUpdate.delivery_city,
        deliveryState: dataToUpdate.delivery_state,
        deliveryCountry: dataToUpdate.delivery_country,
        deliveryPhone: dataToUpdate.delivery_phone,
      }));

      setMessage({
        type: "success",
        text:
          profileData.email && profileData.email !== profileForm.email
            ? "Profile updated successfully. Please check your new email for verification."
            : "Profile updated successfully",
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password submission handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: customer?.email || user?.email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message || "Failed to update password");
      }

      setMessage({ type: "success", text: "Password updated successfully" });

      // Reset password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to original values
  const resetForm = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfileForm({
        fullName: data.full_name || "",
        email: customer?.email || "",
        phone: data.phone || "",
        gender: data.gender || "",
        dateOfBirth: data.date_of_birth || "",
        billingFirstName: data.billing_first_name || "",
        billingLastName: data.billing_last_name || "",
        billingStreetAddress: data.billing_street_address || "",
        billingZipCode: data.billing_zip_code || "",
        billingCity: data.billing_city || "",
        billingState: data.billing_state || "",
        billingCountry: data.billing_country || "",
        billingPhone: data.billing_phone || "",
        deliveryFirstName: data.delivery_first_name || "",
        deliveryLastName: data.delivery_last_name || "",
        deliveryStreetAddress: data.delivery_street_address || "",
        deliveryZipCode: data.delivery_zip_code || "",
        deliveryCity: data.delivery_city || "",
        deliveryState: data.delivery_state || "",
        deliveryCountry: data.delivery_country || "",
        deliveryPhone: data.delivery_phone || "",
      });

      setMessage({ type: "", text: "" });
    } catch (error) {
      console.error("Error resetting profile:", error);
      setMessage({ type: "error", text: "Failed to reset profile data" });
    }
  };

  // Tab navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/my-account?tab=${tab}`);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage({ type: "error", text: "Failed to logout" });
    }
  };

  // Loading state
  if (userLoading || customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="lg:grid lg:grid-cols-12 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="lg:col-span-9 py-4 lg:pl-28">
          <Breadcrumbs key={activeTab} activeTab={activeTab} />

          {/* Message Display */}
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

          {/* Tab Content */}
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
                  user={user}
                  fullName={profileForm.fullName || "Guest"}
                  recentOrders={[]}
                  handleLogout={handleLogout}
                />
              </motion.div>
            )}

            {activeTab === "account" && (
              <motion.div
                key="account-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AccountView
                  profile={profileForm}
                  setIsDeleteModalOpen={setIsDeleteModalOpen}
                  handleProfileChange={handleProfileChange}
                  handleProfileSubmit={handleProfileSubmit}
                  resetForm={resetForm}
                  isSubmitting={isSubmitting}
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

          {/* Password Change Section (only visible on account tab) */}
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

        {/* Delete Account Modal */}
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
