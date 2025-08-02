"use client";
import { useEffect } from "react";
import useUserStore from "@/lib/stores/useUserStore"; // Adjust path as needed

export default function AuthProvider({ children }) {
  const { initialize, initialized, cleanup } = useUserStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initialize, initialized, cleanup]);

  return children;
}

// Alternative: Hook version if you prefer
