"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase-client";
import { useCurrentUser, useCurrentVendor } from "@/hooks/use-auth";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const router = useRouter();
  const pathname = usePathname();

  /** =======================
   * Auth Queries
   ======================= */
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  const userId = user?.id;

  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useCurrentVendor({ userId });

  const isLoading = userLoading || vendorLoading;

  /** =======================
   * Error Handling
   ======================= */
  if (userError || vendorError) {
    throw new Error("Authentication failed");
  }

  /** =======================
   * Realtime Profile Updates
   ======================= */
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile-status-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new;

          if (!updated.is_active && updated.has_approved) {
            router.push("/supplier/account-disabled");
          }

          if (!updated.has_approved && !updated.is_active) {
            router.push("/supplier/account-pending");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  /** =======================
   * Navigation Guard
   ======================= */
  useEffect(() => {
    if (isLoading) return;

    // Not logged in
    if (!user) {
      if (pathname !== "/sign-in") {
        router.push("/sign-in");
      }
      return;
    }

    if (!vendor) return;

    const role = vendor.role || "customer";

    // Account disabled
    if (!vendor.is_active && vendor.has_approved) {
      router.push("/supplier/account-disabled");
      return;
    }

    // Account pending
    if (!vendor.has_approved && !vendor.is_active) {
      router.push("/supplier/account-pending");
      return;
    }

    // Role not allowed
    if (allowedRoles.length && !allowedRoles.includes(role)) {
      router.push("/");
    }
  }, [isLoading, user, vendor, pathname, router, allowedRoles]);

  /** =======================
   * Access Check
   ======================= */
  const hasAccess =
    user &&
    vendor &&
    vendor.is_active &&
    vendor.has_approved &&
    (allowedRoles.length === 0 ||
      allowedRoles.includes(vendor.role || "customer"));

  /** =======================
   * Loading State
   ======================= */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  /** =======================
   * Block Rendering
   ======================= */
  if (!hasAccess) return null;

  return children;
}
