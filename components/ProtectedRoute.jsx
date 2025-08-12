"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useUserStore from "@/lib/stores/useUserStore";

export default function ProtectedRoute({ allowedRoles, children }) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!loading) {
      const role = user?.user_metadata?.role || "customer";

      if (!isAuthenticated()) {
        router.push("/sign-in");
      } else if (!allowedRoles.includes(role)) {
        router.push("/"); // Redirect to home if not authorized
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router]);

  if (
    loading ||
    !isAuthenticated() ||
    !allowedRoles.includes(user?.user_metadata?.role || "customer")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return children;
}
