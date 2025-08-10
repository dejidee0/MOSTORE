import React from "react";
import { ProductCard } from "@/components/ProductCard";
import { GridSection } from "./GridSection";
import { ScrollableSection } from "./ScrollableSection";
import { SectionHeader } from "./SectionHeader";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Clock } from "lucide-react";
import { TrendingUp } from "lucide-react";
import {
  dealOfTheDayProduct,
  recentlyAddedProducts,
  trendingProducts,
} from "@/lib/data/products";

export default function ProductSections() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/50">
      <div className="container mx-auto px-6 py-16 space-y-24">
        {/* Deal of the Day Section */}
        {/* Deal of the Day Section - Full Bleed */}
        <section className="relative py-8 overflow-hidden bg-gray-900 -mx-6 md:-mx-8 lg:-mx-12">
          <div className="w-full flex flex-col md:flex-row items-center gap-8 px-0">
            {/* LEFT: Bold Announcement */}
            <div className="flex-1 relative flex flex-col items-center justify-center text-center p-6">
              {/* Ripples */}
              <div className="ripple-circle"></div>
              <div className="ripple-circle"></div>
              <div className="ripple-circle"></div>

              {/* Glowing Text */}
              <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(255,115,0,0.8)]">
                🚨 DEAL OF THE DAY 🚨
              </h1>

              {/* Countdown */}
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

              {/* Subtext */}
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
                {/* Glowing Gradient Border */}
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>

                {/* Product Card */}
                <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
                  <ProductCard product={dealOfTheDayProduct} />
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

          <ScrollableSection products={recentlyAddedProducts} delay={0.2} />
        </section>

        {/* Trending Products Section */}
        <section>
          <SectionHeader
            icon={TrendingUp}
            title="Trending Products"
            subtitle="What everyone's talking about"
          />

          <GridSection products={trendingProducts} delay={0.2} />
        </section>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
