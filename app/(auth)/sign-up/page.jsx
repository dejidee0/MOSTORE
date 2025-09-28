"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

const SignUpPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Update password criteria in real-time
    if (name === "password") {
      setPasswordCriteria({
        minLength: value.length >= 6,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const validateFields = () => {
    setError("");
    if (
      !form.fullName ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.confirmPassword ||
      !form.gender ||
      !form.dateOfBirth
    ) {
      setError("All fields are required.");
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
        "Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
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
    const dob = new Date(form.dateOfBirth);
    if (isNaN(dob.getTime())) {
      setError("Please enter a valid date of birth.");
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
        gender: form.gender,
        date_of_birth: form.dateOfBirth,
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

  const criteriaVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const iconVariants = {
    hover: { scale: 1.1, color: "#f97316" }, // Orange-600
    tap: { scale: 0.9 },
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
                    className="bg-orange-500 text-white py-2 px-6 rounded-md hover:bg-orange-600 transition-colors"
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
                placeholder="Enter your Full Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                placeholder="Enter your Email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                placeholder="Enter your Username"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
              >
                <option value="" disabled>
                  Select your Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your Password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <motion.button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              {form.password && (
                <motion.div
                  className="mt-2 space-y-1"
                  initial="hidden"
                  animate="visible"
                  variants={criteriaVariants}
                >
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
                      At least 6 characters
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
                </motion.div>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your Password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <motion.button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                required
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
              />
              <div className="text-xs text-gray-700">
                By creating an account, you agree to Mostore{" "}
                <span className="text-orange-500 underline">Terms of Use</span>{" "}
                and the
                <span className="text-orange-500 underline">
                  {" "}
                  Privacy and Cookies policy.
                </span>
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200 font-medium"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              Want to sell on Mostore?
            </p>
            <button
              type="button"
              onClick={() => router.push("/supplier-sign")}
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

export default SignUpPage;
