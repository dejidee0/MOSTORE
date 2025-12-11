"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ChristmasPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const popupSeen = sessionStorage.getItem("christmasPopupSeen");

    if (!popupSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("christmasPopupSeen", "true");
  };

  const handleShopNow = () => {
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-[9998]"
          />

          {/* Popup - Positioned bottom-right on desktop, center on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] 
                       w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[400px]"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white 
                         rounded-full p-1.5 transition-all duration-200 hover:rotate-90 
                         shadow-md group"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </button>

              {/* Red Header Bar */}
              <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="text-2xl">🎄</span>
                    </motion.div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg leading-tight">
                        Christmas Sale
                      </h3>
                      <p className="text-red-100 text-xs font-medium">
                        Limited Time Only
                      </p>
                    </div>
                  </div>

                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Discount Badge */}
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-br from-red-500 to-orange-500 rounded-full px-6 py-3 shadow-lg">
                      <div className="text-center">
                        <p className="text-3xl sm:text-4xl font-black text-white leading-none">
                          50% OFF
                        </p>
                        <p className="text-xs text-red-100 font-semibold uppercase tracking-wider">
                          Selected Items
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Description */}
                <p className="text-center text-gray-700 text-sm sm:text-base mb-4 leading-relaxed">
                  Get amazing deals on{" "}
                  <span className="font-semibold text-red-600">
                    Automobiles
                  </span>
                  ,
                  <span className="font-semibold text-green-600">
                    {" "}
                    Electronics
                  </span>
                  , and more!
                </p>

                {/* Countdown Timer */}
                <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg px-4 py-2.5 mb-4">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                    <span className="text-gray-600 font-medium">
                      Offer ends:
                    </span>
                    <span className="font-bold text-red-600">Dec 26, 2024</span>
                    <span className="text-lg">⏰</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2.5">
                  <Link
                    href="/products"
                    onClick={handleShopNow}
                    className="block"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-red-600 to-red-500 
                               hover:from-red-700 hover:to-red-600 text-white 
                               font-bold py-3.5 sm:py-4 px-6 rounded-xl 
                               shadow-lg hover:shadow-xl transition-all duration-300
                               text-sm sm:text-base"
                    >
                      🎁 Shop Christmas Deals
                    </motion.button>
                  </Link>

                  <button
                    onClick={handleClose}
                    className="w-full text-gray-600 hover:text-gray-800 
                             font-medium py-2 text-xs sm:text-sm transition-colors"
                  >
                    No thanks, I'll pay full price
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
