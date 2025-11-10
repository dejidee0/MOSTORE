// app/products/ProductsContentWrapper.jsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductsContent from "./ProductContent";

export default function ProductsContentWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductsContentInner />
    </Suspense>
  );
}

function ProductsContentInner() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("q") || "";

  return (
    <ProductsContent categoryParam={categoryParam} searchQuery={searchQuery} />
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      Loading products...
    </div>
  );
}
