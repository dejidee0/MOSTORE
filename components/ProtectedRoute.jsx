"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useUserStore from "@/lib/stores/useUserStore";
import { supabase } from "@/lib/supabase-client";

export default function ProtectedRoute({ allowedRoles, children }) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUserStore();

  const [profileStatus, setProfileStatus] = useState({
    loading: true,
    hasApproved: true,
    isActive: true,
    error: null,
  });

  // Fetch profile status
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user?.id || loading) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_approved, has_approved, role")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          console.error("Error fetching profile status:", error);
          setProfileStatus({
            loading: false,
            isActive: false,
            hasApproved: false,
            error: "Failed to verify account status",
          });
          return;
        }

        const isActive = profile.is_approved !== false;

        setProfileStatus({
          loading: false,
          isActive,
          hasApproved: profile.has_approved,
          error: null,
        });

        if (!isActive && profile.has_approved) {
          router.push("/supplier/account-disabled");
        } else if (!profile.has_approved && !isActive) {
          router.push("/supplier/account-pending");
        }
      } catch (err) {
        console.error("Profile status check error:", err);
        setProfileStatus({
          loading: false,
          isActive: false,
          hasApproved: false,
          error: "Account verification failed",
        });
      }
    };

    checkProfileStatus();
  }, [user, loading, router]);

  // Subscribe to profile changes
  // Subscribe to profile changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-status-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new;
          const isActive = updated.is_approved !== false;
          const hasApproved = updated.has_approved;

          setProfileStatus((prev) => ({
            ...prev,
            isActive,
            hasApproved,
          }));

          if (!isActive && hasApproved) {
            router.push("/supplier/account-disabled");
          } else if (!hasApproved && !isActive) {
            router.push("/supplier/account-pending");
          }
        } // ✅ This closing brace was missing
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, router]);

  // Navigation logic
  useEffect(() => {
    if (loading || profileStatus.loading || !isAuthenticated()) {
      return;
    }

    const role = user?.user_metadata?.role || "customer";
    const pathname = window.location.pathname;

    // Save last visited dashboard subpage
    if (pathname.startsWith("/admin/dashboard/")) {
      localStorage.setItem("lastDashboardSubpage", pathname);
    }

    // Restore last dashboard subpage
    if (pathname === "/admin/dashboard") {
      const lastSubpage = localStorage.getItem("lastDashboardSubpage");
      if (lastSubpage && lastSubpage.startsWith("/admin/dashboard/")) {
        router.replace(lastSubpage);
        return;
      }
    }

    // Route restrictions
    if (!isAuthenticated()) {
      if (pathname !== "/sign-in") {
        router.push("/sign-in");
      }
    } else if (!profileStatus.isActive && profileStatus.hasApproved) {
      router.push("/supplier/account-disabled");
    } else if (!profileStatus.hasApproved && !profileStatus.isActive) {
      router.push("/supplier/account-pending");
    } else if (!allowedRoles.includes(role)) {
      if (pathname !== "/") {
        router.push("/");
      }
    }
  }, [user, loading, isAuthenticated, profileStatus, allowedRoles, router]);

  // Loading or unauthorized
  if (
    loading ||
    profileStatus.loading ||
    !isAuthenticated() ||
    !profileStatus.isActive ||
    !profileStatus.hasApproved ||
    !allowedRoles.includes(user?.user_metadata?.role || "customer")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          {profileStatus.error && (
            <p className="text-red-600 mt-4">{profileStatus.error}</p>
          )}
          {!profileStatus.isActive &&
            !profileStatus.hasApproved &&
            !profileStatus.loading && (
              <p className="text-red-600 mt-4">Account has been disabled</p>
            )}
        </div>
      </div>
    );
  }

  return children;
}
