import React from "react";
import CategoryMenu from "@/components/CategoryMenu";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import NavBar from "@/components/NavBar";
import TopBar from "@/components/TopBar";
import PromoBanner from "@/components/PromoBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import BlogSection from "@/components/BlogSection";
import NewsletterForm from "@/components/NewsletterForm";


const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full  overflow-hidden">
      <TopBar />
      <NavBar />
      <CategoryMenu />

      <main>
        <Hero />
        <PromoBanner />
        <CategoryGrid />
        <ProductGrid />
        <BlogSection />
        <NewsletterForm />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
