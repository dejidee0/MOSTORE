import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import { slides } from "@/lib/data/slides";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <section className="relative w-full min-h-screen bg-black py-8 overflow-hidden">
      {/* Dynamic Background */}
      <div
        key={`bg-${currentSlide}`}
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bgGradient} transition-all duration-1000`}
      >
        {/* Animated background elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-orange-400/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 lg:px-8 h-full pb-20 lg:pb-8">
        <div className="h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full items-start lg:items-center">
            {/* Left Content - Text and CTA (3 columns) */}
            <div className="lg:col-span-3 order-1">
              <div
                key={`content-${currentSlide}`}
                className="text-white space-y-6 transform transition-all duration-800 ease-out"
                style={{
                  animation: `slideInLeft 0.8s ease-out`,
                }}
              >
                {/* Category Badge */}
                <div
                  className="flex items-center gap-4 transform transition-all duration-300 delay-200"
                  style={{
                    animation: `fadeInUp 0.6s ease-out 0.2s both`,
                  }}
                >
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                    {currentSlideData.category}
                  </span>
                  <span className="text-orange-400 font-semibold text-sm animate-pulse">
                    {currentSlideData.discount}
                  </span>
                </div>

                {/* Main Title */}
                <div className="space-y-2">
                  <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight transform transition-all duration-500"
                    style={{
                      animation: `fadeInLeft 0.8s ease-out 0.3s both`,
                    }}
                  >
                    {currentSlideData.title}
                  </h1>
                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl text-orange-500 font-light transform transition-all duration-500"
                    style={{
                      animation: `fadeInLeft 0.8s ease-out 0.4s both`,
                    }}
                  >
                    {currentSlideData.subtitle}
                  </h2>
                </div>

                {/* Tagline */}
                <p
                  className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg transform transition-all duration-500"
                  style={{
                    animation: `fadeIn 0.6s ease-out 0.5s both`,
                  }}
                >
                  {currentSlideData.tagline}
                </p>

                {/* Call to Action Buttons */}
                <div
                  className="flex items-center gap-4 pt-4 transform transition-all duration-500"
                  style={{
                    animation: `fadeInUp 0.6s ease-out 0.6s both`,
                  }}
                >
                  <button
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg flex items-center gap-2 hover:scale-105 hover:shadow-orange-500/30 hover:shadow-xl"
                    onMouseDown={(e) =>
                      (e.target.style.transform = "scale(0.95)")
                    }
                    onMouseUp={(e) => (e.target.style.transform = "")}
                    onMouseLeave={(e) => (e.target.style.transform = "")}
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    SHOP NOW
                  </button>

                  <button
                    className="text-white hover:text-orange-500 transition-colors duration-300 p-3 rounded-full border border-gray-600 hover:border-orange-500 hover:scale-110"
                    onMouseDown={(e) =>
                      (e.target.style.transform = "scale(0.9)")
                    }
                    onMouseUp={(e) => (e.target.style.transform = "")}
                    onMouseLeave={(e) => (e.target.style.transform = "")}
                  >
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content - Products (2 columns) */}
            <div className="lg:col-span-2 h-full flex items-center order-2 lg:order-2">
              <div
                key={`products-${currentSlide}`}
                className="w-full space-y-4 sm:space-y-6 transform transition-all duration-600 ease-out"
                style={{
                  animation: `slideInRight 0.8s ease-out`,
                }}
              >
                {currentSlideData.products
                  .slice(0, isMobile ? 1 : 2) // Show 1 on mobile, 2 on desktop
                  .map((product, index) => (
                    <div
                      key={`${product.name}-${index}`}
                      className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-102 ${
                        product.featured ? "lg:scale-110" : ""
                      }`}
                      style={{
                        animation: `fadeInRight 0.6s ease-out ${
                          0.3 + index * 0.2
                        }s both`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = `scale(${
                          product.featured && !isMobile ? "1.12" : "1.02"
                        })`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `scale(${
                          product.featured && !isMobile ? "1.10" : "1"
                        })`;
                      }}
                    >
                      <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/95 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
                        {/* Product Image */}
                        <div className="relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
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
                          <h3 className="text-white font-semibold text-base sm:text-lg group-hover:text-orange-400 transition-colors">
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
                            <span className="text-orange-500 font-bold text-lg sm:text-xl">
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
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation - Positioned to avoid overlap on mobile */}
      <div className="absolute bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-3 border border-gray-700/50">
          {/* Arrow Navigation */}
          <button
            onClick={prevSlide}
            className="text-white hover:text-orange-500 transition-colors duration-200 p-2 rounded-full hover:bg-orange-500/20"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-orange-500 w-6 sm:w-8 h-2 sm:h-3"
                    : "bg-gray-500 hover:bg-gray-400 w-2 sm:w-3 h-2 sm:h-3"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="text-white hover:text-orange-500 transition-colors duration-200 p-2 rounded-full hover:bg-orange-500/20"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
        <div
          key={currentSlide}
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-75 ease-linear"
          style={{
            animation: `progressBar 7s linear`,
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
