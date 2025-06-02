"use client"

import { motion } from "framer-motion"
import ProductCard from "./ProductCard"

export default function ProductGrid() {
  // TODO: Fetch data from Supabase
  const products = Array.from({ length: 12 }, (_, i) => ({
    id: `product-${i + 1}`,
    name: "VISIONE – 14JY DAYTONA Premium Appliance",
    price: 299.99,
    originalPrice: 374.99,
    image: "/one.jpg",
    rating: 4,
    discount: 20,
  }))

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">ALL Deals</h2>
          <p className="text-gray-600 text-lg">Discover our most popular items</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
