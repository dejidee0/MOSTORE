"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore"; // Adjust path as needed

// Hook to protect routes that require authentication
export function useAuthGuard(redirectTo = "/sign-in") {
  const router = useRouter();
  const { isAuthenticated, loading, initialized } = useUserStore();

  useEffect(() => {
    // Wait for store to be initialized
    if (!initialized) return;

    // If not loading and not authenticated, redirect
    if (!loading && !isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, initialized, router, redirectTo]);

  return {
    isAuthenticated: isAuthenticated(),
    loading,
    initialized,
  };
}

// Hook to redirect authenticated users away from auth pages
export function useGuestGuard(redirectTo = "/") {
  const router = useRouter();
  const { isAuthenticated, loading, initialized } = useUserStore();

  useEffect(() => {
    // Wait for store to be initialized
    if (!initialized) return;

    // If not loading and authenticated, redirect
    if (!loading && isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, initialized, router, redirectTo]);

  return {
    isAuthenticated: isAuthenticated(),
    loading,
    initialized,
  };
}

// Component wrapper for protected routes
export function ProtectedRoute({
  children,
  fallback = null,
  redirectTo = "/sign-in",
}) {
  const { isAuthenticated, loading, initialized } = useAuthGuard(redirectTo);

  // Show loading state while initializing
  if (!initialized || loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return children;
}

// Component wrapper for guest-only routes (like sign-in, sign-up)
export function GuestRoute({ children, fallback = null, redirectTo = "/" }) {
  const { isAuthenticated, loading, initialized } = useGuestGuard(redirectTo);

  // Show loading state while initializing
  if (!initialized || loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (isAuthenticated) {
    return null;
  }

  return children;
}

// Utility hook to get user info
export function useUser() {
  const {
    user,
    session,
    loading,
    isAuthenticated,
    getUserEmail,
    getUserId,
    getUserMetadata,
  } = useUserStore();

  return {
    user,
    session,
    loading,
    isAuthenticated: isAuthenticated(),
    email: getUserEmail(),
    id: getUserId(),
    metadata: getUserMetadata(),
  };
}
