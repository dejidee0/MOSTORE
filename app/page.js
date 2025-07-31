import React from "react";
import CategoryMenu from "@/components/CategoryMenu";
import Hero from "@/components/Hero";
import PromoBanner from "@/components/PromoBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import BlogSection from "@/components/BlogSection";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full  overflow-hidden font-raleway">
      <CategoryMenu />
      <main>
        <Hero />
        <PromoBanner />
        <CategoryGrid />
        <ProductGrid />
        <BlogSection />   
      </main>
    </div>
  );
};

export default HomePage;
