import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

export const ScrollableSection = ({ products, delay = 0 }) => {
  return (
    <div className="overflow-x-auto pb-4 hide-scrollbar max-w-7xl flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay }}
        className="flex gap-6 min-w-max"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + index * 0.1 }}
            className="w-80 flex-shrink-0"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
