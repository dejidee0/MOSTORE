"use client";
import Image from "next/image";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Main reset password component
const PasswordResetContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Check if user has valid reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
          setSessionLoading(false);
          return;
        }

        if (!session) {
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
          setSessionLoading(false);
          return;
        }

        setIsValidSession(true);
        setSessionLoading(false);
      } catch (err) {
        console.error("Session check error:", err);
        setError("Something went wrong. Please try again.");
        setSessionLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Update password criteria in real-time
    if (name === "password") {
      setPasswordCriteria({
        minLength: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const validateFields = () => {
    setError("");

    if (!form.password || !form.confirmPassword) {
      setError("Both password fields are required.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (
      !passwordCriteria.minLength ||
      !passwordCriteria.uppercase ||
      !passwordCriteria.lowercase ||
      !passwordCriteria.number ||
      !passwordCriteria.specialChar
    ) {
      setError(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return false;
    }

    return true;
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateFields()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (error) throw error;

      setSuccess("Password updated successfully! Redirecting to sign in...");

      // Sign out user and redirect to sign in after showing success
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push(
          "/sign-in?message=Password updated successfully. Please sign in with your new password."
        );
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  // Loading state while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Error state for invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="hidden md:flex md:w-1/2 relative">
        <Image
          src="/auth.png"
          alt="Password reset background"
          fill
          priority
          className="object-contain md:object-cover"
        />
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 md:p-10 space-y-6">
          <div className="md:hidden flex justify-center">
            <Image
              src="/assets/Mostore Logo Icon.png"
              width={80}
              height={80}
              alt="Logo"
              priority
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800">
              Reset Password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create a new secure password for your account
            </p>
          </div>

          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 text-sm text-center p-3 rounded-md">
              {error}
            </div>
          )}

          <AnimatePresence>
            {success && (
              <motion.div
                key="success-modal"
                className="fixed inset-0 bg-white/60 bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-2xl"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div className="w-16 h-16 mx-auto mb-4">
                    <CheckCircle className="w-full h-full text-green-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Password Updated!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your password has been successfully updated. You'll be
                    redirected to sign in shortly.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your new password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password criteria */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        passwordCriteria.minLength
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        passwordCriteria.minLength
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        passwordCriteria.uppercase
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        passwordCriteria.uppercase
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Contains an uppercase letter
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        passwordCriteria.lowercase
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        passwordCriteria.lowercase
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Contains a lowercase letter
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        passwordCriteria.number
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        passwordCriteria.number
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Contains a number
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        passwordCriteria.specialChar
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        passwordCriteria.specialChar
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Contains a special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your new password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200 font-medium"
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="text-orange-500 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense boundary
const PasswordResetPage = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PasswordResetContent />
    </Suspense>
  );
};

export default PasswordResetPage;
