"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  ArrowRight,
  Star,
  Grid,
  List,
  ChevronDown,
  X,
  ImageIcon,
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

  const POSTS_PER_PAGE = 12;

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

  const paginatedPosts = useMemo(() => {
    return filteredAndSortedPosts.slice(0, page * POSTS_PER_PAGE);
  }, [filteredAndSortedPosts, page]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
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
              images,
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
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getPostImage = useCallback((post) => {
    if (post.featured_image) {
      return post.featured_image;
    }

    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images[0].url;
    }

    return null;
  }, []);

  const PostCard = React.memo(({ post, isListView = false }) => {
    const postImage = getPostImage(post);
    const imageCount =
      post.images && Array.isArray(post.images) ? post.images.length : 0;

    return (
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
          {postImage ? (
            <>
              <img
                src={postImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {imageCount > 1 && (
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    <ImageIcon className="w-3 h-3" />
                    {imageCount}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <div className="text-orange-500 text-4xl font-bold">
                {post.title?.charAt(0) || "B"}
              </div>
            </div>
          )}

          {post.blog_categories?.name && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full">
                {post.blog_categories.name}
              </span>
            </div>
          )}

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
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <p>{formatDate(post.published_at)}</p>
              {post.read_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.read_time} min read</span>
                </div>
              )}
            </div>

            <h3
              className={`font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors ${
                isListView ? "text-xl" : "text-base"
              }`}
            >
              {post.title}
            </h3>

            {post.excerpt && (
              <p
                className={`text-sm text-gray-600 mb-4 ${
                  isListView ? "line-clamp-3" : "line-clamp-2"
                }`}
              >
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatCount(post.views_count || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{formatCount(post.likes_count || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{formatCount(post.comments_count || 0)}</span>
              </div>
            </div>

            <motion.div
              whileHover={{ x: 3 }}
              className="text-orange-600 font-medium flex items-center gap-1"
            >
              Read More
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </motion.article>
    );
  });

  PostCard.displayName = "PostCard";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-16 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Our Latest News
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Explore {posts.length} articles and insights
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer transition-all outline-none min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer transition-all outline-none min-w-[180px]"
              >
                <option value="latest">Latest First</option>
                <option value="popular">Most Popular</option>
                <option value="liked">Most Liked</option>
                <option value="commented">Most Commented</option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid view"
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
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
        >
          <p className="text-gray-600 text-sm">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(paginatedPosts.length, filteredAndSortedPosts.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {filteredAndSortedPosts.length}
            </span>{" "}
            articles
            {selectedCategory && (
              <span className="ml-2">
                in{" "}
                <span className="font-medium text-orange-600">
                  {categories.find((c) => c.id == selectedCategory)?.name}
                </span>
              </span>
            )}
          </p>

          {(searchTerm || selectedCategory) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
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
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {categories.find((c) => c.id == selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

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
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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
                    <Link href={`/blog/${post.slug}`}>
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
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any articles matching your criteria. Try
                  adjusting your search terms or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {paginatedPosts.length < filteredAndSortedPosts.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
            >
              Load More Articles (
              {filteredAndSortedPosts.length - paginatedPosts.length} remaining)
            </motion.button>
          </motion.div>
        )}

        {paginatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {posts.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Articles</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {categories.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Categories</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCount(
                    posts.reduce(
                      (sum, post) => sum + (post.views_count || 0),
                      0
                    )
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Views</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCount(
                    posts.reduce(
                      (sum, post) => sum + (post.likes_count || 0),
                      0
                    )
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Likes</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
