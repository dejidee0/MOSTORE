"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function PromoBanner() {
  return (
    <section className="py-16 px-4 bg-orange-500">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* New Stock */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-white to-white/40 rounded-lg overflow-hidden text-black p-8"
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">New Stock</h2>
              <p className="text-lg mb-6">Latest arrivals with cutting-edge technology</p>
              <Button variant="secondary" className="bg-orange-500 text-white hover:bg-orange-100 px-8">
                Shop
              </Button>
            </div>
            <Image
              src="/"
              alt="New Stock"
              width={300}
              height={200}
              className="absolute right-0 top-0 opacity-20"
            />
          </motion.div>

          {/* Top Deals */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-gradient-to-r from-white to-white/40 rounded-lg overflow-hidden text-black p-8"
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Top Deals</h2>
              <p className="text-lg mb-6">Save up to 50% on selected items</p>
              <Button variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600 px-8">
                Shop 
              </Button>
            </div>
            <Image
              src="/"
              alt="Top Deals"
              width={300}
              height={200}
              className="absolute right-0 top-0 opacity-20"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
