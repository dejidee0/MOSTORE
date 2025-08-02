"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
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

  // Check if username is available
  const checkUsernameAvailability = async (username) => {
    try {
      const { data, error } = await supabase.rpc("is_username_available", {
        username_to_check: username,
      });

      if (error) throw error;
      return data; // Returns true if available, false if taken
    } catch (error) {
      console.error("Username check error:", error);
      return false;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Check if username is available
      const isUsernameAvailable = await checkUsernameAvailability(
        form.username
      );
      if (!isUsernameAvailable) {
        setError("Username is already taken. Please choose another one.");
        return;
      }

      // Sign up the user - the database function will automatically create the profile
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            username: form.username,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          // User is automatically confirmed
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 2000);
        } else {
          // Email confirmation required
          setSuccess(
            "Account created successfully! Please check your email to confirm your account before signing in."
          );
        }
      }
    } catch (error) {
      console.error("Sign-up error:", error);

      // Handle specific error cases
      if (error.message.includes("Email rate limit exceeded")) {
        setError(
          "Too many signup attempts. Please wait a moment and try again."
        );
      } else if (error.message.includes("User already registered")) {
        setError(
          "An account with this email already exists. Please sign in instead."
        );
      } else {
        setError(error.message || "Sign-up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      setError(error.message || "Google sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-screen flex flex-col md:flex-row font-raleway bg-white">
      {/* Left Side Image */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth.png')" }}
      ></div>

      {/* Right Side Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 md:p-10 space-y-6">
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

          {/* Header */}
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

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSignUp}>
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
                Must be at least 6 characters long
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

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
    </div>
  );
};

export default SignUpPage;
