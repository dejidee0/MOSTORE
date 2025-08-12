"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  ArrowRight,
  Star,
  User,
  TrendingUp,
} from "lucide-react";

const BlogLandingSection = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual Supabase queries
  const mockFeaturedPosts = [
    {
      id: "1",
      title: "Latest Electric Vehicle Trends 2024",
      slug: "latest-electric-vehicle-trends-2024",
      excerpt:
        "Exploring the newest developments in electric vehicle technology and market trends that will shape the future of transportation.",
      featured_image: "/api/placeholder/600/300",
      category: { name: "Vehicles & Mobility", slug: "vehicles-mobility" },
      author_name: "Admin",
      published_at: "2024-01-15T10:00:00Z",
      read_time: 5,
      views_count: 1250,
      likes_count: 89,
      comments_count: 23,
      is_featured: true,
    },
    {
      id: "2",
      title: "Smart Home Revolution: Top Appliances for Modern Living",
      slug: "smart-home-revolution-top-appliances",
      excerpt:
        "Discover the cutting-edge smart home appliances that are transforming how we live, work, and interact with our living spaces.",
      featured_image: "/api/placeholder/600/300",
      category: { name: "Home Appliances", slug: "home-appliances" },
      author_name: "Admin",
      published_at: "2024-01-12T14:30:00Z",
      read_time: 7,
      views_count: 890,
      likes_count: 45,
      comments_count: 12,
      is_featured: true,
    },
  ];

  const mockRecentPosts = [
    {
      id: "3",
      title: "Essential Car Accessories Every Driver Needs",
      slug: "essential-car-accessories-every-driver",
      excerpt:
        "A comprehensive guide to must-have car accessories that enhance safety, comfort, and convenience.",
      featured_image: "/api/placeholder/300/200",
      category: {
        name: "Vehicle Parts & Accessories",
        slug: "vehicle-parts-accessories",
      },
      author_name: "Admin",
      published_at: "2024-01-10T09:15:00Z",
      read_time: 4,
      views_count: 654,
      likes_count: 32,
      comments_count: 8,
    },
    {
      id: "4",
      title: "Best Electronics for Tech Enthusiasts in 2024",
      slug: "best-electronics-tech-enthusiasts-2024",
      excerpt:
        "From cutting-edge gadgets to innovative devices, explore the electronics that are defining this year.",
      featured_image: "/api/placeholder/300/200",
      category: { name: "Electronics", slug: "electronics" },
      author_name: "Admin",
      published_at: "2024-01-08T16:45:00Z",
      read_time: 6,
      views_count: 432,
      likes_count: 28,
      comments_count: 5,
    },
    {
      id: "5",
      title: "Versatile Products for Everyday Use",
      slug: "versatile-products-everyday-use",
      excerpt:
        "Multi-purpose items that simplify your daily routine and maximize value for money.",
      featured_image: "/api/placeholder/300/200",
      category: { name: "General Use", slug: "general-use" },
      author_name: "Admin",
      published_at: "2024-01-06T11:30:00Z",
      read_time: 3,
      views_count: 298,
      likes_count: 19,
      comments_count: 3,
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setFeaturedPosts(mockFeaturedPosts);
      setRecentPosts(mockRecentPosts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest From Our <span className="text-orange-500">Blog</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, reviews, and insights from the
            world of vehicles, electronics, and more
          </p>
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                      {post.category.name}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.published_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.read_time} min read
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatCount(post.views_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {formatCount(post.likes_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {formatCount(post.comments_count)}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Recent Articles
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 text-orange-600 font-medium hover:gap-3 transition-all"
            >
              View All Posts
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg">
                      {post.category.name}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.published_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.read_time} min
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatCount(post.views_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatCount(post.likes_count)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatCount(post.comments_count)}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-orange-600 font-medium text-sm group-hover:text-orange-700 transition-colors"
                    >
                      Read →
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Stay Updated with Our Latest Posts
            </h3>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Get the latest insights, reviews, and trends delivered straight to
              your inbox. Join thousands of readers who trust our expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogLandingSection;
