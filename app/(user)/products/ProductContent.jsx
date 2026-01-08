"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  Suspense,
} from "react";
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
} from "lucide-react";
import { getAllProducts, getAllCategories } from "@/lib/data/products";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

// Debounce hook for search optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Validate product data
const isValidProduct = (product) => {
  return (
    product &&
    product.id &&
    product.name &&
    product.price != null &&
    typeof product.price === "number"
  );
};

// Memoized star rating component
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

// Memoized List View Product Card Component

const ListViewProductCard = memo(({ product }) => {
  if (!product) return null;

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
          {product.discount > 0 && (
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

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Heart className="w-4 h-4" />
              </button>

              <Link href={`/products/${product.id}`}>
                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </Link>

              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ListViewProductCard.displayName = "ListViewProductCard";

// Loading skeleton component
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

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery || "");

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
    const newFilters = {
      category: categoryParam || "all",
    };

    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, [categoryParam]);

  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter((product) => {
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

      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
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

      if (filters.discount && !(product.discount > 0)) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

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
    window.history.replaceState({}, "", window.location.pathname);
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
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
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

                  <div className="mb-6">
                    <motion.button
                      onClick={() => toggleSection("price")}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                          transition={{ duration: 0.2 }}
                        >
                          <div className="space-y-3">
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
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
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
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mb-6">
                    <motion.button
                      onClick={() => toggleSection("rating")}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                          transition={{ duration: 0.2 }}
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
                                  className="text-orange-500 focus:ring-orange-500"
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

                  <div className="mb-6">
                    <motion.button
                      onClick={() => toggleSection("features")}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                          transition={{ duration: 0.2 }}
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
                                className="text-orange-500 focus:ring-orange-500 rounded"
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
                                className="text-orange-500 focus:ring-orange-500 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                Featured Products
                              </span>
                            </label>
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
                                className="text-orange-500 focus:ring-orange-500 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                On Sale
                              </span>
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="hidden lg:block lg:w-80"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <motion.button
                  onClick={clearAllFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                </motion.button>
              </div>

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

              <div className="mb-6">
                <motion.button
                  onClick={() => toggleSection("price")}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-3">
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
                            className="max-w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
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
                            className="max-w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-6">
                <motion.button
                  onClick={() => toggleSection("rating")}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                      transition={{ duration: 0.2 }}
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
                              className="text-orange-500 focus:ring-orange-500"
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

              <div className="mb-6">
                <motion.button
                  onClick={() => toggleSection("features")}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.inStock}
                            onChange={(e) =>
                              handleFilterChange("inStock", e.target.checked)
                            }
                            className="text-orange-500 focus:ring-orange-500 rounded"
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
                              handleFilterChange("featured", e.target.checked)
                            }
                            className="text-orange-500 focus:ring-orange-500 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            Featured Products
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.discount}
                            onChange={(e) =>
                              handleFilterChange("discount", e.target.checked)
                            }
                            className="text-orange-500 focus:ring-orange-500 rounded"
                          />
                          <span className="text-sm text-gray-700">On Sale</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {sortedProducts.length} products found
                  </span>
                  {(filters.search || filters.category !== "all") && (
                    <motion.button
                      onClick={clearAllFilters}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear filters
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-2">
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

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <motion.div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </motion.div>
            ) : sortedProducts.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <motion.button
                  onClick={clearAllFilters}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {paginatedProducts.map((product) =>
                    viewMode === "grid" ? (
                      <ProductCard key={product.id} product={product} />
                    ) : (
                      <ListViewProductCard key={product.id} product={product} />
                    )
                  )}
                </motion.div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <motion.button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <motion.button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                currentPage === pageNum
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        }
                      )}

                      <motion.button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Next
                      </motion.button>
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
