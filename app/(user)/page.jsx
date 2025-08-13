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
  const getIconForCategory = useCallback((name) => {
    const lower = name.toLowerCase();
    if (lower.includes("vehicle") && lower.includes("mobility"))
      return <Car className="w-8 h-8" />;
    if (lower.includes("bike") || lower.includes("motorcycle"))
      return <Bike className="w-8 h-8" />;
    if (lower.includes("electric") || lower.includes("battery"))
      return <Battery className="w-8 h-8" />;
    if (lower.includes("electronics") || lower.includes("tech"))
      return <Smartphone className="w-8 h-8" />;
    if (lower.includes("appliance") || lower.includes("home"))
      return <Monitor className="w-8 h-8" />;
    if (
      lower.includes("parts") ||
      lower.includes("accessories") ||
      lower.includes("tool")
    )
      return <Wrench className="w-8 h-8" />;
    return <Package className="w-8 h-8" />;
  }, []);

  const getGradientForCategory = useCallback((name, index) => {
    const gradients = [
      "from-orange-500 to-orange-600",
      "from-orange-600 to-red-500",
      "from-orange-500 to-yellow-500",
      "from-orange-400 to-orange-600",
      "from-red-500 to-pink-500",
      "from-blue-500 to-purple-500",
      "from-green-500 to-teal-500",
      "from-purple-500 to-indigo-500",
    ];
    const lower = name.toLowerCase();
    if (lower.includes("vehicle") && lower.includes("mobility"))
      return "from-orange-500 to-yellow-500";
    if (lower.includes("bike") || lower.includes("motorcycle"))
      return "from-orange-600 to-red-500";
    if (lower.includes("electric") || lower.includes("battery"))
      return "from-blue-500 to-purple-500";
    if (lower.includes("electronics") || lower.includes("tech"))
      return "from-orange-500 to-orange-600";
    if (lower.includes("appliance") || lower.includes("home"))
      return "from-orange-600 to-red-500";
    if (lower.includes("parts") || lower.includes("accessories"))
      return "from-orange-400 to-orange-600";
    return gradients[index % gradients.length];
  }, []);

  const getCategoryImage = useCallback((name) => {
    const lower = name.toLowerCase();
    if (lower.includes("electronics"))
      return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop";
    if (lower.includes("home appliances"))
      return "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop";
    if (lower.includes("vehicles") && lower.includes("mobility"))
      return "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop";
    if (lower.includes("vehicle parts") || lower.includes("accessories"))
      return "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop";
    return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop";
  }, []);

  const formatCategoryItems = useCallback((description) => {
    if (!description) return [];
    return description
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/\b\w/g, (l) => l.toUpperCase()));
  }, []);

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

      {/* Featured banners */}
      <section className="py-10 px-4 sm:px-8 lg:px-16 bg-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Automotive & Parts",
              img: "/hero/automotive.jpg",
              badge: "On Sale This Week",
              link: "/categories/automotive",
              color: "bg-red-600",
              desc: "Engines, Tires, E-Bikes, Tools & More",
            },
            {
              title: "Tech & Electronics",
              img: "/hero/tech.jpg",
              badge: "New Tech",
              link: "/categories/tech",
              color: "bg-blue-600",
              desc: "Smartphones, Gadgets, Gaming, TVs & More",
            },
            {
              title: "Become a Supplier",
              img: "/hero/supplier.jpg",
              badge: "Join Us",
              link: "/sign-up",
              color: "bg-green-600",
              desc: "Upload your products and start selling",
            },
          ].map((banner, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden relative bg-cover bg-center h-64 flex items-end p-6 text-white cursor-pointer"
              style={{ backgroundImage: `url(${banner.img})` }}
              onClick={() => router.push(banner.link)}
            >
              <div>
                <span
                  className={`${banner.color} text-xs px-3 py-1 rounded-full font-semibold mb-2 inline-block`}
                >
                  {banner.badge}
                </span>
                <h3 className="text-xl font-bold">{banner.title}</h3>
                <p className="text-sm mt-1">{banner.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ScrollingBanner />
      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
              Featured <span className="text-orange-500">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handpicked premium products with exceptional quality and
              performance
            </p>
          </motion.div>
          <ProductGrid />
        </div>
      </section>
      <ProductShowcaseSection />
      <ProductSections />

      {/* Categories */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
              Shop by <span className="text-orange-500">Category</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our premium collection across automobiles, technology,
              and lifestyle products
            </p>
          </motion.div>

          {categoriesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg"
                >
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category, index) => {
                const items = formatCategoryItems(category.description);
                return (
                  <motion.div
                    key={category.id}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                    onClick={() =>
                      router.push(`/products?category=${category.id}`)
                    }
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={getCategoryImage(category.name)}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${getGradientForCategory(
                          category.name,
                          index
                        )} opacity-80`}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <div className="mb-3">
                          {getIconForCategory(category.name)}
                        </div>
                        <h3 className="text-2xl font-bold text-center px-4">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-2 mb-6">
                        {items.slice(0, 4).map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                            <span className="font-medium">{item}</span>
                          </div>
                        ))}
                        {items.length > 4 && (
                          <div className="text-xs text-gray-400 mt-2">
                            +{items.length - 4} more items
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-orange-500 font-semibold">
                        Explore Category
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-6xl font-black mb-8">
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
      <section className="py-20 bg-gray-900 text-white text-center">
        <h2 className="text-4xl lg:text-5xl font-black mb-6">
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
