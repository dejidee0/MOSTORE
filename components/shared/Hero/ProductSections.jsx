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
      <div className="container mx-auto px-6 py-16 space-y-24">
        {/* Deal of the Day Section */}
        <section className="relative py-8 overflow-hidden bg-gray-900 -mx-6 md:-mx-8 lg:-mx-12">
          <div className="w-full flex flex-col md:flex-row items-center gap-8 px-0">
            {/* LEFT: Announcement */}
            <div className="flex-1 relative flex flex-col items-center justify-center text-center p-6">
              <div className="ripple-circle"></div>
              <div className="ripple-circle"></div>
              <div className="ripple-circle"></div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(255,115,0,0.8)]">
                🚨 DEAL OF THE DAY 🚨
              </h1>

              <div className="mt-6 flex items-center gap-3">
                {["01", "23", "45"].map((num, i) => (
                  <React.Fragment key={i}>
                    <div className="bg-orange-500 text-white rounded-lg px-4 py-2 text-lg font-bold shadow-lg">
                      {num}
                    </div>
                    {i < 2 && (
                      <span className="text-orange-400 text-2xl font-extrabold">
                        :
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="mt-4 text-orange-200 max-w-md">
                Snag this limited-time offer while it lasts! Once the clock hits
                zero, it’s gone forever.
              </p>
            </div>

            {/* RIGHT: Product Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex-1 flex justify-center"
            >
              <div className="relative group w-full max-w-sm">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>

                {/* Product Card or Skeleton */}
                <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
                  {loading ? (
                    <div className="bg-gray-800 rounded-2xl h-96 animate-pulse" />
                  ) : (
                    <ProductCard product={dealProduct} />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recently Added Section */}
        <section>
          <SectionHeader
            icon={Clock}
            title="Recently Added"
            subtitle="Fresh arrivals just for you"
          />

          {loading ? (
            <div className="flex gap-4 overflow-x-auto py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[250px] h-64 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ScrollableSection products={recentProducts} delay={0.2} />
          )}
        </section>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
