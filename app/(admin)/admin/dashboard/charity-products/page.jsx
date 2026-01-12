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
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react";
import CharityProductForm from "@/components/inputs/CharityProductForm";
import useUserStore from "@/lib/stores/useUserStore";
import {
  useCharityProducts,
  useDeleteCharityProduct,
  useCharityProductsSubscription,
} from "@/lib/queries/charityQueries";

const CharityProductsDashboard = () => {
  const { user } = useUserStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");

  // React Query hooks
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useCharityProducts({
    searchTerm,
    category_id: filterCategory,
    condition: filterCondition,
  });

  const deleteProductMutation = useDeleteCharityProduct();

  // Subscribe to real-time updates
  useCharityProductsSubscription();

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this charity product?"))
      return;

    try {
      await deleteProductMutation.mutateAsync(productId);
    } catch (err) {
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

  return (
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
              onClick={() => refetch()}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh"}
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
              placeholder="Search charity products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Categories</option>
              {/* Map categories here */}
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
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-pulse text-gray-400">
                Loading charity products...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Heart className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No charity products found
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first charity item
              </p>
            </div>
          ) : (
            products.map((product) => {
              const progress = calculateProgress(
                product.current_donations,
                product.donation_goal
              );
              const expired = isExpired(product.charity_end_date);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-square">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="text-gray-400" size={48} />
                      </div>
                    )}

                    {/* Charity Badge */}
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                      <Heart size={14} />
                      Charity
                    </div>

                    {expired && (
                      <div className="absolute top-3 left-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Expired
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Donation Progress */}
                    {product.donation_goal && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <TrendingUp size={14} />
                            Raised
                          </span>
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(product.current_donations)} /{" "}
                            {formatCurrency(product.donation_goal)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-rose-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {progress.toFixed(0)}% of goal reached
                        </p>
                      </div>
                    )}

                    {/* Campaign End Date */}
                    {product.charity_end_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>
                          {expired ? "Ended" : "Ends"}:{" "}
                          {new Date(
                            product.charity_end_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Stock & Condition */}
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded ${
                          product.condition === "new"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {product.condition === "new" ? "New" : "Used"}
                      </span>
                      <span className="text-gray-600">
                        {product.stock_quantity} available
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteProductMutation.isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
    </div>
  );
};

export default CharityProductsDashboard;
