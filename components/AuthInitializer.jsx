"use client";

import { useEffect } from "react";
import useUserStore from "@/lib/stores/useUserStore";

export function AuthInitializer({ children }) {
  const { initialize, initialized } = useUserStore();

  useEffect(() => {
    if (!initialized) {
      console.log("Initializing auth store...");
      initialize();
    }
  }, [initialize, initialized]);

  return children;
}
