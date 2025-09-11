"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAllCategories } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";
import Hero from "@/components/Hero";
import ScrollingBanner from "@/components/shared/Hero/ScrollingBanner";
import ServiceFeatures from "@/components/shared/Home/ServiceFeature";
import CategoriesSection from "@/components/shared/Home/CategoriesSection";
import FeaturedBanners from "@/components/shared/Home/FeaaturedBanners";
import AutomotiveHeroSection from "@/components/shared/Home/AutomotiveHeroSection";
import BusinessPartners from "@/components/shared/Home/BrandSection";
import { FaWhatsapp } from "react-icons/fa";

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
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

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

  // Toggle WhatsApp box visibility
  const toggleWhatsApp = () => {
    setIsWhatsAppOpen(!isWhatsAppOpen);
  };

  // Motion variants for cleaner animation
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.1 },
    }),
  };

  // WhatsApp box animation variants
  const whatsappBoxVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      width: 64,
      height: 64,
      borderRadius: "9999px",
    },
    visible: {
      opacity: 1,
      scale: 1,
      width: 280,
      height: 160,
      borderRadius: "12px",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Bouncy animation for the WhatsApp button (two keyframes)
  const bouncyButtonVariants = {
    idle: {
      y: [0, -8],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 0.7,
          ease: "easeInOut",
          type: "spring",
          stiffness: 120,
          damping: 15,
        },
      },
    },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
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
            className="mb-8"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Featured <span className="text-orange-500">Products</span>
            </h2>
          </motion.div>
          <ProductGrid />
        </div>
      </section>
      <ProductShowcaseSection />
      <ProductSections />
      <AutomotiveHeroSection />
      <BusinessPartners />
      <BlogLandingSection />

      <div className="fixed bottom-8 right-8 z-[1000]">
        {/* WhatsApp Icon Button (always visible) */}
        <motion.button
          onClick={toggleWhatsApp}
          variants={bouncyButtonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          animate="idle"
          className="w-10 h-10 bg-green-500 text-white flex items-center justify-center rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          aria-label={
            isWhatsAppOpen ? "Close WhatsApp chat" : "Open WhatsApp chat"
          }
        >
          <FaWhatsapp className="w-6 h-6" />
        </motion.button>

        {/* WhatsApp Expanded Box */}
        <AnimatePresence>
          {isWhatsAppOpen && (
            <motion.div
              key="whatsappBox"
              variants={whatsappBoxVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-green-600 shadow-2xl overflow-hidden mt-4 rounded-xl"
            >
              <div className="p-4 flex flex-col items-center justify-center h-full bg-green-600">
                <h3 className="text-white font-semibold text-lg mb-3">
                  Need Help?
                </h3>
                <a
                  href="https://wa.me/+33753602218?text=Hello%20I%20would%20like%20to%20chat%20with%20a%20live%20person"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-green-600 font-semibold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
                >
                  Chat with a live person
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
