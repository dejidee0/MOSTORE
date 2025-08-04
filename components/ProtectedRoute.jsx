"use client";

import { useEffect } from "react";
import useUserStore from "@/lib/stores/useUserStore"; // Adjust import path as needed

const ADMIN_EMAIL = "aboderindaniel4@gmail.com";

export function ProtectedRoute({
  children,
  fallback = null,
  redirectTo = "/sign-in",
  adminOnly = false,
}) {
  const { user, loading, initialized, isAuthenticated, initialize } =
    useUserStore();

  // Initialize the auth store when component mounts
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Debug logging - remove in production
  console.log("ProtectedRoute Debug:", {
    isAuthenticated: isAuthenticated(),
    loading,
    initialized,
    userEmail: user?.email,
    adminOnly,
    currentTime: new Date().toISOString(),
  });

  // Show loading state while initializing
  if (!initialized || loading) {
    console.log("Showing loading state:", { initialized, loading });
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">
              Loading... (initialized: {initialized ? "✓" : "✗"}, loading:{" "}
              {loading ? "✓" : "✗"})
            </p>
          </div>
        </div>
      )
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
    return null;
  }

  // Check if admin access is required and user is not admin
  if (adminOnly && user?.email !== ADMIN_EMAIL) {
    console.log("Access denied for user:", user?.email);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600 mb-4">
            You don't have permission to access this page.
          </p>

          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mr-2"
          >
            Go Back
          </button>
          <button
            onClick={() => (window.location.href = "/sign-in")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  console.log("Access granted, rendering children");
  return children;
}
