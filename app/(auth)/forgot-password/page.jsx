"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "@/lib/auth"; // Adjust import path
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    const result = await sendPasswordResetEmail(email);

    if (result.success) {
      setSuccess("Password reset instructions have been sent to your email.");
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="hidden md:flex md:w-1/2 relative">
        <Image
          src="/auth.png"
          alt="Forgot password background"
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
              Forgot Password?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email to receive reset instructions
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200 font-medium"
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </motion.button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="inline-flex items-center text-sm text-orange-500 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
