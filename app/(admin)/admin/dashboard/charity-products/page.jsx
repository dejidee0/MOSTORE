"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Package,
  Eye,
  Edit,
  Trash2,
  Filter,
  Heart,
  TrendingUp,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  X as XIcon,
  Tag,
  User,
} from "lucide-react";
import CharityProductForm from "@/components/inputs/CharityProductForm";
import useUserStore from "@/lib/stores/useUserStore";
import {
  useCharityProducts,
  useDeleteCharityProduct,
  useCharityProductsSubscription,
} from "@/lib/queries/charityQueries";
import RichContentRenderer from "@/components/rich-text-renderer";
import { useCurrentAdmin, useCurrentUser } from "@/hooks/use-auth";

const CharityProductsDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false); // Add this state

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  const userId = user?.id;

  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useCurrentAdmin({ userId });

  const vendorId = vendor?.id;
  const admin = true;

  // React Query hooks
  const {
    data: products = [],
    isLoading,
    error,
    isFetching,
    refetch,
  } = useCharityProducts(
    {
      searchTerm,
      category_id: filterCategory,
      condition: filterCondition,
    },
    admin,
    vendorId,
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      // Optional: Show success toast/notification here
    } catch (err) {
      console.error("Refresh failed:", err);
      // Optional: Show error toast/notification here
    } finally {
      // Add a small delay for better UX feedback
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const deleteProductMutation = useDeleteCharityProduct();

  // Subscribe to real-time updates
  useCharityProductsSubscription();

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this charity product?"))
      return;

    try {
      await deleteProductMutation.mutateAsync(productId);
      // Show success message
      alert("Charity product deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product: " + err.message);
    }
  };

  const calculateProgress = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return {
        text: "Out of Stock",
        class: "text-red-600 bg-red-50 px-2 py-1 rounded",
      };
    if (quantity <= 10)
      return {
        text: "Low Stock",
        class: "text-yellow-600 bg-yellow-50 px-2 py-1 rounded",
      };
    return {
      text: "In Stock",
      class: "text-green-600 bg-green-50 px-2 py-1 rounded",
    };
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Extract unique categories from products
  const categories = [
    ...new Set(products.map((p) => p.categories?.name).filter(Boolean)),
  ];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "" ||
      filterCategory === "All" ||
      product?.categories?.name === filterCategory;
    const matchesCondition =
      filterCondition === "" || product?.condition === filterCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  // Pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Product Detail Modal Component
  const ProductDetailModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const stockStatus = getStockStatus(product.stock_quantity);
    const progress = calculateProgress(
      product.current_donations,
      product.donation_goal,
    );
    const expired = isExpired(product.charity_end_date);

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-rose-600 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  Charity Product Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-gray-400" size={64} />
                      </div>
                    )}
                  </div>
                  {product.images && product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(1, 5).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    {product.brand && (
                      <p className="text-lg text-gray-600">{product.brand}</p>
                    )}
                  </div>

                  {/* Charity Badge */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 text-white px-4 py-2 rounded-full font-medium">
                    <Heart size={18} />
                    Charity Item
                  </div>

                  {/* Donation Progress */}
                  {product.donation_goal && (
                    <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium flex items-center gap-2">
                          <TrendingUp size={18} />
                          Donation Progress
                        </span>
                        <span className="font-bold text-orange-600 text-lg">
                          {formatCurrency(product.current_donations)} /{" "}
                          {formatCurrency(product.donation_goal)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-rose-600 h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {progress.toFixed(0)}% of goal reached
                      </p>
                    </div>
                  )}

                  {/* Campaign End Date */}
                  {product.charity_end_date && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={18} />
                      <span className="font-medium">
                        Campaign {expired ? "Ended" : "Ends"}:{" "}
                        {new Date(
                          product.charity_end_date,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Stock & Condition */}
                  <div className="flex items-center gap-2">
                    <span className={stockStatus.class}>
                      {stockStatus.text}
                    </span>
                    <span className="text-gray-600">
                      {product.stock_quantity} units available
                    </span>
                  </div>

                  {/* Meta Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="text-gray-400" size={16} />
                      <span className="text-gray-600">SKU: {product.sku}</span>
                    </div>
                    {product.profiles && (
                      <div className="flex items-center gap-2">
                        <User className="text-gray-400" size={16} />
                        <span className="text-gray-600">
                          Donor: {product.profiles.username}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Package className="text-gray-400" size={16} />
                      <span className="text-gray-600">
                        Category: {product.categories?.name || "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="text-gray-400" size={16} />
                      <span className="text-gray-600">
                        Condition:{" "}
                        <span
                          className={`font-medium ${
                            product.condition === "new"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {product.condition === "new" ? "New" : "Used"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Description
                </h3>

                <RichContentRenderer content={product.description} />
              </div>

              {/* Variants */}
              {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.colors?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Available Colors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.sizes?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Available Sizes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    product.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
                {product.is_featured && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                    Featured
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    product.condition === "new"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {product.condition === "new" ? "Brand New" : "Pre-Owned"}
                </span>
                {expired && (
                  <span className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm font-medium">
                    Campaign Expired
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Product Card Component
  const MobileProductCard = ({ product }) => {
    const stockStatus = getStockStatus(product.stock_quantity);
    const progress = calculateProgress(
      product.current_donations,
      product.donation_goal,
    );

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center relative">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-16 w-16 object-cover rounded-lg"
              />
            ) : (
              <Package className="text-gray-400" size={20} />
            )}
            <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-1">
              <Heart size={12} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            {product.profiles && (
              <p className="text-sm text-gray-500">
                {product.profiles.username}
              </p>
            )}
            <p className="text-sm text-gray-500">{product.sku}</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  product.condition === "new"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {product.condition === "new" ? "New" : "Used"}
              </span>
            </div>
            {product.donation_goal && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-rose-600 h-1.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.toFixed(0)}% funded
                </p>
              </div>
            )}
            <div className="mt-2">
              <span className={stockStatus.class}>{stockStatus.text}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span
            className={`text-xs px-2 py-1 rounded ${
              product.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {product.is_active ? "Active" : "Inactive"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => viewProductDetails(product)}
              className="p-1 text-orange-600 hover:text-orange-900"
              title="View"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => editProduct(product)}
              className="p-1 text-blue-600 hover:text-blue-900"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="p-1 text-red-600 hover:text-red-900"
              title="Delete"
              disabled={deleteProductMutation.isPending}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
                <Heart className="w-10 h-10 text-orange-500" />
                Charity Products Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage charity items ({products.length} products)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isFetching}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isRefreshing || isFetching
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md "
                }`}
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing || isFetching ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isRefreshing || isFetching ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Add Charity Product
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">Error: {error.message}</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search charity products by name, brand, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
              />
            </div>

            <div className={`${showFilters ? "block" : "hidden"} sm:block`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Filter size={18} />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
            </div>
          </div>

          {/* Products Table/Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse text-gray-400">
                  Loading charity products...
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No charity products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {products.length === 0
                    ? "Start by adding your first charity item"
                    : "Try adjusting your search or filter criteria"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Donor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded-lg"
                                  />
                                ) : (
                                  <Package
                                    className="text-gray-400"
                                    size={20}
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.sku}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.category_name || "Uncategorized"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.profiles?.username || "No vendor"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.condition === "new"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {product.condition === "new" ? "New" : "Used"}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={
                                getStockStatus(product.stock_quantity).class
                              }
                            >
                              {getStockStatus(product.stock_quantity).text} (
                              {product.stock_quantity})
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.is_active ? (
                                <span className="flex items-center gap-1">
                                  <Check size={14} /> Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <XIcon size={14} /> Inactive
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => viewProductDetails(product)}
                                className="text-orange-600 hover:text-orange-900"
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => editProduct(product)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4">
                  {currentItems.map((product) => (
                    <MobileProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {indexOfFirstItem + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, totalItems)}
                        </span>{" "}
                        of <span className="font-medium">{totalItems}</span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">First</span>
                          <ChevronsLeft size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft size={16} />
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
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight size={16} />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Last</span>
                          <ChevronsRight size={16} />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      {/* Form Modal */}
      {showForm && (
        <CharityProductForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          productToEdit={editingProduct}
          user={user}
        />
      )}
    </>
  );
};

export default CharityProductsDashboard;
