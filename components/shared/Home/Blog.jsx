"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, User, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

const BlogLandingSection = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
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
            author_id,
            blog_categories (
              name,
              slug
            )
          `
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(4);

        if (error) throw error;

        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-96 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-300">
          <div className="flex gap-2">
            <h2 className=" text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Our Latest News
            </h2>
            <p className="text-gray-500 text-sm md:text-base pt-2">
              Don't miss out on this week's deals
            </p>
          </div>
          <Link href="/blog">
            <motion.div
              whileHover={{ x: 5 }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <span className="text-sm md:text-base font-medium mr-2">
                View All
              </span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              {/* Image Container */}
              <div className="relative h-32 sm:h-48 bg-gray-100 overflow-hidden">
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Link href={`/blog/${post.id}`}>
                      <div className="text-gray-400 text-2xl sm:text-4xl font-bold hover:text-orange-500 cursor-pointer">
                        {post.title?.charAt(0) || "B"}
                      </div>
                    </Link>
                  </div>
                )}

                {/* Category Badge - Hidden on mobile for space */}
                {post.blog_categories?.name && (
                  <div className="absolute top-2 left-2 hidden sm:block">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
                      {post.blog_categories.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                {/* Date - Smaller on mobile */}
                <p className="text-xs text-gray-500 mb-2">
                  {formatDate(post.published_at)}
                </p>

                {/* Title - Responsive sizing */}
                <Link href={`/blog/${post.id}`}>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 hover:text-orange-500">
                    {post.title.toUpperCase()}
                  </h3>
                </Link>

                {/* Excerpt - Hidden on mobile, shown on larger screens */}
                <p className="hidden sm:block text-xs text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt ||
                    "Discover the latest insights and updates in our comprehensive blog post."}
                </p>

                {/* Footer - Simplified on mobile */}
                <div className="text-xs text-gray-500">
                  {/* Mobile: Only show comments */}
                  <div className="sm:hidden flex items-center justify-between">
                    <span className="text-orange-600 font-medium">
                      {post.blog_categories?.name || "Blog"}
                    </span>
                    <span className="font-medium text-gray-700">
                      {post.comments_count || 0} comments
                    </span>
                  </div>

                  {/* Desktop: Full footer */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="mr-1">by</span>
                        <span className="font-medium text-gray-700">admin</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">comments</span>
                      <span className="font-medium text-gray-700">
                        {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogLandingSection;
