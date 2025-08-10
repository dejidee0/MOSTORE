import { motion } from "framer-motion";

const ScrollingBanner = () => {
  // The text content to scroll
  const bannerText = "10% DISCOUNT FOR NEW MEMBERSHIPS";

  // Create multiple instances for seamless scrolling
  const scrollingContent = Array(8).fill(bannerText).join(" • ");

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 py-3 sm:py-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/5"></div>

      {/* Scrolling Container */}
      <div className="relative flex whitespace-nowrap">
        {/* First scrolling text */}
        <motion.div
          className="flex whitespace-nowrap text-white font-black text-lg sm:text-xl md:text-2xl tracking-wider"
          animate={{
            x: ["0%", "-100%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          <span className="px-4 sm:px-6">{scrollingContent}</span>
        </motion.div>

        {/* Second scrolling text for seamless loop */}
        <motion.div
          className="flex whitespace-nowrap text-white font-black text-lg sm:text-xl md:text-2xl tracking-wider"
          animate={{
            x: ["0%", "-100%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          <span className="px-4 sm:px-6">{scrollingContent}</span>
        </motion.div>

        {/* Third scrolling text for extra smooth transition */}
        <motion.div
          className="flex whitespace-nowrap text-white font-black text-lg sm:text-xl md:text-2xl tracking-wider"
          animate={{
            x: ["0%", "-100%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          <span className="px-4 sm:px-6">{scrollingContent}</span>
        </motion.div>
      </div>

      {/* Gradient Fade Edges */}
      <div className="absolute left-0 top-0 w-16 sm:w-24 h-full bg-gradient-to-r from-orange-500 to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 w-16 sm:w-24 h-full bg-gradient-to-l from-orange-500 to-transparent pointer-events-none z-10"></div>

      {/* Optional: Animated shine effect */}
      <motion.div
        className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 3,
            ease: "easeInOut",
          },
        }}
      />
    </div>
  );
};

export default ScrollingBanner;
