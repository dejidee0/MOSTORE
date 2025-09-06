// app/(user)/checkout/page.js
"use client";

import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

// Loading component for the suspense boundary
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
        <span className="text-sm text-gray-600">Loading checkout...</span>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
