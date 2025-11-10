// app/products/ProductsContentWrapper.jsx
"use client";

import { useSearchParams } from "next/navigation";
import ProductsContent from "./ProductContent";

export default function ProductsContentWrapper() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("q") || "";

  return (
    <ProductsContent categoryParam={categoryParam} searchQuery={searchQuery} />
  );
}
