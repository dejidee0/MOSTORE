'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Prevents hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const slides = [
    {
      id: 1,
      title: "NEWEST",
      subtitle: "Deal",
      tagline: "Biggest offer of the week",
      appliances: [
        { type: "washer", image: "/laptop.jpg", featured: true },
        { type: "fridge", image: "/laptop.jpg", featured: false }
      ]
    },
    {
      id: 2,
      title: "PREMIUM",
      subtitle: "Sale",
      tagline: "Best kitchen appliances",
      appliances: [
        { type: "oven", image: "/laptop.jpg", featured: true },
        { type: "dishwasher", image: "/laptop.jpg", featured: false }
      ]
    },
    {
      id: 3,
      title: "LUXURY",
      subtitle: "Collection",
      tagline: "Transform your home today",
      appliances: [
        { type: "ac", image: "/laptop.jpg", featured: true },
        { type: "purifier", image: "/laptop.jpg", featured: false }
      ]
    }
  ];

  // Auto-advance slides on mock 
  useEffect(() => {
    if (!isClient) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // my  timing

    return () => clearInterval(timer);
  }, [isClient, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Animation variants
  const slideVariants = {
    enter: {
      x: '100%',
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const applianceVariants = {
    enter: {
      x: 50,
      opacity: 0,
      scale: 0.9
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        delay: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      x: -50,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  if (!isClient) {
    // Returned static version for SSR
    return (
      <section className="relative w-full h-[600px] bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-blue-900/20">
          <div className="container mx-auto px-6 lg:px-8 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">
              {/* Content */}
              <div className="text-white space-y-6">
                <div>
                  <h1 className="text-6xl lg:text-7xl font-black tracking-tight mb-2">
                    NEWEST
                  </h1>
                  <h2 className="text-4xl lg:text-5xl text-red-500 font-script italic -mt-2">
                    Deal
                  </h2>
                </div>
                <p className="text-gray-300 text-lg font-medium">
                  Biggest offer of the week
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors duration-200">
                    SHOP
                  </button>
                  <button className="text-white hover:text-red-500 transition-colors duration-200">
                    <Heart className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[600px] bg-black overflow-hidden">
      {/* Background with lighting effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-blue-900/20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Main content container */}
      <div className="relative container mx-auto px-6 lg:px-8 h-full">
        <div className="h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">
            
            {/* Left Content - Text and CTA */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-white space-y-6 z-10"
              >
                <div>
                  <h1 className="text-6xl lg:text-7xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {slides[currentSlide].title}
                  </h1>
                  <h2 className="text-4xl lg:text-5xl text-red-500 font-script italic -mt-2" 
                      style={{ fontFamily: 'cursive' }}>
                    {slides[currentSlide].subtitle}
                  </h2>
                </div>
                
                <p className="text-gray-300 text-lg font-medium tracking-wide">
                  {slides[currentSlide].tagline}
                </p>
                
                <div className="flex items-center gap-4 pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
                  >
                    SHOP
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white hover:text-red-500 transition-colors duration-200"
                  >
                    <Heart className="w-8 h-8" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Right Content - Appliances */}
            <div className="relative h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`appliances-${currentSlide}`}
                  variants={applianceVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Appliances Display - 2 Items */}
                  <div className="flex items-center justify-center gap-8 lg:gap-12 w-full max-w-4xl">
                    {slides[currentSlide].appliances.map((appliance, index) => (
                      <motion.div
                        key={`${appliance.type}-${index}`}
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: {
                            delay: 0.4 + index * 0.2,
                            duration: 0.8,
                            ease: "easeOut"
                          }
                        }}
                        className={`relative ${
                          appliance.featured 
                            ? 'w-80 lg:w-96' // Featured item larger
                            : 'w-64 lg:w-80'  // Secondary item smaller
                        }`}
                      >
                        {/* Appliance with enhanced styling */}
                        <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-2xl overflow-hidden shadow-2xl border border-gray-600/30 backdrop-blur-sm">
                          {/* Glow effects */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10"></div>
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-60"></div>
                          
                          {/* Image container */}
                          <div className="relative">
                            <Image
                              src={appliance.image}
                              alt={appliance.type}
                              width={appliance.featured ? 400 : 350}
                              height={appliance.featured ? 450 : 400}
                              className={`w-full object-cover transition-all duration-500 hover:scale-105 ${
                                appliance.featured 
                                  ? 'h-80 lg:h-96' // Featured item height
                                  : 'h-64 lg:h-80'  // Secondary item height
                              }`}
                              priority={index === 0} // Prioritize loading for featured items
                            />
                            
                            {/* Overlay gradients */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-900/10"></div>
                          </div>
                          
                          {/* Featured badge */}
                          {appliance.featured && (
                            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              Featured
                            </div>
                          )}
                          
                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/0 hover:from-orange-500/10 transition-all duration-300"></div>
                        </div>
                        
                        {/* Floating elements for depth */}
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-orange-500/30 rounded-full blur-sm"></div>
                        <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-500/30 rounded-full blur-sm"></div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-20">
        {/* Dot indicators */}
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-orange-500 w-8' 
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-500 transition-colors duration-200 z-20"
      >
        <ChevronLeft className="w-8 h-8 lg:w-10 lg:h-10" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-500 transition-colors duration-200 z-20"
      >
        <ChevronRight className="w-8 h-8 lg:w-10 lg:h-10" />
      </button>
    </section>
  );
};

export default Hero;