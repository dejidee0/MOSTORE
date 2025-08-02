"use client";
import React, { useEffect, useState } from "react";
import CategoryMenu from "@/components/CategoryMenu";
import Hero from "@/components/Hero";
import PromoBanner from "@/components/PromoBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import BlogSection from "@/components/BlogSection";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Optional Category Menu - Uncomment if needed */}
      {/* <CategoryMenu /> */}

      <main
        className={`relative transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Hero Section */}
        <section className="relative">
          <Hero />
        </section>

        {/* Content Sections Container */}
        <div className="relative bg-white">
          {/* Promo Banner Section */}
          <section className="relative py-8 lg:py-12 animate-fade-in-up">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <PromoBanner />
            </div>
          </section>

          {/* Category Grid Section */}
          <section className="relative py-12 lg:py-20 animate-fade-in-up animation-delay-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-gray-900 mb-4 animate-fade-in-up">
                  Shop by Category
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
                  Discover our curated collection of premium products across all
                  categories
                </p>
              </div>
              <CategoryGrid />
            </div>
          </section>

          {/* Product Grid Section */}
          <section className="relative py-12 lg:py-20 bg-gray-50 animate-fade-in-up animation-delay-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-gray-900 mb-4 animate-fade-in-up">
                  Featured Products
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
                  Handpicked selections from our latest and most popular items
                </p>
              </div>
              <ProductGrid />
            </div>
          </section>

          {/* Blog Section */}
          <section className="relative py-12 lg:py-20 animate-fade-in-up animation-delay-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-gray-900 mb-4 animate-fade-in-up">
                  Latest Stories
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
                  Insights, trends, and inspiration from the world of premium
                  electronics
                </p>
              </div>
              <BlogSection />
            </div>
          </section>

          {/* Newsletter/CTA Section */}
          <section className="relative py-16 lg:py-24 bg-black animate-fade-in-up animation-delay-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white mb-6 animate-fade-in-up">
                Stay In The Loop
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
                Be the first to know about new arrivals, exclusive offers, and
                premium content
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto animate-fade-in-up animation-delay-200">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 text-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
                />
                <button className="px-8 py-4 bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95">
                  Subscribe
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        /* Initially hide animated elements */
        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(60px);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
