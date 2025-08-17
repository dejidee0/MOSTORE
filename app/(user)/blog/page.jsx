"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  User,
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const POSTS_PER_PAGE = 12;

  // Memoized filtered and sorted posts for performance
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      const matchesSearch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt &&
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        !selectedCategory ||
        (post.blog_categories && post.blog_categories.id == selectedCategory);
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "popular":
        return filtered.sort(
          (a, b) => (b.views_count || 0) - (a.views_count || 0)
        );
      case "liked":
        return filtered.sort(
          (a, b) => (b.likes_count || 0) - (a.likes_count || 0)
        );
      case "commented":
        return filtered.sort(
          (a, b) => (b.comments_count || 0) - (a.comments_count || 0)
        );
      default:
        return filtered.sort(
          (a, b) => new Date(b.published_at) - new Date(a.published_at)
        );
    }
  }, [posts, searchTerm, selectedCategory, sortBy]);

  // Memoized paginated posts
  const paginatedPosts = useMemo(() => {
    return filteredAndSortedPosts.slice(0, page * POSTS_PER_PAGE);
  }, [filteredAndSortedPosts, page]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories and posts in parallel for better performance
        const [categoriesResponse, postsResponse] = await Promise.all([
          supabase.from("blog_categories").select(`
            id,
            name,
            slug,
            description
          `),
          supabase
            .from("blog_posts")
            .select(
              `
              id,
              title,
              slug,
              excerpt,
              featured_image,
              is_featured,
              read_time,
              views_count,
              likes_count,
              comments_count,
              published_at,
              blog_categories (
                id,
                name,
                slug
              )
            `
            )
            .eq("status", "published")
            .order("published_at", { ascending: false }),
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (postsResponse.error) throw postsResponse.error;

        // Calculate category counts efficiently
        const categoryCount = {};
        postsResponse.data.forEach((post) => {
          if (post.blog_categories) {
            const catId = post.blog_categories.id;
            categoryCount[catId] = (categoryCount[catId] || 0) + 1;
          }
        });

        const categoriesWithCount = categoriesResponse.data.map((cat) => ({
          ...cat,
          count: categoryCount[cat.id] || 0,
        }));

        setCategories(categoriesWithCount);
        setPosts(postsResponse.data);
        setHasMore(postsResponse.data.length > POSTS_PER_PAGE);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const formatCount = useCallback((count) => {
    if (!count) return "0";
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
  }, []);

  const PostCard = React.memo(({ post, isListView = false }) => (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 ${
        isListView ? "flex gap-6" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          isListView ? "w-80 flex-shrink-0" : "h-48"
        }`}
      >
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-gray-400 text-4xl font-bold">
              {post.title?.charAt(0) || "B"}
            </div>
          </div>
        )}

        {/* Category Badge */}
        {post.blog_categories?.name && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
              {post.blog_categories.name}
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {post.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          </div>
        )}
      </div>

      <div
        className={`p-5 ${
          isListView ? "flex-1 flex flex-col justify-between" : ""
        }`}
      >
        <div>
          {/* Date */}
          <p className="text-xs text-gray-500 mb-3">
            {formatDate(post.published_at)}
          </p>

          {/* Title */}
          <h3
            className={`font-bold text-gray-900 mb-3 line-clamp-3 min-h-[60px] hover:text-orange-600 transition-colors ${
              isListView ? "text-xl" : "text-sm"
            }`}
          >
            {post.title.toUpperCase()}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-gray-600 mb-4 line-clamp-3">
            {post.excerpt ||
              "Discover the latest insights and updates in our comprehensive blog post covering important topics and expert analysis."}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-1">author</span>
              <span className="mr-1">by</span>
              <span className="font-medium text-gray-700">admin</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-1">comment</span>
            <span className="font-medium text-gray-700">
              {post.comments_count || 0} comment
              {(post.comments_count || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  ));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-16 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Our Latest News
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Explore all our articles and insights
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer transition-all"
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
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer transition-all"
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

        {/* Results Count & Active Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
        >
          <p className="text-gray-600 text-sm">
            Showing{" "}
            {Math.min(paginatedPosts.length, filteredAndSortedPosts.length)} of{" "}
            {filteredAndSortedPosts.length} articles
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
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
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
            {paginatedPosts.length > 0 ? (
              <motion.div
                key={`${viewMode}-${searchTerm}-${selectedCategory}-${sortBy}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                    : "space-y-6"
                }
              >
                {paginatedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <Link href={`/blog/${post.id}`}>
                      <PostCard post={post} isListView={viewMode === "list"} />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
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
                  onClick={clearFilters}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Load More Button */}
        {paginatedPosts.length < filteredAndSortedPosts.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoadMore}
              className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg transition-all shadow-sm hover:shadow-md"
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
