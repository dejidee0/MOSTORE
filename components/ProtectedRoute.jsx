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

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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
          setIsInitialized(true);
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
          setIsRedirecting(true);
          router.push("/supplier/account-disabled");
        } else if (!profile.has_approved && !isActive) {
          setIsRedirecting(true);
          router.push("/supplier/account-pending");
        } else {
          setIsInitialized(true);
        }
      } catch (err) {
        console.error("Profile status check error:", err);
        setProfileStatus({
          loading: false,
          isActive: false,
          hasApproved: false,
          error: "Account verification failed",
        });
        setIsInitialized(true);
      }
    };

    checkProfileStatus();
  }, [user, loading, router]);

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
            setIsRedirecting(true);
            router.push("/supplier/account-disabled");
          } else if (!hasApproved && !isActive) {
            setIsRedirecting(true);
            router.push("/supplier/account-pending");
          }
        }
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
        setIsRedirecting(true);
        router.push("/sign-in");
      }
    } else if (!profileStatus.isActive && profileStatus.hasApproved) {
      if (pathname !== "/supplier/account-disabled") {
        setIsRedirecting(true);
        router.push("/supplier/account-disabled");
      }
    } else if (!profileStatus.hasApproved && !profileStatus.isActive) {
      if (pathname !== "/supplier/account-pending") {
        setIsRedirecting(true);
        router.push("/supplier/account-pending");
      }
    } else if (!allowedRoles.includes(role)) {
      if (pathname !== "/") {
        setIsRedirecting(true);
        router.push("/");
      }
    }
  }, [user, loading, isAuthenticated, profileStatus, allowedRoles, router]);

  // Check if user should have access
  const hasAccess = () => {
    if (!isAuthenticated() || !user) return false;
    if (!profileStatus.isActive) return false;
    if (!profileStatus.hasApproved) return false;

    const role = user?.user_metadata?.role || "customer";
    return allowedRoles.includes(role);
  };

  // Show loading state until fully initialized and checks pass
  if (
    loading ||
    profileStatus.loading ||
    isRedirecting ||
    !isInitialized ||
    !hasAccess()
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>

          {profileStatus.error && (
            <p className="text-red-600 mt-4">{profileStatus.error}</p>
          )}
        </div>
      </div>
    );
  }

  return children;
}
