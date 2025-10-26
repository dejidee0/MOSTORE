"use client";

import { motion } from "framer-motion";
import { JumiaStyleProductCard } from "../../shared/Hero/ProductCard";

export default function ProductsGrid({ products }) {
  return (
    <section className="bg-orange-50">
      <div className="max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm">
              No recently added products available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <JumiaStyleProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
