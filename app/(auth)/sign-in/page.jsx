"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore";
import Image from "next/image";

const SignInPage = () => {
  const router = useRouter();

  // Zustand store
  const {
    signIn,
    signInWithOAuth,
    resetPassword,
    loading,
    isAuthenticated,
    user,
    initialized,
    initialize,
  } = useUserStore();

  // Local form state
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the store if not already initialized
  useEffect(() => {
    if (!initialized) {
      console.log("Initializing user store...");
      initialize();
    }
  }, [initialized, initialize]);

  // Handle authentication redirect
  // In your SignInPage.js, modify the auth check useEffect:
  useEffect(() => {
    console.log("Auth check:", {
      initialized,
      loading,
      isAuth: isAuthenticated(),
      hasUser: !!user,
    });

    if (initialized && !loading && isAuthenticated() && user) {
      const role = user.user_metadata?.role || "customer";
      console.log("User role detected:", role);

      switch (role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "supplier":
          router.push("/supplier/dashboard");
          break;
        default: // customer
          router.push("/");
      }
    }
  }, [user, isAuthenticated, router, initialized, loading]);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    if (isSubmitting || loading) {
      console.log("Already submitting or loading, skipping...");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      console.log("Attempting sign in with:", { email: form.email });
      const { data, error: signInError } = await signIn(
        form.email,
        form.password
      );

      if (signInError) {
        console.error("Sign in error:", signInError);
        setError(signInError.message || "Sign-in failed. Please try again.");
      } else if (data?.user) {
        console.log("Sign in successful, user:", data.user.email);

        // Store remember me preference if needed
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        // Don't manually redirect - let the useEffect handle it
        // The auth state change will trigger the redirect
      }
    } catch (err) {
      console.error("Unexpected sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Please enter your email address first.");
      return;
    }

    if (isSubmitting || loading) return;

    setError("");
    setIsSubmitting(true);

    try {
      const { error: resetError } = await resetPassword(form.email);

      if (resetError) {
        setError(resetError.message || "Failed to send password reset email.");
      } else {
        setError("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to send password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isDisabled = loading || isSubmitting;

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway">
      {/* Left Side Image */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth.png')" }}
      ></div>

      {/* Right Side Form */}
      <div className="flex flex-col md:flex-row w-full md:w-1/2 items-center justify-center p-8">
        <div className="md:hidden flex justify-center py-6">
          <Image
            src="/assets/Mostore Logo Icon.png"
            width={80}
            height={80}
            alt="Logo"
            priority
          />
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-6 text-center">Sign In</h2>
          {error && (
            <div
              className={`text-sm text-center mb-4 p-3 rounded-md ${
                error.includes("sent")
                  ? "text-green-600 bg-green-50 border border-green-200"
                  : "text-red-600 bg-red-50 border border-red-200"
              }`}
            >
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSignIn}>
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isDisabled}
              />
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
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isDisabled}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isDisabled}
                />
                <label htmlFor="remember" className="text-gray-600">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={isDisabled}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center"
            >
              {isDisabled ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          {/* Google Sign In Button */}\{/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/sign-up")}
                className="text-blue-600 hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={isDisabled}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
