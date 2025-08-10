import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Play,
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
  Search,
  Package,
} from "lucide-react";
import { slides } from "@/lib/data/slides";
import { useRouter } from "next/navigation";

// Updated slides data for your ecommerce platform

const Hero = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    const resizeHandler = () => window.requestAnimationFrame(checkMobile);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isClient]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  if (!isClient) {
    return (
      <section className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </section>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${currentSlideData.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Background Glow Elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-orange-400/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full items-center min-h-0">
            {/* Left */}
            <div className="lg:col-span-8 order-2 lg:order-1">
              <div className="text-white space-y-4 sm:space-y-6 max-w-4xl animate-[slideInLeft_0.8s_ease-out]">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase">
                    {currentSlideData.category}
                  </span>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight sm:leading-none">
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
                </div>

                <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
                  {currentSlideData.tagline}
                </p>

                <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-6 py-3 sm:py-4">
                  {currentSlideData.features.map((feature, index) => (
                    <div
                      key={index}
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
                    className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 hover:scale-105 flex items-center gap-2 sm:gap-3 justify-center"
                    onClick={() => router.push("/products")}
                  >
                    <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">SHOP NOW</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-105 flex items-center gap-2 sm:gap-3 justify-center"
                    onClick={() => router.push("/sign-up")}
                  >
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">
                      JOIN AS SUPPLIER
                    </span>
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
            </div>
            <div className=" hidden md:flex lg:col-span-4 order-2  justify-center lg:justify-end">
              <div
                key={`services-${currentSlide}`}
                className="relative group max-w-sm w-full"
                style={{
                  animation: `slideInRight 0.8s ease-out 0.3s both`,
                }}
              >
                <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 rounded-3xl overflow-hidden backdrop-blur-xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 transform hover:scale-105">
                  {/* Service Categories Grid */}
                  <div className="p-8 ">
                    <div className="text-center mb-6">
                      <h3 className="text-white font-bold text-xl mb-2">
                        Our Categories
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Everything you need in one place
                      </p>
                    </div>

                    {/* Category Icons Grid */}
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center group/item">
                        <div className="bg-orange-500/20 p-4 rounded-2xl mb-3 group-hover/item:bg-orange-500/30 transition-all duration-300">
                          <Car className="w-8 h-8 text-orange-500 mx-auto" />
                        </div>
                        <p className="text-white text-xs font-medium">
                          Automotive
                        </p>
                      </div>

                      <div className="text-center group/item">
                        <div className="bg-orange-500/20 p-4 rounded-2xl mb-3 group-hover/item:bg-orange-500/30 transition-all duration-300">
                          <Smartphone className="w-8 h-8 text-orange-500 mx-auto" />
                        </div>
                        <p className="text-white text-xs font-medium">Tech</p>
                      </div>

                      <div className="text-center group/item">
                        <div className="bg-orange-500/20 p-4 rounded-2xl mb-3 group-hover/item:bg-orange-500/30 transition-all duration-300">
                          <Zap className="w-8 h-8 text-orange-500 mx-auto" />
                        </div>
                        <p className="text-white text-xs font-medium">
                          E-Bikes
                        </p>
                      </div>

                      <div className="text-center group/item">
                        <div className="bg-orange-500/20 p-4 rounded-2xl mb-3 group-hover/item:bg-orange-500/30 transition-all duration-300">
                          <Wrench className="w-8 h-8 text-orange-500 mx-auto" />
                        </div>
                        <p className="text-white text-xs font-medium">Parts</p>
                      </div>

                      <div className="text-center group/item">
                        <div className="bg-orange-500/20 p-4 rounded-2xl mb-3 group-hover/item:bg-orange-500/30 transition-all duration-300">
                          <Monitor className="w-8 h-8 text-orange-500 mx-auto" />
                        </div>
                        <p className="text-white text-xs font-medium">
                          Appliances
                        </p>
                      </div>

                      <div className="text-center group/item">
                        <div className="bg-orange-500/20 p-4 rounded-2xl mb-3 group-hover/item:bg-orange-500/30 transition-all duration-300">
                          <Package className="w-8 h-8 text-orange-500 mx-auto" />
                        </div>
                        <p className="text-white text-xs font-medium">More</p>
                      </div>
                    </div>

                    {/* Service Highlights */}
                    <div className="border-t border-gray-700/50 pt-6 space-y-4">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-sm">Verified Quality</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Truck className="w-5 h-5 text-green-400" />
                        <span className="text-sm">Fast Shipping</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Award className="w-5 h-5 text-green-400" />
                        <span className="text-sm">24/7 Support</span>
                      </div>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-500/20 via-transparent to-red-500/10 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            </div>
            {/* Right: Progress & Navigation */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block">
              <div className="flex items-center gap-6 bg-black/60 backdrop-blur-xl rounded-full px-6 py-4 border border-gray-700/50">
                {/* Previous Button */}
                <button
                  onClick={prevSlide}
                  className="text-white hover:text-orange-500 transition-all duration-300 p-3 rounded-full hover:bg-orange-500/20 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Slide Indicators */}
                <div className="flex gap-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-orange-500 w-10 h-3 shadow-lg shadow-orange-500/50"
                          : "bg-gray-600 hover:bg-gray-400 w-3 h-3 hover:scale-125"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={nextSlide}
                  className="text-white hover:text-orange-500 transition-all duration-300 p-3 rounded-full hover:bg-orange-500/20 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Slide Counter */}
            <div className="absolute top-8 right-8 z-20 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-gray-700/50">
              <span className="text-white font-bold text-sm">
                {String(currentSlide + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900">
              <div
                key={currentSlide}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100 ease-linear shadow-lg shadow-orange-500/50"
                style={{
                  animation: `progressBar 8s linear`,
                }}
              />
            </div>
          </div>
        </div>
      </div>{" "}
      {/* ← closed missing <div> */}
    </section>
  );
};

export default Hero;
