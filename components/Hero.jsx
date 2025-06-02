"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20 px-4 w-full">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              NEWEST 
              <span className="text-red-700  italic"> Deal</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
Biggest  offer of the week
            </p>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold">
              SHOP 
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Image
              src="/one.jpg"
              alt="Premium Appliances"
              width={500}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
