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
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

const BlogLandingSection = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(
            `
            id,
            title,
            slug,
            excerpt,
            featured_image,
            published_at,
            read_time,
            views_count,
            likes_count,
            comments_count,
            category_id,
            is_featured
          `
          )
          .eq("is_featured", true)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(2);

        if (error) throw error;

        // Optional: map category info if needed
        const postsWithCategory = data.map((post) => ({
          ...post,
          category: { name: "Featured", slug: "featured" }, // replace with actual category join if needed
        }));

        setFeaturedPosts(postsWithCategory);
      } catch (err) {
        console.error("Error fetching featured posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCount = (count) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Latest From Our <span className="text-orange-500">Blog</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Stay updated with the latest trends, reviews, and insights from
              our blog
            </p>
          </div>

          {/* View All Button - Desktop */}
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
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
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
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

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

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

                    <Link href={`/blog/${post.id}`}>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all cursor-pointer"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          // No Featured Posts Fallback
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Featured Posts Yet
            </h3>
            <p className="text-gray-600 mb-6">
              We're working on bringing you amazing content. Check back soon!
            </p>
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                Explore All Posts
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* View All Button - Mobile & Tablet + Always Show When Posts Exist */}
        {featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="hidden sm:inline">Explore More Articles</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogLandingSection;
