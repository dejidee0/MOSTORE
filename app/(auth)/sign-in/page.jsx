"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { signInAction, checkAuthStatus, requestPasswordReset } from "./actions";

const SignInPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local form state
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated, role } = await checkAuthStatus();

        if (isAuthenticated) {
          // Redirect based on role
          if (role === "admin") {
            router.push("/admin/dashboard");
          } else if (role === "supplier" || role === "vendor") {
            router.push("/supplier/dashboard/products");
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Client-side validation
    if (!form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("rememberMe", rememberMe.toString());

    // Use transition for better UX
    startTransition(async () => {
      try {
        const result = await signInAction(formData);

        if (!result.success) {
          setError(result.error || "Sign-in failed. Please try again.");
          return;
        }

        // Show success message briefly
        setSuccess("Sign-in successful! Redirecting...");

        // Redirect after a brief delay
        setTimeout(() => {
          if (result.redirectTo) {
            router.push(result.redirectTo);
          } else {
            router.push("/");
          }
          router.refresh();
        }, 500);
      } catch (err) {
        console.error("Unexpected sign in error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Please enter your email address first.");
      return;
    }

    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const result = await requestPasswordReset(form.email);

        if (!result.success) {
          setError(result.error || "Failed to send reset email.");
          return;
        }

        setSuccess(
          result.message ||
            "Password reset email sent. Please check your inbox.",
        );
      } catch (err) {
        console.error("Password reset error:", err);
        setError("Failed to send password reset email. Please try again.");
      }
    });
  };

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isDisabled = isPending;

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Side Image */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/auth.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent"></div>
      </div>

      {/* Right Side Form */}
      <div className="flex flex-col md:flex-row w-full md:w-1/2 items-center justify-center p-8">
        {/* Mobile Logo */}
        <div className="md:hidden flex justify-center py-6">
          <Image
            src="/assets/Mostore Logo Icon.png"
            width={80}
            height={80}
            alt="MOSTORE Logo"
            priority
          />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 md:p-10">
          <h2 className="text-3xl font-semibold mb-2 text-center text-gray-800">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Sign in to continue to MOSTORE
          </p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-center mb-4 p-3 rounded-md text-red-600 bg-red-50 border border-red-200"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-center mb-4 p-3 rounded-md text-green-600 bg-green-50 border border-green-200"
            >
              {success}
            </motion.div>
          )}

          {/* Sign In Form */}
          <form className="space-y-5" onSubmit={handleSignIn}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                disabled={isDisabled}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  disabled={isDisabled}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-500 focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={isDisabled}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isDisabled}
                />
                <label
                  htmlFor="remember"
                  className="text-gray-600 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-orange-500 hover:text-orange-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isDisabled}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isDisabled}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-md transition-all duration-200 flex items-center justify-center font-medium shadow-sm hover:shadow-md"
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
            >
              {isDisabled ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/sign-up")}
                className="text-orange-500 hover:text-orange-600 hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isDisabled}
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Additional Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-2">
            <p className="text-xs text-gray-500">
              Want to sell on MOSTORE?{" "}
              <button
                type="button"
                onClick={() => router.push("/supplier-sign")}
                className="text-orange-500 hover:text-orange-600 hover:underline font-medium transition-colors"
                disabled={isDisabled}
              >
                Become a Supplier
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
