"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";

const SignUpPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    // Supplier fields
    isSupplier: false,
    phoneNumber: "",
    address: "",
    bankAccountNumber: "",
    bankName: "",

    acceptedTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

  // step: 1 = basic (compulsory), 2 = supplier (conditional)
  const [step, setStep] = useState(1);
  // direction for animation: 1 => forward (slide from right), -1 => back (slide from left)
  const [direction, setDirection] = useState(1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSupplierToggle = (e) => {
    const isChecked = e.target.checked;
    setForm((prev) => ({
      ...prev,
      isSupplier: isChecked,
      // Reset supplier fields if unchecked
      ...(isChecked
        ? {}
        : {
            phoneNumber: "",
            address: "",
            bankAccountNumber: "",
            bankName: "",
            bankRoutingNumber: "",
            bankSwift: "",
            acceptedTerms: false,
          }),
    }));
  };

  // Basic-only validation (used when moving from step 1 -> step 2 or direct submit if not supplier)
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

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(form.username)) {
      setError(
        "Username must be 3-20 characters long and contain only letters, numbers, and underscores."
      );
      return false;
    }

    return true;
  };

  // Original validateForm (keeps supplier checks as you originally had)
  const validateForm = () => {
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

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(form.username)) {
      setError(
        "Username must be 3-20 characters long and contain only letters, numbers, and underscores."
      );
      return false;
    }

    // Supplier validation
    if (form.isSupplier) {
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

      // Phone number validation (international-ish)
      const cleanedPhone = form.phoneNumber.replace(/[\s.-]/g, "");
      const phoneRegex = /^[+]?[1-9][\d]{6,15}$/; // basic international length check
      if (!phoneRegex.test(cleanedPhone)) {
        setError("Please enter a valid phone number.");
        return false;
      }
    }

    return true;
  };

  // Check if username is available by querying 'profiles' table (kept as you had it)
  const checkUsernameAvailability = async (username) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .limit(1);

      if (error) {
        console.error("Username check error:", error);
        return false;
      }

      // If data array is empty => username available
      return !(Array.isArray(data) && data.length > 0);
    } catch (err) {
      console.error("Username check error:", err);
      return false;
    }
  };

  const handleSignUp = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Check username availability in profiles table now
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
        is_supplier: form.isSupplier,
        role: form.isSupplier ? "supplier" : "customer",
        phone: form.isSupplier ? form.phoneNumber : null,
        address: form.isSupplier ? form.address : null,
        bank_account_number: form.isSupplier ? form.bankAccountNumber : null,
        bank_name: form.isSupplier ? form.bankName : null,
      };

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: userMetadata,
        },
      });

      if (error) throw error;
      if (data) {
        router.push("/sign-in");
      }
      setSuccess(
        "Account created successfully! Please check your email to confirm your account."
      );
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message || "Sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Move from step 1 -> next (either step 2 or sign up directly if not supplier)
  const handleNext = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateBasicFields()) return;

    if (form.isSupplier) {
      setDirection(1);
      setStep(2);
      // do not submit yet - supplier info required
    } else {
      // Not a supplier -> submit immediately using the existing sign-up flow
      await handleSignUp();
    }
  };

  const handleBackToBasic = (e) => {
    if (e) e.preventDefault();
    setDirection(-1);
    setStep(1);
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
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  // animation variants for sliding steps
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway bg-white">
      {/* Left Side Image / Auth Banner */}
      <div className="hidden md:flex md:w-1/2 relative">
        <Image
          src="/auth.png"
          alt="Sign up background"
          fill
          priority
          className="object-contain md:object-cover"
        />
      </div>

      {/* Right Side Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 md:p-10 space-y-6 relative overflow-hidden">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center">
            <Image
              src="/assets/Mostore Logo Icon.png"
              width={80}
              height={80}
              alt="Logo"
              priority
            />
          </div>

          {/* Header / Auth Banner inside form */}
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Start your journey with us
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 text-sm text-center p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 bg-green-50 border border-green-200 text-sm text-center p-3 rounded-md">
              {success}
            </div>
          )}

          {/* Animated Multi-step Form */}
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
                  {/* Basic Fields (same as original) */}
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Supplier Toggle */}
                  <div className="border-t pt-4">
                    <div className="flex items-center">
                      <input
                        id="isSupplier"
                        name="isSupplier"
                        type="checkbox"
                        checked={form.isSupplier}
                        onChange={handleSupplierToggle}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isSupplier"
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        I want to become a supplier on Mostore
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Sell your products on our platform
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200"
                  >
                    {isLoading
                      ? form.isSupplier
                        ? "Creating Supplier Account..."
                        : "Creating Account..."
                      : form.isSupplier
                        ? "Next"
                        : "Create Account"}
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
                  onSubmit={handleSignUp}
                  className="space-y-5"
                >
                  {/* Supplier Fields (exactly as original) */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-md border">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
                      Supplier Information
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
                        required={form.isSupplier}
                        placeholder="+1 234 567 8900"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Complete Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required={form.isSupplier}
                        placeholder="123 Main Street, New York, NY 10001, USA"
                        rows="3"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                        required={form.isSupplier}
                        placeholder="Bank of America"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                        required={form.isSupplier}
                        placeholder="1234567890"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    {/* Terms Acceptance */}
                    <div className="flex items-start space-x-2">
                      <input
                        id="acceptedTerms"
                        name="acceptedTerms"
                        type="checkbox"
                        checked={form.acceptedTerms}
                        onChange={handleChange}
                        required={form.isSupplier}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5"
                      />
                      <div className="text-xs text-gray-700">
                        I accept the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-primary hover:underline font-medium"
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
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200"
                    >
                      {isLoading
                        ? "Creating Supplier Account..."
                        : "Create Supplier Account"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="text-primary hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal />
    </div>
  );
};

export default SignUpPage;
