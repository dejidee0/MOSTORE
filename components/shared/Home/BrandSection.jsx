import { brands } from "@/lib/data/brands";
import { motion } from "framer-motion";
import React from "react";

const BusinessPartners = () => {
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 ">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Product Brands
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Authentic products from trusted brands. Premium electronics,
            automotive parts, and cutting-edge technology. Genuine quality
            guaranteed. Your destination for top-tier brands.
          </p>
        </div>

        {/* Sliding Logos Container */}
        <div className="relative">
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10"></div>

          {/* Sliding logos */}
          <motion.div
            className="flex items-center space-x-16"
            animate={{
              x: [0, -1920], // Adjust based on total width
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
            style={{ width: "fit-content" }}
          >
            {duplicatedBrands.map((brand, index) => (
              <motion.div
                key={`${brand.name}-${index}`}
                className="flex-shrink-0 group cursor-pointer"
                whileHover={{ scale: 1.3 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-gray-400 group-hover:text-orange-500 transition-colors duration-300 filter grayscale group-hover:grayscale-0">
                  {brand.logo}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Second row with reverse direction */}
        <div className="relative mt-12">
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10"></div>

          <motion.div
            className="flex items-center space-x-16"
            animate={{
              x: [-1920, 0], // Reverse direction
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            style={{ width: "fit-content" }}
          >
            {duplicatedBrands.reverse().map((brand, index) => (
              <motion.div
                key={`reverse-${brand.name}-${index}`}
                className="flex-shrink-0 group cursor-pointer"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-gray-600 group-hover:text-orange-500 transition-colors duration-300 filter grayscale group-hover:grayscale-0">
                  {brand.logo}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BusinessPartners;
