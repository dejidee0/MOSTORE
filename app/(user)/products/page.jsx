"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
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
  Car,
  Wrench,
  Smartphone,
  Monitor,
  Package,
} from "lucide-react";
import { getAllProducts, getAllCategories } from "@/lib/data/products";
import { ProductCard } from "@/components/ProductCard"; // Import the external ProductCard
import Link from "next/link";

// Helper function to get category icon
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes("vehicle") && name.includes("mobility"))
    return <Car className="w-4 h-4" />;
  if (name.includes("parts") || name.includes("accessories"))
    return <Wrench className="w-4 h-4" />;
  if (name.includes("electronics")) return <Smartphone className="w-4 h-4" />;
  if (name.includes("appliances")) return <Monitor className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
};

// Create a separate component that uses useSearchParams
const ProductsContent = () => {
  const { useSearchParams } = require("next/navigation");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters
  const categoryParam = searchParams.get("category");
  const searchQuery = searchParams.get("q");

  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchQuery || "",
    category: categoryParam || "all",
    priceRange: [0, 2000],
    rating: 0,
    inStock: false,
    featured: false,
    brand: "all",
    discount: false,
  });

  // UI states
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Advanced filter states
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: true,
    features: false,
  });

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update filters when URL params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery || "",
      category: categoryParam || "all",
    }));
  }, [searchQuery, categoryParam]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setCategoriesLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  // Advanced filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.categories?.name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== "all") {
        if (product.category_id !== filters.category) return false;
      }

      // Price range filter
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && product.rating < filters.rating) {
        return false;
      }

      // Stock filter
      if (filters.inStock && product.stock_quantity <= 0) {
        return false;
      }

      // Featured filter
      if (filters.featured && !product.is_featured) {
        return false;
      }

      // Brand filter
      if (filters.brand !== "all" && product.brand !== filters.brand) {
        return false;
      }

      // Discount filter
      if (filters.discount && !product.discount) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  // Sorting logic
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "discount":
        return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    // Update URL without navigation
    const newSearchParams = new URLSearchParams(searchParams);
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
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "all",
      priceRange: [0, 2000],
      rating: 0,
      inStock: false,
      featured: false,
      discount: false,
    });
    setCurrentPage(1);
    // Clear URL params
    window.history.replaceState({}, "", window.location.pathname);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // List View Product Card Component (for list view only)
  const ListViewProductCard = ({ product }) => {
    const discountedPrice = product.originalprice
      ? product.originalprice - product.price
      : 0;

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
            <img
              src={product.images?.[0] || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                -{product.discount}%
              </div>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
                    {product.categories?.name}
                  </span>
                  <span className="text-xs text-gray-500">{product.brand}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {product.name}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.short_description}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.total_reviews})
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3 mt-4 sm:mt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.originalprice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₦{product.originalprice.toLocaleString()}
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
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {filters.category !== "all"
                  ? categories.find((c) => c.id === filters.category)?.name +
                    " Products"
                  : "Our Products"}
              </h1>
              <p className="text-gray-600 mt-2">
                {filters.search
                  ? `Search results for "${filters.search}"`
                  : "Discover our curated collection of premium products"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {Object.values(filters).some(
                (f) =>
                  f !== "all" &&
                  f !== "" &&
                  f !== 0 &&
                  f !== false &&
                  !Array.isArray(f)
              ) && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-orange-100 text-orange-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-orange-100 text-orange-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Sidebar */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
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
                  </div>
                )}
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
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
                      <label
                        key={rating}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() => handleFilterChange("rating", rating)}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-1">
                          {renderStars(rating)}
                          <span className="text-sm text-gray-600">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Filters */}
              <div className="mb-6">
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
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {sortedProducts.length} products found
                  </span>
                  {(filters.search || filters.category !== "all") && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode Toggle - Desktop */}
                  <div className="hidden lg:flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg ${
                        viewMode === "grid"
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg ${
                        viewMode === "list"
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
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

            {/* Products Grid/List */}
            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                  >
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
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

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
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                currentPage === pageNum
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

// Main component that wraps ProductsContent in Suspense
const ProductsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
};

export default ProductsPage;
