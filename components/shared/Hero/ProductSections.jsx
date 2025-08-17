import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ScrollableSection } from "./ScrollableSection";
import { SectionHeader } from "./SectionHeader";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import {
  dealOfTheDayProduct,
  recentlyAddedProducts,
} from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";

export default function ProductSections() {
  const [dealProduct, setDealProduct] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [deal, recent] = await Promise.all([
          dealOfTheDayProduct(),
          recentlyAddedProducts(),
        ]);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/50">
      <div className="max-7xl mx-auto px-6 py-8 space-y-6">
        {/* Deal of the Day Section */}

        {/* Recently Added Section */}
        <section className="max-w-7xl mx-auto">
          <h2 className="text-xl lg:text-3xl font-black mb-6">
            Recently <span className="text-orange-500">Added</span>
          </h2>

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
