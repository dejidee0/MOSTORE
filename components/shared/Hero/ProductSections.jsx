"use client";

import React, { useEffect, useState } from "react";
import { recentlyAddedProducts } from "@/lib/data/products";
import ProductsGrid from "./ProductsGrid";

export default function ProductSections() {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const recent = await recentlyAddedProducts();
        setRecentProducts(recent);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-max bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 space-y-6 py-6">
        {/* Recently Added Section */}
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col">
            <h2 className="text-2xl lg:text-3xl font-black mb-0">
              Recently <span className="text-orange-500">Added</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base m-0 leading-tight">
              Don't miss out on this week's deals
            </p>
          </div>
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="min-w-[150px] h-64 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ProductsGrid products={recentProducts} />
          )}
        </section>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
