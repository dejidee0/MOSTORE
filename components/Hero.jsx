import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const slides = [
    {
      id: 1,
      category: "AUTOMOBILES",
      title: "Premium Auto Parts",
      subtitle: "& Accessories",
      tagline: "Complete automotive solutions for every vehicle",
      discount: "UP TO 40% OFF",
      products: [
        {
          name: "Performance Engine Kit",
          image:
            "https://images.unsplash.com/photo-1486326658981-ed68abe5868e?w=400&h=300&fit=crop",
          price: "$2,499",
          originalPrice: "$3,199",
          rating: 4.8,
          featured: true,
        },
        {
          name: "LED Headlight System",
          image:
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=350&h=250&fit=crop",
          price: "$329",
          originalPrice: "$449",
          rating: 4.6,
          featured: false,
        },
      ],
      bgGradient: "from-orange-900/20 via-gray-900 to-black",
    },
    {
      id: 2,
      category: "MOTORCYCLES",
      title: "Motorcycle Gear",
      subtitle: "& Equipment",
      tagline: "Safety meets style on every ride",
      discount: "NEW ARRIVALS",
      products: [
        {
          name: "Racing Helmet Pro",
          image:
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
          price: "$459",
          originalPrice: "$599",
          rating: 4.9,
          featured: true,
        },
        {
          name: "Leather Jacket Elite",
          image:
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=350&h=250&fit=crop",
          price: "$299",
          originalPrice: "$399",
          rating: 4.7,
          featured: false,
        },
      ],
      bgGradient: "from-blue-900/20 via-gray-900 to-black",
    },
    {
      id: 3,
      category: "TECH & GADGETS",
      title: "Latest Technology",
      subtitle: "Solutions",
      tagline: "Cutting-edge devices for modern lifestyle",
      discount: "FLASH SALE",
      products: [
        {
          name: "Gaming Smartphone",
          image:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
          price: "$899",
          originalPrice: "$1,199",
          rating: 4.8,
          featured: true,
        },
        {
          name: "Wireless Earbuds Pro",
          image:
            "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=350&h=250&fit=crop",
          price: "$179",
          originalPrice: "$249",
          rating: 4.5,
          featured: false,
        },
      ],
      bgGradient: "from-purple-900/20 via-gray-900 to-black",
    },
    {
      id: 4,
      category: "ELECTRIC BIKES",
      title: "Electric Mobility",
      subtitle: "Revolution",
      tagline: "Eco-friendly transportation for the future",
      discount: "LIMITED TIME",
      products: [
        {
          name: "Urban E-Bike Elite",
          image:
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
          price: "$1,899",
          originalPrice: "$2,299",
          rating: 4.9,
          featured: true,
        },
        {
          name: "Mountain E-Bike Pro",
          image:
            "https://images.unsplash.com/photo-1544191696-15693072e2eb?w=350&h=250&fit=crop",
          price: "$2,499",
          originalPrice: "$2,999",
          rating: 4.8,
          featured: false,
        },
      ],
      bgGradient: "from-green-900/20 via-gray-900 to-black",
    },
  ];

  useEffect(() => {
    if (!isClient) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isClient, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  // Animation variants
  const slideVariants = {
    enter: { x: "100%", opacity: 0 },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const productVariants = {
    enter: { y: 30, opacity: 0, scale: 0.9 },
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: {
      y: -30,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  if (!isClient) {
    return (
      <section className="relative w-full h-[700px] bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-gray-900 to-black">
          <div className="container mx-auto px-6 lg:px-8 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full items-center">
              <div className="lg:col-span-3 text-white space-y-6">
                <div className="space-y-2">
                  <span className="text-orange-500 font-semibold text-sm tracking-wider">
                    AUTOMOBILES
                  </span>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight">
                    Premium Auto Parts
                  </h1>
                  <h2 className="text-3xl lg:text-4xl text-orange-500 font-light">
                    & Accessories
                  </h2>
                </div>
                <p className="text-gray-300 text-lg">
                  Complete automotive solutions for every vehicle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative w-full h-[700px] bg-black overflow-hidden">
      {/* Dynamic Background */}
      <motion.div
        key={`bg-${currentSlide}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bgGradient}`}
      >
        {/* Animated background elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-orange-400/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </motion.div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 lg:px-8 h-full">
        <div className="h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full items-center">
            {/* Left Content - Text and CTA (3 columns) */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentSlide}`}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="text-white space-y-6"
                >
                  {/* Category Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                      {currentSlideData.category}
                    </span>
                    <span className="text-orange-400 font-semibold text-sm animate-pulse">
                      {currentSlideData.discount}
                    </span>
                  </motion.div>

                  {/* Main Title */}
                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-5xl lg:text-6xl font-black tracking-tight leading-tight"
                    >
                      {currentSlideData.title}
                    </motion.h1>
                    <motion.h2
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl lg:text-4xl text-orange-500 font-light"
                    >
                      {currentSlideData.subtitle}
                    </motion.h2>
                  </div>

                  {/* Tagline */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-300 text-lg leading-relaxed max-w-lg"
                  >
                    {currentSlideData.tagline}
                  </motion.p>

                  {/* Call to Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-4 pt-4"
                  >
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 30px rgba(251, 146, 60, 0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      SHOP NOW
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-white hover:text-orange-500 transition-colors duration-300 p-3 rounded-full border border-gray-600 hover:border-orange-500"
                    >
                      <Heart className="w-6 h-6" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Content - Products (2 columns) */}
            <div className="lg:col-span-2 h-full flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`products-${currentSlide}`}
                  variants={productVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full space-y-6"
                >
                  {currentSlideData.products.map((product, index) => (
                    <motion.div
                      key={`${product.name}-${index}`}
                      initial={{ opacity: 0, x: 50, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: { delay: 0.3 + index * 0.2, duration: 0.6 },
                      }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                      className={`relative group cursor-pointer ${
                        product.featured ? "lg:scale-110" : ""
                      }`}
                    >
                      <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/95 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
                        {/* Product Image */}
                        <div className="relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Featured Badge */}
                          {product.featured && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              FEATURED
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-orange-500 transition-colors">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-orange-500 transition-colors">
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 space-y-3">
                          <h3 className="text-white font-semibold text-lg group-hover:text-orange-400 transition-colors">
                            {product.name}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                      ? "text-orange-500 fill-current"
                                      : "text-gray-400"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-400 text-sm">
                              ({product.rating})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-3">
                            <span className="text-orange-500 font-bold text-xl">
                              {product.price}
                            </span>
                            <span className="text-gray-500 line-through text-sm">
                              {product.originalPrice}
                            </span>
                          </div>
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/5 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-full px-6 py-3 border border-gray-700/50">
          {/* Arrow Navigation */}
          <button
            onClick={prevSlide}
            className="text-white hover:text-orange-500 transition-colors duration-200 p-2 rounded-full hover:bg-orange-500/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-orange-500 w-8 h-3"
                    : "bg-gray-500 hover:bg-gray-400 w-3 h-3"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="text-white hover:text-orange-500 transition-colors duration-200 p-2 rounded-full hover:bg-orange-500/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 7, ease: "linear" }}
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>
    </section>
  );
};

export default Hero;
