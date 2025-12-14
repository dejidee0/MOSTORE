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
          {/* Glossy Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={handleClose}
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 z-[9998]"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          />

          {/* Centered Popup */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="w-full max-w-md"
            >
              <div
                className="relative bg-white rounded-3xl shadow-2xl overflow-hidden
                            border border-white/20"
                style={{
                  boxShadow:
                    "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Glossy Glass Effect Overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  }}
                />

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 bg-white/95 hover:bg-white 
                           backdrop-blur-sm rounded-full p-2 transition-all duration-200 
                           hover:rotate-90 shadow-lg hover:shadow-xl group"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                </button>

                {/* Red Header Bar with Glossy Effect */}
                <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-6 py-4 relative overflow-hidden">
                  {/* Glossy Shine Effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)",
                    }}
                  />

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
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, white 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                        <span className="text-3xl">🎄</span>
                      </motion.div>
                      <div>
                        <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md">
                          Christmas Sale
                        </h3>
                        <p className="text-red-100 text-sm font-medium">
                          Limited Time Only
                        </p>
                      </div>
                    </div>

                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Discount Badge */}
                  <div className="flex items-center justify-center mb-6">
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
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-2xl opacity-60 animate-pulse" />

                      {/* Badge */}
                      <div
                        className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-500 
                                    rounded-full px-8 py-4 shadow-2xl"
                        style={{
                          boxShadow:
                            "0 20px 40px -10px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        {/* Inner Glossy Highlight */}
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 50%)",
                          }}
                        />

                        <div className="relative text-center">
                          <p className="text-4xl font-black text-white leading-none drop-shadow-lg">
                            50% OFF
                          </p>
                          <p className="text-xs text-red-100 font-semibold uppercase tracking-wider mt-1">
                            Selected Items
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Description */}
                  <p className="text-center text-gray-700 text-base mb-5 leading-relaxed">
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
                  <div
                    className="bg-gradient-to-r from-red-50 via-orange-50 to-green-50 
                                rounded-xl px-4 py-3 mb-6 border border-red-100/50"
                    style={{
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-gray-600 font-medium">
                        Offer ends:
                      </span>
                      <span className="font-bold text-red-600">
                        Dec 26, 2024
                      </span>
                      <span className="text-lg">⏰</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Link
                      href="/products"
                      onClick={handleShopNow}
                      className="block"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 
                                 hover:from-red-700 hover:via-red-600 hover:to-red-700 
                                 text-white font-bold py-4 px-6 rounded-xl 
                                 shadow-lg hover:shadow-2xl transition-all duration-300
                                 text-base relative overflow-hidden group"
                        style={{
                          boxShadow:
                            "0 10px 25px -5px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {/* Button Glossy Effect */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
                          }}
                        />
                        <span className="relative">
                          🎁 Shop Christmas Deals
                        </span>
                      </motion.button>
                    </Link>

                    <button
                      onClick={handleClose}
                      className="w-full text-gray-600 hover:text-gray-800 
                               font-medium py-2.5 text-sm transition-colors
                               hover:bg-gray-50 rounded-lg"
                    >
                      No thanks, I'll pay full price
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
