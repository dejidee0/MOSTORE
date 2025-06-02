"use client"

import { motion } from "framer-motion"
import BlogCard from "./BlogCard"


export default function BlogSection() {
  // TODO: Fetch data from Supabase
  const blogPosts = [
    {
      id: "1",
      title: "Top 10 Kitchen Appliances for Modern Homes",
      excerpt:
        "Discover the essential kitchen appliances that will transform your cooking experience and make meal preparation effortless.",
      image: "/one.jpg",
      date: "Dec 15, 2024",
      author: "Sarah Johnson",
      slug: "top-10-kitchen-appliances",
    },
    {
      id: "2",
      title: "Energy-Efficient Home Appliances: A Complete Guide",
      excerpt:
        "Learn how to choose energy-efficient appliances that will save you money on utility bills while protecting the environment.",
      image: "/one.jpg",
      date: "Dec 12, 2024",
      author: "Mike Chen",
      slug: "energy-efficient-appliances-guide",
    },
    {
      id: "3",
      title: "Smart Home Integration: The Future is Here",
      excerpt:
        "Explore how smart appliances can be integrated into your home automation system for ultimate convenience and control.",
      image: "/one.jpg",
      date: "Dec 10, 2024",
      author: "Emily Davis",
      slug: "smart-home-integration",
    },
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
          <p className="text-gray-600 text-lg">Stay updated with tips, guides, and industry news</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
