"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore";

export function AuthInitializer({ children }) {
  const { initialize, initialized, user, session } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      console.log("Initializing auth store...");
      initialize();
    }
  }, [initialize, initialized]);

  useEffect(() => {
    if (session && user) {
      const role = user?.user_metadata?.role || "customer";
      const currentPath = window.location.pathname;

      const validPaths = {
        admin: ["/admin/dashboard/products", "/admin/dashboard/products"],
        supplier: ["/supplier/dashboard", "/supplier/dashboard/"],
        customer: ["/"],
      };

      const isValidPath = validPaths[role].some((path) =>
        currentPath.startsWith(path)
      );

      if (!isValidPath) {
        const redirectTo = {
          admin: "/admin/dashboard/products",
          supplier: "/supplier/dashboard",
          customer: "/",
        }[role];
        router.push(redirectTo);
      }
    }
  }, [user, session, router]);

  return children;
}
