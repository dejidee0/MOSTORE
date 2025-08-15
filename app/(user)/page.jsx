"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Car,
  Bike,
  Wrench,
  Smartphone,
  Monitor,
  Package,
  Battery,
  Shield,
  ChevronRight,
  Award,
  Users,
  Truck,
} from "lucide-react";
import { getAllCategories } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";
import Hero from "@/components/Hero";
import ScrollingBanner from "@/components/shared/Hero/ScrollingBanner";
import ServiceFeatures from "@/components/shared/Home/ServiceFeature";
import CategoriesSection from "@/components/shared/Home/CategoriesSection";
import FeaturedBanners from "@/components/shared/Home/FeaaturedBanners";

// Lazy-load heavy sections
const ProductShowcaseSection = dynamic(() =>
  import("@/components/shared/Hero/ProductShowCase")
);
const ProductSections = dynamic(() =>
  import("@/components/shared/Hero/ProductSections")
);
const BlogLandingSection = dynamic(() =>
  import("@/components/shared/Home/Blog")
);

const HomePage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getAllCategories();
        console.log(data);
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Helpers (memoized)

  // Motion variants for cleaner animation
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.1 },
    }),
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <Hero />
      <ServiceFeatures />

      {/* Featured banners */}
      <FeaturedBanners />

      <ScrollingBanner />
      <CategoriesSection
        categories={categories}
        categoriesLoading={categoriesLoading}
      />
      {/* Featured Products */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className=" mb-8"
          >
            <h2 className="text-4xl lg:text-2xl font-black text-gray-900 mb-2">
              Featured <span className="text-orange-500">Products</span>
            </h2>
          </motion.div>
          <ProductGrid />
        </div>
      </section>
      <ProductShowcaseSection />
      <ProductSections />

      {/* Trust Section */}
      <section className="py-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-4xl font-black mb-8">
            Trusted by 50,000+ Customers
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of satisfied customers who trust MOSTORE for premium
            quality and exceptional service
          </p>
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {[
              {
                icon: Shield,
                title: "Secure Shopping",
                desc: "256-bit SSL encryption",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Free shipping on orders €50+",
              },
              {
                icon: Award,
                title: "Quality Guarantee",
                desc: "30-day return policy",
              },
              {
                icon: Users,
                title: "Expert Support",
                desc: "24/7 customer service",
              },
            ].map((f, i) => (
              <div key={i}>
                <f.icon className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="opacity-75">{f.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/products")}
            className="bg-white text-orange-600 px-12 py-4 rounded-full font-bold text-lg hover:bg-gray-100 shadow-2xl"
          >
            Start Shopping Now
          </button>
        </div>
      </section>

      <BlogLandingSection />

      {/* Newsletter */}
      <section className="py-10 bg-gray-900 text-white text-center">
        <h2 className="text-xl lg:text-3xl font-black mb-6">
          Stay Updated with <span className="text-orange-500">MOSTORE</span>
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Get exclusive deals, new arrivals, and expert insights delivered to
          your inbox
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-6 py-4 text-lg bg-white text-gray-900 rounded-full focus:ring-4 focus:ring-orange-500/50"
          />
          <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full font-bold">
            Subscribe
          </button>
        </div>
        <p className="text-sm text-gray-400">
          Join 10,000+ subscribers. Unsubscribe anytime.
        </p>
      </section>
    </div>
  );
};

export default React.memo(HomePage);
