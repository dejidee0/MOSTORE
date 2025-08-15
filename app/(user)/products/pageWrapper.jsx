"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react"; // nice animated loader

export default function ProductsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-purple-600">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-medium">Loading products...</p>
        </div>
      }
    >
      <ProductsPage />
    </Suspense>
  );
}
