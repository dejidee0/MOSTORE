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
    isActive: true,
    error: null,
  });

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user?.id || loading) {
        setProfileStatus({ loading: true, isActive: true, error: null });
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_approved, role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile status:", error);
          setProfileStatus({
            loading: false,
            isActive: false,
            error: "Failed to verify account status",
          });
          return;
        }

        const isActive = profile?.is_approved !== false;
        setProfileStatus({
          loading: false,
          isActive: isActive,
          error: null,
        });

        if (!isActive) {
          router.push("/supplier/account-disabled");
          return;
        }
      } catch (error) {
        console.error("Profile status check error:", error);
        setProfileStatus({
          loading: false,
          isActive: false,
          error: "Account verification failed",
        });
      }
    };

    if (user && !loading) {
      checkProfileStatus();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
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
          if (payload.new.is_approved === false) {
            setProfileStatus((prev) => ({ ...prev, isActive: false }));
            router.push("/supplier/account-disabled");
          } else if (payload.new.is_approved === true) {
            setProfileStatus((prev) => ({ ...prev, isActive: true }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, router]);

  useEffect(() => {
    if (!loading && !profileStatus.loading && isAuthenticated()) {
      const role = user?.user_metadata?.role || "customer";
      const pathname = window.location.pathname;

      // Store last dashboard subpage
      if (pathname.startsWith("/admin/dashboard/")) {
        localStorage.setItem("lastDashboardSubpage", pathname);
      }

      // Restore last subpage only for root dashboard
      if (pathname === "/admin/dashboard") {
        const lastSubpage = localStorage.getItem("lastDashboardSubpage");
        if (lastSubpage && lastSubpage.startsWith("/admin/dashboard/")) {
          router.replace(lastSubpage);
          return;
        }
      }

      if (!isAuthenticated()) {
        if (pathname !== "/sign-in") {
          router.push("/sign-in");
        }
      } else if (!profileStatus.isActive) {
        router.push("/supplier/account-disabled");
      } else if (!allowedRoles.includes(role)) {
        if (pathname !== "/") {
          router.push("/");
        }
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router, profileStatus]);
  console.log(user, profileStatus);
  if (
    loading ||
    profileStatus.loading ||
    !isAuthenticated() ||
    !profileStatus.isActive ||
    !allowedRoles.includes(user?.user_metadata?.role || "customer")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          {profileStatus.error && (
            <p className="text-red-600 mt-4">{profileStatus.error}</p>
          )}
          {!profileStatus.isActive && !profileStatus.loading && (
            <p className="text-red-600 mt-4">Account has been disabled</p>
          )}
        </div>
      </div>
    );
  }

  return children;
}
