"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Car,
  Bike,
  Zap,
  Wrench,
  Smartphone,
  Monitor,
  Camera,
  Shield,
  ChevronRight,
  Star,
  Play,
  Award,
  Users,
  Package,
  Truck,
  ArrowRight,
  CheckCircle,
  Battery,
} from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import Hero from "@/components/Hero";
import { getAllCategories } from "@/lib/data/products";

const HomePage = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    loadCategories();
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load categories from the same source as NavBar
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Helper function to get appropriate icon for category (same as NavBar)
  const getIconForCategory = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("vehicle") && name.includes("mobility"))
      return <Car className="w-8 h-8" />;
    if (name.includes("bike") || name.includes("motorcycle"))
      return <Bike className="w-8 h-8" />;
    if (name.includes("electric") || name.includes("battery"))
      return <Battery className="w-8 h-8" />;
    if (name.includes("electronics") || name.includes("tech"))
      return <Smartphone className="w-8 h-8" />;
    if (name.includes("appliance") || name.includes("home"))
      return <Monitor className="w-8 h-8" />;
    if (
      name.includes("parts") ||
      name.includes("accessories") ||
      name.includes("tool")
    )
      return <Wrench className="w-8 h-8" />;
    return <Package className="w-8 h-8" />; // Default icon
  };

  // Helper function to get gradient colors based on category
  const getGradientForCategory = (categoryName, index) => {
    const name = categoryName.toLowerCase();
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

    if (name.includes("vehicle") && name.includes("mobility"))
      return "from-orange-500 to-yellow-500";
    if (name.includes("bike") || name.includes("motorcycle"))
      return "from-orange-600 to-red-500";
    if (name.includes("electric") || name.includes("battery"))
      return "from-blue-500 to-purple-500";
    if (name.includes("electronics") || name.includes("tech"))
      return "from-orange-500 to-orange-600";
    if (name.includes("appliance") || name.includes("home"))
      return "from-orange-600 to-red-500";
    if (name.includes("parts") || name.includes("accessories"))
      return "from-orange-400 to-orange-600";

    return gradients[index % gradients.length];
  };

  // Helper function to get category image
  const getCategoryImage = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (name.includes("electronics"))
      return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop";
    if (name.includes("home appliances"))
      return "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop";
    if (name.includes("vehicles") && name.includes("mobility"))
      return "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop";
    if (name.includes("vehicle parts") || name.includes("accessories"))
      return "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop";

    // Default image
    return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop";
  };

  // Helper function to format category description into items
  const formatCategoryItems = (description) => {
    if (!description) return [];

    // Split by commas and clean up each item
    return description
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => {
        // Capitalize first letter of each word
        return item.replace(/\b\w/g, (l) => l.toUpperCase());
      });
  };

  // Handle category click - same navigation as NavBar
  const handleCategoryClick = (categoryId, categoryName) => {
    router.push(`/products?category=${categoryId}`);
  };

  const heroSlides = [
    {
      title: "Electronics",
      subtitle: "Tech Innovation",
      description:
        "Latest smartphones, tablets, computers and cutting-edge technology",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop",
      cta: "Shop Electronics",
    },
    {
      title: "Vehicles",
      subtitle: "Premium Mobility",
      description:
        "Luxury automobiles, motorcycles and electric transportation",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
      cta: "Explore Vehicles",
    },
    {
      title: "Home Appliances",
      subtitle: "Smart Living",
      description: "TVs, speakers, cameras and premium home essentials",
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop",
      cta: "View Appliances",
    },
  ];

  const stats = [
    { icon: Users, number: "50K+", label: "Happy Customers" },
    { icon: Package, number: "10K+", label: "Products" },
    { icon: Truck, number: "99%", label: "On-Time Delivery" },
    { icon: Award, number: "4.9", label: "Rating" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        <Hero />
      </section>

      {/* Categories Section */}
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

          {/* Loading State */}
          {categoriesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse"
                >
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-3 bg-gray-200 rounded w-4/5"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  onClick={() =>
                    handleCategoryClick(category.id, category.name)
                  }
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  {/* Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getCategoryImage(category.name)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${getGradientForCategory(
                        category.name,
                        index
                      )} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}
                    />

                    {/* Category Icon and Title Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="mb-3">
                        {getIconForCategory(category.name)}
                      </div>
                      <h3 className="text-2xl font-bold text-center px-4">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Items */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 gap-2">
                        {formatCategoryItems(category.description)
                          .slice(0, 4)
                          .map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
                            >
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0" />
                              <span className="font-medium">{item}</span>
                            </div>
                          ))}
                        {formatCategoryItems(category.description).length >
                          4 && (
                          <div className="flex items-center text-xs text-gray-400 mt-2">
                            <span>
                              +
                              {formatCategoryItems(category.description)
                                .length - 4}{" "}
                              more items
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-orange-500 font-semibold group-hover:text-orange-600 transition-colors">
                      Explore Category
                      <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-orange-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}

              {/* All Products Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categories.length * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                onClick={() => router.push("/products")}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop"
                    alt="All Products"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-700 opacity-80 group-hover:opacity-70 transition-opacity duration-300" />

                  {/* Title Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="mb-3">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-center px-4">
                      All Products
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Browse our complete collection of premium products
                  </p>

                  {/* CTA */}
                  <div className="flex items-center text-orange-500 font-semibold group-hover:text-orange-600 transition-colors">
                    View All Products
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-orange-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
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

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-8">
              Trusted by 50,000+ Customers
            </h2>
            <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
              Join thousands of satisfied customers who trust MOSTORE for
              premium quality and exceptional service
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
                  desc: "Free shipping on orders  ₦50+",
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
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <feature.icon className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="opacity-75">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/products")}
              className="bg-white text-orange-600 px-12 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl"
            >
              Start Shopping Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Stay Updated with <span className="text-orange-500">MOSTORE</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Get exclusive deals, new arrivals, and expert insights delivered
              to your inbox
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 text-lg bg-white text-gray-900 placeholder-gray-500 rounded-full focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-200"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-xl"
              >
                Subscribe
              </motion.button>
            </div>

            <p className="text-sm text-gray-400">
              Join 10,000+ subscribers. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
