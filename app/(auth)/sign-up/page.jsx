"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const SignUpPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFields = () => {
    setError("");
    if (
      !form.fullName ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All fields are required.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(form.username)) {
      setError(
        "Username must be 3-20 characters long and contain only letters, numbers, and underscores."
      );
      return false;
    }
    return true;
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .limit(1);
      if (error) throw error;
      return !(Array.isArray(data) && data.length > 0);
    } catch (err) {
      console.error("Username check error:", err);
      return false;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateFields()) return;
    setIsLoading(true);

    try {
      // Check username availability
      const isUsernameAvailable = await checkUsernameAvailability(
        form.username
      );
      if (!isUsernameAvailable) {
        setError("Username is already taken. Please choose another one.");
        setIsLoading(false);
        return;
      }

      const userMetadata = {
        full_name: form.fullName,
        username: form.username,
        is_supplier: false,
        role: "customer",
      };

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: userMetadata,
        },
      });

      if (error) throw error;
      setSuccess(
        "Account created successfully! Please check your email to verify your account."
      );
      // Delay redirect to show success UI
      setTimeout(() => router.push("/sign-in"), 5000);
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message || "Sign-up failed. Please try again.");
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="hidden md:flex md:w-1/2 relative">
        <Image
          src="/auth.png"
          alt="Sign up background"
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
              Create Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Join Mostore and start shopping
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
                    Welcome to Mostore!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    A verification email has been sent to {form.email}. Please
                    verify your account before logging in.
                  </p>
                  <button
                    onClick={() => router.push("/sign-in")}
                    className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Go to Sign In
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="johndoe123"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200 font-medium"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              Want to sell on Mostore?
            </p>
            <button
              type="button"
              onClick={() => router.push("/supplier-signup")}
              className="w-full bg-orange-100 text-orange-700 border border-orange-300 py-2 px-4 rounded-md hover:bg-orange-200 transition-colors font-medium"
            >
              Become a Supplier
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="text-blue-600 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
