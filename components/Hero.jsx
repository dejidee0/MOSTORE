"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  Truck,
  Award,
  Car,
  Smartphone,
  Monitor,
  Wrench,
  Zap,
  Users,
  Store,
  Package,
} from "lucide-react";
import { slides } from "@/lib/data/slides";
import { useRouter } from "next/navigation";

const SLIDE_INTERVAL = 7000;

const Hero = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isClient]);

  const currentSlideData = useMemo(() => slides[currentSlide], [currentSlide]);

  const nextSlide = useCallback(
    () => setCurrentSlide((prev) => (prev + 1) % slides.length),
    []
  );
  const prevSlide = useCallback(
    () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length),
    []
  );
  const goToSlide = useCallback((index) => setCurrentSlide(index), []);

  if (!isClient) {
    return (
      <section className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500" />
      </section>
    );
  }

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={currentSlideData.backgroundImage}
          alt={currentSlideData.title}
          fill
          priority={currentSlide === 0}
          loading={currentSlide === 0 ? "eager" : "lazy"}
          sizes="100vw"
          className="object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Background Glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-orange-400/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase">
                {currentSlideData.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight sm:leading-none text-white">
              <span className="block">
                {currentSlideData.title.split(" ")[0]}
              </span>
              <span className="block text-orange-500">
                {currentSlideData.title.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light tracking-wide">
              {currentSlideData.subtitle}
            </h2>

            <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
              {currentSlideData.tagline}
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-6 py-3 sm:py-4">
              {currentSlideData.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-orange-400"
                >
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{feature}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                onClick={() => router.push("/products")}
                className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 hover:scale-105 flex items-center gap-2 sm:gap-3 justify-center"
              >
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base">SHOP NOW</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/sign-up")}
                className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-105 flex items-center gap-2 sm:gap-3 justify-center"
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base">JOIN AS SUPPLIER</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between sm:gap-8 pt-4 sm:pt-6 border-t border-gray-700/50">
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-xl sm:text-2xl">
                  25K+
                </span>
                <span className="text-gray-400 text-xs sm:text-sm font-medium">
                  Products Listed
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-xl sm:text-2xl">
                  8K+
                </span>
                <span className="text-gray-400 text-xs sm:text-sm font-medium">
                  Trusted Suppliers
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-xl sm:text-2xl">
                  12+
                </span>
                <span className="text-gray-400 text-xs sm:text-sm font-medium">
                  Categories
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Service Categories Panel */}
          <div className="hidden md:flex lg:col-span-4 justify-center order-2">
            <div
              key={`services-${currentSlide}`}
              className="relative group max-w-sm w-full"
              style={{ animation: `slideInRight 0.8s ease-out 0.3s both` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:flex items-center gap-6 bg-black/60 backdrop-blur-xl rounded-full px-6 py-4 border border-gray-700/50">
        <button
          onClick={prevSlide}
          className="text-white hover:text-orange-500 transition-all duration-300 p-3 rounded-full hover:bg-orange-500/20 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "bg-orange-500 w-10 h-3 shadow-lg shadow-orange-500/50"
                  : "bg-gray-600 w-3 h-3 hover:scale-125"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="text-white hover:text-orange-500 transition-all duration-300 p-3 rounded-full hover:bg-orange-500/20 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900">
        <div
          key={currentSlide}
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100 ease-linear shadow-lg shadow-orange-500/50"
          style={{ animation: `progressBar ${SLIDE_INTERVAL}ms linear` }}
        />
      </div>
    </section>
  );
};

export default Hero;
