"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Package,
  Eye,
  Edit,
  Trash2,
  Star,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  X as XIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import ProductForm from "@/components/inputs/ProductsForm";
import { Tag } from "lucide-react";
import { Calendar } from "lucide-react";
import useUserStore from "@/lib/stores/useUserStore";

const ProductDashboard = () => {
  const { user } = useUserStore();
  const [prodUpload, setProdUpload] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `
        )
        .eq("supplier_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const productsWithCategory = data.map((product) => ({
        ...product,
        category_name: product.categories?.name || "Uncategorized",
      }));

      setProducts(productsWithCategory);

      const uniqueCategories = [
        ...new Set(
          productsWithCategory.map((p) => p.category_name).filter(Boolean)
        ),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const deleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product: " + error.message);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", productId);

      if (error) throw error;

      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, is_active: !currentStatus } : p
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update product: " + error.message);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "" ||
      filterCategory === "All" ||
      product?.category_name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    }).format(price);
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
    setProdUpload(true);
  };

  const ProductDetailModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const stockStatus = getStockStatus(product.stock_quantity);

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Product Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-8">
              {/* Product Images and Basic Info */}
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
                            alt={` ₦{product.name}  ₦{index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    {product.brand && (
                      <p className="text-lg text-gray-600">{product.brand}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalprice &&
                      product.originalprice > product.price && (
                        <span className="text-xl text-gray-500 line-through">
                          {formatPrice(product.originalprice)}
                        </span>
                      )}
                    {product.discount && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
                        -{product.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={
                              i < product.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">
                        {product.rating}/5 ({product.total_reviews || 0}{" "}
                        reviews)
                      </span>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center gap-4">
                    <span className={stockStatus.class}>
                      {stockStatus.text}
                    </span>
                    <span className="text-gray-600">
                      {product.stock_quantity} units available
                    </span>
                  </div>

                  {/* SKU and Category */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="text-gray-400" size={16} />
                      <span className="text-gray-600">SKU: {product.sku}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="text-gray-400" size={16} />
                      <span className="text-gray-600">
                        Category: {product.category_name || "Uncategorized"}
                      </span>
                    </div>
                    {product.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={16} />
                        <span className="text-gray-600">
                          Added:{" "}
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {product.updated_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={16} />
                        <span className="text-gray-600">
                          Updated:{" "}
                          {new Date(product.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Description
                </h3>
                <div className="space-y-3">
                  {product.short_description && (
                    <p className="text-lg text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {product.short_description}
                    </p>
                  )}
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Colors and Sizes */}
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
                    Featured Product
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Product Card for responsive view
  const MobileProductCard = ({ product }) => {
    const stockStatus = getStockStatus(product.stock_quantity);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-16 w-16 object-cover rounded-lg"
              />
            ) : (
              <Package className="text-gray-400" size={20} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.sku}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-medium">{formatPrice(product.price)}</span>
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
              className={`p-1 ${
                product.is_active
                  ? "text-yellow-600 hover:text-yellow-900"
                  : "text-green-600 hover:text-green-900"
              }`}
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => deleteProduct(product.id)}
              className="p-1 text-red-600 hover:text-red-900"
              title="Delete"
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Products Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your product catalog ({products.length} products)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProdUpload(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products by name, brand, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Filters */}
          <div className={`${showFilters ? "block" : "hidden"} sm:block`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-pulse text-gray-400">
                Loading products...
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0
                  ? "Start by adding your first product to the catalog."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
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
                                <Package className="text-gray-400" size={20} />
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
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                          {product.originalprice && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.originalprice)}
                            </div>
                          )}
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
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
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

              {/* Mobile List */}
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
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                        }
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
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

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      {/* Product Form Modal */}
      {prodUpload && (
        <ProductForm
          isOpen={prodUpload}
          onClose={() => {
            setProdUpload(false);
            setEditingProduct(null);
          }}
          productToEdit={editingProduct}
        />
      )}
    </>
  );
};

export default ProductDashboard;
