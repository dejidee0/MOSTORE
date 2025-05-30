"use client"

import { motion } from "framer-motion"
import { Zap, Star, Clock, Gift, TrendingUp, Award } from "lucide-react"

export default function CategoryGrid() {
  const categories = [
    { name: "Best Seller", icon: Star, color: "bg-blue-500" },
    { name: "Deal of the Day", icon: Clock, color: "bg-red-500" },
    { name: "New Arrivals", icon: Zap, color: "bg-green-500" },
    { name: "Gift Ideas", icon: Gift, color: "bg-purple-500" },
    { name: "Trending", icon: TrendingUp, color: "bg-orange-500" },
    { name: "Premium", icon: Award, color: "bg-yellow-500" },
  ]

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Shop by Category</h2>
          <p className="text-gray-600 text-lg">Find exactly what you're looking for</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div
                  className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
