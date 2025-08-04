"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export function AdminProtectionWrapper({ children }) {
  return <ProtectedRoute adminOnly={true}>{children}</ProtectedRoute>;
}
