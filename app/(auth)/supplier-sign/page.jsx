"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  X,
  Globe,
  CreditCard,
  Package,
  PhoneCall,
  Eye,
  EyeOff,
} from "lucide-react";

const SupplierSignUpPage = () => {
  const router = useRouter();

  const [showSplash, setShowSplash] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    acceptedTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const validateForm = () => {
    setError("");

    if (
      !form.fullName ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.confirmPassword ||
      !form.phoneNumber ||
      !form.address
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

    if (!form.acceptedTerms) {
      setError("You must accept the supplier terms and conditions.");
      return false;
    }

    const cleanedPhone = form.phoneNumber.replace(/[\s.-]/g, "");
    const phoneRegex = /^[+]?[1-9][\d]{6,15}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      setError("Please enter a valid phone number.");
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
      console.error("Storename check error:", err);
      return false;
    }
  };

  const handleSupplierSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const isUsernameAvailable = await checkUsernameAvailability(
        form.username
      );
      if (!isUsernameAvailable) {
        setError("Storename is already taken. Please choose another one.");
        setIsLoading(false);
        return;
      }

      const userMetadata = {
        full_name: form.fullName,
        username: form.username,
        is_supplier: true,
        is_approved: false,
        has_approved: false,
        is_active: true,
        role: "supplier",
        phone: form.phoneNumber,
        address: form.address,
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
        "Supplier account created successfully! Please check your email to verify your account."
      );
      setTimeout(() => router.push("/sign-in"), 5000);
    } catch (err) {
      console.error("Supplier sign-up error:", err);
      setError(
        err.message || "Supplier account creation failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    setShowSplash(false);
  };

  const TermsModal = () =>
    showTermsModal ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Supplier Terms & Conditions - Mostore
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close terms"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <section>
                <h4 className="font-semibold mb-2">1. ACCEPTANCE OF TERMS</h4>
                <p>
                  By registering as a supplier on Mostore, you agree to be bound
                  by these terms and conditions.
                </p>
              </section>
              <section>
                <h4 className="font-semibold mb-2">2. PAYMENT MANAGEMENT</h4>
                <p>
                  <strong>
                    All customer payments are first received by Mostore
                    administration.
                  </strong>{" "}
                  Funds will only be transferred to the supplier after order
                  validation and compliance with the following conditions:
                </p>
                <ul className="list-disc ml-5 mt-2">
                  <li>Confirmation of product shipment</li>
                  <li>Compliance with agreed delivery times</li>
                  <li>Product quality matching descriptions</li>
                  <li>No ongoing customer complaints</li>
                </ul>
              </section>
              <section>
                <h4 className="font-semibold mb-2">3. TRANSFER TIMEFRAMES</h4>
                <p>
                  Fund transfers to supplier bank accounts are processed within
                  7 to 14 business days after complete order validation by our
                  team.
                </p>
              </section>
              <section>
                <h4 className="font-semibold mb-2">4. COMMISSIONS</h4>
                <p>
                  Mostore takes a 15% commission on each completed sale. This
                  commission covers platform fees, payment processing, and
                  customer support.
                </p>
              </section>
              <section>
                <h4 className="font-semibold mb-2">5. SUPPLIER OBLIGATIONS</h4>
                <ul className="list-disc ml-5">
                  <li>Provide accurate and up-to-date banking information</li>
                  <li>Maintain sufficient stock of listed products</li>
                  <li>Respect announced delivery times</li>
                  <li>Ensure quality customer service</li>
                  <li>Comply with applicable laws and regulations</li>
                </ul>
              </section>
              <section>
                <h4 className="font-semibold mb-2">6. TERMINATION</h4>
                <p>
                  Mostore reserves the right to suspend or terminate any
                  supplier account for non-compliance with these terms or
                  fraudulent activity.
                </p>
              </section>
              <section>
                <h4 className="font-semibold mb-2">7. DATA PROTECTION</h4>
                <p>
                  Your banking and personal information is protected in
                  accordance with applicable data protection laws and will only
                  be used for transactions and communications related to your
                  activity on Mostore.
                </p>
              </section>
              <section>
                <h4 className="font-semibold mb-2">8. APPLICABLE LAW</h4>
                <p>
                  These terms are governed by applicable law. Any disputes will
                  be subject to the jurisdiction of competent courts.
                </p>
              </section>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

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

  const iconVariants = {
    hover: { scale: 1.1, color: "#f97316" },
    tap: { scale: 0.9 },
  };

  const benefits = [
    {
      icon: <Globe className="w-12 h-12 text-orange-600" />,
      title: "Millions of Customers",
      description:
        "Get access to largest online marketplace with millions of active buyers ready to purchase your products.",
    },
    {
      icon: <CreditCard className="w-12 h-12 text-orange-600" />,
      title: "Secure Payments",
      description:
        "Get paid quickly and securely with our trusted payment system. Multiple payment options for your customers.",
    },
    {
      icon: <Package className="w-12 h-12 text-orange-600" />,
      title: "Easy Inventory Management",
      description:
        "Simple tools to manage your products, track inventory, and update listings with just a few clicks.",
    },
    {
      icon: <PhoneCall className="w-12 h-12 text-orange-600" />,
      title: "24/7 Support",
      description:
        "Get help when you need it with our dedicated seller support team available round the clock.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway bg-gradient-to-br from-orange-50 to-orange-100">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white flex justify-center z-50 overflow-y-auto"
          >
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
              <button
                onClick={() => setShowSplash(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/assets/Mostore Logo Icon.png"
                    width={80}
                    height={80}
                    alt="Mostore Logo"
                    priority
                    className="rounded-xl"
                  />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Sell on Mostore
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                  Grow your business online on Mostore and reach thousands of
                  customers globally today!
                </p>
                <div className="relative h-[30vh] rounded-2xl overflow-hidden">
                  <div className="absolute inset-0">
                    <Image
                      src="/appliance.jpg"
                      alt="Join Mostore sellers"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                  <div className="relative z-10 text-center py-32 px-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGetStarted}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xl font-semibold px-10 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-3"
                    >
                      <span>Join Mostore Today</span>
                      <ArrowRight className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <h1 className="text-center text-2xl font-bold mt-8">
                    Why Sell on Mostore
                  </h1>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white rounded-xl p-2 flex gap-4 items-center shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div>{benefit.icon}</div>
                      <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm">
                    Join thousands of successful sellers already making money on
                    Mostore. Get started in minutes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:flex md:w-1/2 relative">
        <Image
          src="/auth.png"
          alt="Supplier sign up background"
          fill
          priority
          className="object-contain md:object-cover"
        />
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 md:p-10 space-y-6 relative overflow-hidden">
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
              Create A Seller Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Start selling on Mostore today
            </p>
            <button
              onClick={() => setShowSplash(true)}
              className="text-orange-600 hover:underline text-sm mt-2"
            >
              Why sell on Mostore?
            </button>
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
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
                    Your supplier account has been created. A verification email
                    has been sent to {form.email}. Please verify your account
                    before logging in.
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

          <form onSubmit={handleSupplierSignUp} className="space-y-4">
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
                placeholder="Enter Your Full Name"
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
                placeholder="Enter Your Email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Store Name
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Enter Your Store Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Address
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="Enter your full business address"
                rows="2"
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
                  placeholder="••••••••"
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
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
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
                checked={form.acceptedTerms}
                onChange={handleChange}
                required
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
              />
              <div className="text-xs text-gray-700">
                I accept the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-orange-600 hover:underline font-medium"
                >
                  supplier terms & conditions
                </button>{" "}
                of Mostore
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200 font-medium"
            >
              {isLoading ? "Creating Account..." : "Create Supplier Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="text-orange-600 hover:underline"
            >
              Sign In
            </button>
            {" | "}
            <button
              type="button"
              onClick={() => router.push("/sign-up")}
              className="text-orange-600 hover:underline"
            >
              Customer Sign Up
            </button>
          </p>
        </div>
      </div>
      <TermsModal />
    </div>
  );
};

export default SupplierSignUpPage;
