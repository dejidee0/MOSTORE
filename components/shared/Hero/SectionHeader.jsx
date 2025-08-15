import { CountdownTimer } from "./CountdownTimer";
import { motion } from "framer-motion";

export const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  showTimer = false,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="mb-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl font-bold text-gray-800 mb-2"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-gray-600 text-lg"
      >
        {subtitle}
      </motion.p>

      {showTimer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-gray-600 font-medium">
            Deal ends in:
          </span>
          <CountdownTimer targetDate={tomorrow.getTime()} />
        </motion.div>
      )}
    </div>
  );
};
