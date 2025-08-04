// app/(user)/products/ProductsPageWrapper.js
"use client";

import { Suspense } from "react";
import ProductsPage from "./page";

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
