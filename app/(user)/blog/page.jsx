"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  ArrowRight,
  Star,
  TrendingUp,
  Grid,
  List,
  ChevronDown,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const MotionLink = motion(Link);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch categories with post count
      const { data: categories, error: catError } = await supabase.from(
        "blog_categories"
      ).select(`
        id,
        name,
        slug,
        description,
        blog_posts(count)
      `);

      if (catError) {
        console.error("Error fetching categories:", catError);
        setIsLoading(false);
        return;
      }

      // Transform to match the UI count field
      const categoriesWithCount = categories.map((cat) => ({
        ...cat,
        count: cat.blog_posts?.length || 0,
      }));

      // Fetch posts with category data joined
      const { data: posts, error: postError } = await supabase
        .from("blog_posts")
        .select(
          `
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        is_featured,
        read_time,
        views_count,
        likes_count,
        comments_count,
        published_at,
        category:blog_categories (
          id,
          name,
          slug
        )
      `
        )
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (postError) {
        console.error("Error fetching posts:", postError);
        setIsLoading(false);
        return;
      }

      setCategories(categoriesWithCount);
      setPosts(posts);
      setIsLoading(false);
    };

    fetchData();
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

  const filteredAndSortedPosts = () => {
    let filtered = posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || post.category.id == selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "popular":
        return filtered.sort((a, b) => b.views_count - a.views_count);
      case "liked":
        return filtered.sort((a, b) => b.likes_count - a.likes_count);
      case "commented":
        return filtered.sort((a, b) => b.comments_count - a.comments_count);
      default:
        return filtered.sort(
          (a, b) => new Date(b.published_at) - new Date(a.published_at)
        );
    }
  };

  const PostCard = ({ post, isListView = false }) => (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className={`group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 ${
        isListView ? "flex gap-6" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${isListView ? "w-80 flex-shrink-0" : ""}`}
      >
        <img
          src={post.featured_image}
          alt={post.title}
          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
            isListView ? "w-full h-full" : "w-full h-48"
          }`}
        />
        <div className="absolute top-3 left-3">
          {post.is_featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
            {post.category.name}
          </span>
        </div>
      </div>

      <div
        className={`p-6 ${isListView ? "flex-1 flex flex-col justify-between" : ""}`}
      >
        <div>
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

          <h3
            className={`font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors ${
              isListView ? "text-xl" : "text-lg"
            }`}
          >
            {post.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        </div>

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

          <MotionLink
            href={`/blog/${post.id}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all"
          >
            Read More
            <ArrowRight className="w-4 h-4" />
          </MotionLink>
        </div>
      </div>
    </motion.article>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-16 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-orange-500">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights, reviews, and the latest trends across vehicles,
            electronics, home appliances, and more
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="liked">Most Liked</option>
                <option value="commented">Most Commented</option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredAndSortedPosts().length} of {posts.length} articles
            {selectedCategory && (
              <span className="ml-2">
                in{" "}
                <span className="font-medium">
                  {categories.find((c) => c.id == selectedCategory)?.name}
                </span>
              </span>
            )}
          </p>

          {/* Active Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {categories.find((c) => c.id == selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Posts Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {filteredAndSortedPosts().length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {filteredAndSortedPosts().map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard post={post} isListView={viewMode === "list"} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Load More Button (if needed) */}
        {filteredAndSortedPosts().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg transition-colors"
            >
              Load More Articles
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
