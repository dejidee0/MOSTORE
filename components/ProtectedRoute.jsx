"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase-client";
import {
  useCurrentUser,
  useCurrentVendor,
  useCurrentAdmin,
} from "@/hooks/use-auth";

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
  const role = user?.user_metadata?.role;

  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useCurrentVendor({ userId });

  const {
    data: admin,
    isLoading: adminLoading,
    error: adminError,
  } = useCurrentAdmin({ userId });

  const profile = role === "admin" ? admin : vendor;
  const isLoading = userLoading || vendorLoading || adminLoading;

  /** =======================
   * Error Handling
   ======================= */
  if (userError || vendorError || adminError) {
    console.error(userError, vendorError, adminError);
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

    if (!user) {
      if (pathname !== "/sign-in") {
        router.push("/sign-in");
      }
      return;
    }

    if (!profile) return;

    const profileRole = profile.role || "customer";

    if (!profile.is_active && profile.has_approved) {
      router.push("/supplier/account-disabled");
      return;
    }

    if (!profile.has_approved && !profile.is_active) {
      router.push("/supplier/account-pending");
      return;
    }

    if (allowedRoles.length && !allowedRoles.includes(profileRole)) {
      router.push("/");
    }
  }, [isLoading, user, profile, pathname, router, allowedRoles]);

  /** =======================
   * Access Check
   ======================= */
  const hasAccess =
    user &&
    profile &&
    profile.is_active &&
    profile.has_approved &&
    (allowedRoles.length === 0 ||
      allowedRoles.includes(profile.role || "customer"));

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
