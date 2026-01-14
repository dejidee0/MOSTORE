"use client";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { getAllCategories, getAllProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/ProductCard";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Validate product data
const isValidProduct = (product) => {
  return (
    product &&
    product.id &&
    product.name &&
    (product.product_type === "charity" || product.price != null)
  );
};

// Star Rating Component
const StarRating = memo(({ rating = 0 }) => {
  const validRating = Math.min(Math.max(0, rating), 5);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < validRating
              ? "fill-orange-400 text-orange-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
});
StarRating.displayName = "StarRating";

// List View Product Card
const ListViewProductCard = memo(({ product }) => {
  if (!product) return null;

  const isCharity = product.product_type === "charity";

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-48 sm:h-32 bg-gray-100 flex-shrink-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {isCharity && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
              <Gift className="w-3 h-3" /> Charity
            </div>
          )}
          {!isCharity && product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{product.discount}%
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {product.categories?.name && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
                  {product.categories.name}
                </span>
              )}
              {product.brand && (
                <span className="text-xs text-gray-500">{product.brand}</span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
              {product.name}
            </h3>

            {product.short_description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.short_description}
              </p>
            )}

            {product.location && (
              <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                <MapPin className="w-3 h-3" />
                <span>{product.location}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-3 mt-4 sm:mt-0">
            {!isCharity ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {product.price.toLocaleString()}€
                </span>
                {product.originalprice &&
                  product.originalprice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.originalprice.toLocaleString()}€
                    </span>
                  )}
              </div>
            ) : (
              <div className="text-sm font-medium text-green-600">
                Free to Good Home
              </div>
            )}

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Heart className="w-4 h-4" />
              </button>

              <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
              </button>

              <button
                className={`${
                  isCharity
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-orange-500 hover:bg-orange-600"
                } text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
              >
                {isCharity ? (
                  <>
                    <Gift className="w-4 h-4" /> Request
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ListViewProductCard.displayName = "ListViewProductCard";

// Loading Skeleton
const LoadingSkeleton = memo(() => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="w-full h-64 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

// Main Products Content Component
const ProductsContent = ({ categoryParam, searchQuery }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL params, default to 'all'
  const tabParam = searchParams.get("tab") || "all";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery || "");
  const [activeTab, setActiveTab] = useState(tabParam);

  const debouncedSearch = useDebounce(searchInput, 300);

  const [filters, setFilters] = useState(() => ({
    search: searchQuery || "",
    category: categoryParam || "all",
    priceRange: [0, 2000],
    rating: 0,
    inStock: false,
    featured: false,
    brand: "all",
    discount: false,
  }));

  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [expandedSections, setExpandedSections] = useState(() => ({
    price: true,
    rating: true,
    features: false,
  }));

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);

      const validProducts = (productsData || []).filter(isValidProduct);
      const validCategories = (categoriesData || []).filter(
        (cat) => cat && cat.id && cat.name
      );

      setProducts(validProducts);
      setCategories(validCategories);
    } catch (error) {
      console.error("Error loading data:", error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    const newFilters = {
      category: categoryParam || "all",
    };

    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, [categoryParam]);

  // Handle tab change with URL update
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setCurrentPage(1);

    const newSearchParams = new URLSearchParams(window.location.search);
    if (tab === "all") {
      newSearchParams.delete("tab");
    } else {
      newSearchParams.set("tab", tab);
    }

    const newUrl = `${window.location.pathname}?${newSearchParams}`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  // Filter products by tab first
  const tabFilteredProducts = useMemo(() => {
    if (!products.length) return [];

    if (activeTab === "charity") {
      return products.filter((p) => p.product_type === "charity");
    } else if (activeTab === "regular") {
      return products.filter(
        (p) => p.product_type === "regular" || !p.product_type
      );
    }

    return products;
  }, [products, activeTab]);

  const filteredProducts = useMemo(() => {
    if (!tabFilteredProducts.length) return [];

    return tabFilteredProducts.filter((product) => {
      if (!isValidProduct(product)) return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          product.name,
          product.description,
          product.brand,
          product.categories?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableFields.includes(searchLower)) return false;
      }

      if (filters.category !== "all") {
        if (String(product.category_id) !== String(filters.category)) {
          return false;
        }
      }

      // Price filter only for regular products
      if (product.product_type !== "charity") {
        if (
          product.price < filters.priceRange[0] ||
          product.price > filters.priceRange[1]
        ) {
          return false;
        }
      }

      if (filters.rating > 0 && (product.rating || 0) < filters.rating) {
        return false;
      }

      if (filters.inStock && (product.stock_quantity || 0) <= 0) {
        return false;
      }

      if (filters.featured && !product.is_featured) {
        return false;
      }

      if (filters.brand !== "all" && product.brand !== filters.brand) {
        return false;
      }

      // Discount filter only for regular products
      if (
        filters.discount &&
        product.product_type !== "charity" &&
        !(product.discount > 0)
      ) {
        return false;
      }

      return true;
    });
  }, [tabFilteredProducts, filters]);

  const sortedProducts = useMemo(() => {
    if (!filteredProducts.length) return [];

    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-high":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "name":
        return sorted.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
      case "discount":
        return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      case "newest":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
    }
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    const newSearchParams = new URLSearchParams(window.location.search);
    if (value) {
      newSearchParams.set("q", value);
    } else {
      newSearchParams.delete("q");
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${newSearchParams}`
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "all",
      priceRange: [0, 2000],
      rating: 0,
      inStock: false,
      featured: false,
      brand: "all",
      discount: false,
    });
    setSearchInput("");
    setCurrentPage(1);
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.delete("q");
    newSearchParams.delete("category");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${newSearchParams}`
    );
  }, []);

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => String(c.id) === String(filters.category));
  }, [categories, filters.category]);

  // Count products by type
  const productCounts = useMemo(() => {
    return {
      all: products.length,
      regular: products.filter(
        (p) => p.product_type === "regular" || !p.product_type
      ).length,
      charity: products.filter((p) => p.product_type === "charity").length,
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {filters.category !== "all" && selectedCategory
                    ? `${selectedCategory.name} Products`
                    : "Our Products"}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {filters.search
                    ? `Search results for "${filters.search}"`
                    : "Discover our curated collection of premium products"}
                </p>
              </div>

              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                />
                {searchInput && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => handleTabChange("all")}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === "all"
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Products
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {productCounts.all}
                </span>
                {activeTab === "all" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                )}
              </button>

              <button
                onClick={() => handleTabChange("regular")}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === "regular"
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Regular Products
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {productCounts.regular}
                </span>
                {activeTab === "regular" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                )}
              </button>

              <button
                onClick={() => handleTabChange("charity")}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === "charity"
                    ? "text-green-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Gift className="w-4 h-4 inline mr-2" />
                Charity Items
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {productCounts.charity}
                </span>
                {activeTab === "charity" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between lg:hidden mb-4">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {Object.entries(filters).some(([key, value]) => {
                if (key === "priceRange")
                  return value[0] > 0 || value[1] < 2000;
                return (
                  value !== "all" &&
                  value !== "" &&
                  value !== 0 &&
                  value !== false
                );
              }) && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </motion.button>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Grid3X3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Filters Sidebar - Only show price filter for non-charity tabs */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Filters
                    </h3>
                    <motion.button
                      onClick={clearAllFilters}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear All
                    </motion.button>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range - Hide for charity tab */}
                  {activeTab !== "charity" && (
                    <div className="mb-6">
                      <motion.button
                        onClick={() => toggleSection("price")}
                        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                      >
                        Price Range
                        {expandedSections.price ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </motion.button>
                      <AnimatePresence>
                        {expandedSections.price && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Min"
                                value={filters.priceRange[0]}
                                onChange={(e) =>
                                  handleFilterChange("priceRange", [
                                    parseInt(e.target.value) || 0,
                                    filters.priceRange[1],
                                  ])
                                }
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                              <span className="text-gray-400">-</span>
                              <input
                                type="number"
                                placeholder="Max"
                                value={filters.priceRange[1]}
                                onChange={(e) =>
                                  handleFilterChange("priceRange", [
                                    filters.priceRange[0],
                                    parseInt(e.target.value) || 2000,
                                  ])
                                }
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <motion.button
                      onClick={() => toggleSection("rating")}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                    >
                      Minimum Rating
                      {expandedSections.rating ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {expandedSections.rating && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="space-y-2">
                            {[4, 3, 2, 1].map((rating) => (
                              <label
                                key={rating}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="rating"
                                  checked={filters.rating === rating}
                                  onChange={() =>
                                    handleFilterChange("rating", rating)
                                  }
                                  className="text-orange-500"
                                />
                                <div className="flex items-center gap-1">
                                  <StarRating rating={rating} />
                                  <span className="text-sm text-gray-600">
                                    & up
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <motion.button
                      onClick={() => toggleSection("features")}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                    >
                      Features
                      {expandedSections.features ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {expandedSections.features && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.inStock}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "inStock",
                                    e.target.checked
                                  )
                                }
                                className="text-orange-500 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                In Stock Only
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.featured}
                                onChange={(e) =>
                                  handleFilterChange(
                                    "featured",
                                    e.target.checked
                                  )
                                }
                                className="text-orange-500 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                Featured Products
                              </span>
                            </label>
                            {activeTab !== "charity" && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.discount}
                                  onChange={(e) =>
                                    handleFilterChange(
                                      "discount",
                                      e.target.checked
                                    )
                                  }
                                  className="text-orange-500 rounded"
                                />
                                <span className="text-sm text-gray-700">
                                  On Sale
                                </span>
                              </label>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Filters - Similar structure */}
          <motion.div
            className="hidden lg:block lg:w-80"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price - Hide for charity */}
                {activeTab !== "charity" && (
                  <div>
                    <button
                      onClick={() => toggleSection("price")}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                    >
                      Price Range
                      {expandedSections.price ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.price && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.priceRange[0]}
                          onChange={(e) =>
                            handleFilterChange("priceRange", [
                              parseInt(e.target.value) || 0,
                              filters.priceRange[1],
                            ])
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.priceRange[1]}
                          onChange={(e) =>
                            handleFilterChange("priceRange", [
                              filters.priceRange[0],
                              parseInt(e.target.value) || 2000,
                            ])
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Rating */}
                <div>
                  <button
                    onClick={() => toggleSection("rating")}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                  >
                    Minimum Rating
                    {expandedSections.rating ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.rating && (
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.rating === rating}
                            onChange={() =>
                              handleFilterChange("rating", rating)
                            }
                          />
                          <StarRating rating={rating} />
                          <span className="text-sm">& up</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <button
                    onClick={() => toggleSection("features")}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                  >
                    Features
                    {expandedSections.features ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.features && (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) =>
                            handleFilterChange("inStock", e.target.checked)
                          }
                        />
                        <span className="text-sm">In Stock Only</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.featured}
                          onChange={(e) =>
                            handleFilterChange("featured", e.target.checked)
                          }
                        />
                        <span className="text-sm">Featured Products</span>
                      </label>
                      {activeTab !== "charity" && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.discount}
                            onChange={(e) =>
                              handleFilterChange("discount", e.target.checked)
                            }
                          />
                          <span className="text-sm">On Sale</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {sortedProducts.length} products found
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg ${
                        viewMode === "grid"
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg ${
                        viewMode === "list"
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="newest">Newest First</option>
                    {activeTab !== "charity" && (
                      <>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="discount">Biggest Discount</option>
                      </>
                    )}
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {paginatedProducts.map((product) =>
                    viewMode === "grid" ? (
                      <ProductCard key={product.id} product={product} />
                    ) : (
                      <ListViewProductCard key={product.id} product={product} />
                    )
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2)
                            pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 text-sm rounded-lg ${
                                currentPage === pageNum
                                  ? "bg-orange-500 text-white"
                                  : "border"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsContent;
