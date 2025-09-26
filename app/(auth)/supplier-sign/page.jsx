"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  DollarSign,
  Clock,
  Star,
  X,
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
    bankAccountNumber: "",
    bankName: "",
    acceptedTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateBasicFields = () => {
    setError("");
    if (
      !form.fullName ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All basic fields are required.");
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

  const validateSupplierFields = () => {
    if (
      !form.phoneNumber ||
      !form.address ||
      !form.bankAccountNumber ||
      !form.bankName
    ) {
      setError("All supplier fields are required.");
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
      console.error("Username check error:", err);
      return false;
    }
  };

  const handleSupplierSignUp = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateSupplierFields()) return;
    setIsLoading(true);

    try {
      const userMetadata = {
        full_name: form.fullName,
        username: form.username,
        is_supplier: true,
        is_approved: false,
        is_active: true,
        role: "supplier",
        phone: form.phoneNumber,
        address: form.address,
        bank_account_number: form.bankAccountNumber,
        bank_name: form.bankName,
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

  const handleNext = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateBasicFields()) return;

    setIsCheckingUsername(true);
    try {
      const isUsernameAvailable = await checkUsernameAvailability(
        form.username
      );
      if (!isUsernameAvailable) {
        setError("Username is already taken. Please choose another one.");
        return;
      }

      setDirection(1);
      setStep(2);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleBackToBasic = (e) => {
    if (e) e.preventDefault();
    setDirection(-1);
    setStep(1);
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

  const slideVariants = {
    initial: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute",
      width: "100%",
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: { duration: 0.35, ease: "easeInOut" },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      position: "absolute",
      width: "100%",
      transition: { duration: 0.35, ease: "easeInOut" },
    }),
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

  // Splash screen benefits (simplified like Konga)
  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6 text-orange-600" />,
      title: "Earn More Money",
      description: "Reach millions of customers across Nigeria and beyond",
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: "Safe & Secure",
      description: "Trusted platform with secure payment processing",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      title: "Low Commission",
      description: "Only 15% commission - you keep more of your earnings",
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "24/7 Support",
      description: "Dedicated merchant support team always ready to help",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Splash Screen Modal */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl max-h-[90vh] max-w-lg w-full relative overflow-hidden shadow-xl border border-gray-100"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 px-8 pt-8 pb-6 text-white relative overflow-hidden ">
                {/* Close button */}
                <button
                  onClick={() => setShowSplash(false)}
                  className="absolute top-4 right-4 text-white/90 hover:text-white transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Logo and header */}
                <div className="text-center relative z-10 ">
                  <div className="flex justify-center ">
                    <div className="backdrop-blur-bg-white sm rounded-2xl p-3 border border-white/20">
                      <Image
                        src="/assets/Mostore Logo Icon.png"
                        width={50}
                        height={50}
                        alt="Mostore Logo"
                        priority
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Start Selling on Mostore
                  </h2>
                  <p className="text-orange-100 text-sm opacity-90">
                    Join the next generation of successful online sellers
                  </p>
                </div>

                {/* Decorative glass elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-16 -translate-x-16"></div>
                <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-white/20 rounded-full"></div>
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-white/15 rounded-full"></div>
              </div>

              {/* Content */}
              <div className="px-8 py-6 bg-white/50 backdrop-blur-sm">
                {/* Benefits grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + 0.1 * index, duration: 0.4 }}
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/90 transition-all duration-300 group border border-gray-100/50 hover:shadow-lg hover:scale-105"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mb-3 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                        {benefit.icon}
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {benefit.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Trust indicators */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gray-100/50">
                  <div className="flex items-center justify-center space-x-8 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Secure
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-600 fill-current" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Trusted
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-2xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <span>Start Selling - It's Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      No setup fees • Quick approval • Start earning immediately
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom glass accent */}
              <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 opacity-80"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Signup Form */}
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
              Become a Supplier
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

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div
              className={`flex items-center ${
                step >= 1 ? "text-orange-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? "bg-orange-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Basic Info</span>
            </div>
            <div
              className={`w-8 h-0.5 ${
                step >= 2 ? "bg-orange-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                step >= 2 ? "text-orange-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? "bg-orange-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Supplier Details</span>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence custom={direction} mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleNext}
                  className="space-y-5"
                >
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
                      placeholder="you@example.com"
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
                      placeholder="johndoe123"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || isCheckingUsername}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200"
                  >
                    {isCheckingUsername ? "Checking Username..." : "Next Step"}
                  </button>
                </motion.form>
              )}
              {step === 2 && (
                <motion.form
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleSupplierSignUp}
                  className="space-y-5"
                >
                  <div className="space-y-4 bg-orange-50 p-4 rounded-md border border-orange-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
                      Business & Payment Information
                    </h3>
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
                        placeholder="+1 234 567 8900"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Complete Business Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        placeholder="123 Main Street, New York, NY 10001, USA"
                        rows="3"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bankName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Bank Name
                      </label>
                      <input
                        id="bankName"
                        name="bankName"
                        type="text"
                        value={form.bankName}
                        onChange={handleChange}
                        required
                        placeholder="Bank of America"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bankAccountNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Account Number
                      </label>
                      <input
                        id="bankAccountNumber"
                        name="bankAccountNumber"
                        type="text"
                        value={form.bankAccountNumber}
                        onChange={handleChange}
                        required
                        placeholder="1234567890"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
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
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToBasic}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200"
                    >
                      {isLoading
                        ? "Creating Account..."
                        : "Create Supplier Account"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
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
