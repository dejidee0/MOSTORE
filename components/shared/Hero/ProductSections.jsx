import React, { useEffect, useState } from "react";

import { recentlyAddedProducts } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";

export default function ProductSections() {
  const [dealProduct, setDealProduct] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [deal, recent] = await Promise.all([recentlyAddedProducts()]);

        setDealProduct(deal);
        setRecentProducts(recent);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 space-y-3 py-6">
        {/* Deal of the Day Section */}

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
          {loading ? (
            <div className="flex gap-4 overflow-x-auto py-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="min-w-[250px] h-64 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ProductGrid products={recentProducts} />
          )}
        </section>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
