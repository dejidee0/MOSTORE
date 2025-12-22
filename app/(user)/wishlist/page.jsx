"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Package,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useWishlist } from "@/hooks/useWishlist";

const WishlistPage = () => {
  const router = useRouter();
  const {
    items,
    loading,
    isAuthenticated,
    hasItems,
    totalItems,
    removeItem,
    clearAll,
  } = useWishlist();
  const { addItem: addToCart } = useCart();

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // ==========================================
  // HYDRATION FIX
  // ==========================================
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ==========================================
  // MEMOIZED CALCULATIONS
  // ==========================================
  const selectedCount = useMemo(() => selectedItems.size, [selectedItems]);

  const allSelected = useMemo(
    () => items.length > 0 && selectedItems.size === items.length,
    [items.length, selectedItems.size]
  );

  // ==========================================
  // SELECTION HANDLERS
  // FIXED: Use useCallback to prevent re-renders
  // ==========================================
  const toggleSelectItem = useCallback((itemId) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  }, [allSelected, items]);

  // ==========================================
  // CART ACTIONS
  // FIXED: Proper error handling and feedback
  // ==========================================
  const addSelectedToCart = useCallback(async () => {
    if (selectedCount === 0) {
      toast.error("Please select items to add to cart");
      return;
    }

    const selectedProducts = items.filter((item) => selectedItems.has(item.id));

    let successCount = 0;
    let failedProducts = [];

    for (const item of selectedProducts) {
      // FIXED: Validate product data before adding
      if (!item.product || !item.product.id) {
        failedProducts.push(item.product?.name || "Unknown");
        continue;
      }

      const success = addToCart(item.product, 1);
      if (success) {
        successCount++;
      } else {
        failedProducts.push(item.product.name);
      }
    }

    if (successCount > 0) {
      toast.success(
        `Added ${successCount} item${successCount !== 1 ? "s" : ""} to cart`
      );
      setSelectedItems(new Set());
    }

    if (failedProducts.length > 0) {
      toast.error(
        `Failed to add ${failedProducts.length} item${
          failedProducts.length !== 1 ? "s" : ""
        }`
      );
    }
  }, [selectedCount, items, selectedItems, addToCart]);

  const addAllToCart = useCallback(async () => {
    if (items.length === 0) return;

    let successCount = 0;
    let failedProducts = [];

    for (const item of items) {
      // FIXED: Validate product data before adding
      if (!item.product || !item.product.id) {
        failedProducts.push(item.product?.name || "Unknown");
        continue;
      }

      const success = addToCart(item.product, 1);
      if (success) {
        successCount++;
      } else {
        failedProducts.push(item.product.name);
      }
    }

    if (successCount > 0) {
      toast.success(
        `Added ${successCount} item${successCount !== 1 ? "s" : ""} to cart`
      );
    }

    if (failedProducts.length > 0) {
      toast.error(
        `Failed to add ${failedProducts.length} item${
          failedProducts.length !== 1 ? "s" : ""
        }`
      );
    }
  }, [items, addToCart]);

  const handleClearWishlist = useCallback(async () => {
    if (isClearing) return;

    setIsClearing(true);
    const success = await clearAll();
    if (success) {
      setSelectedItems(new Set());
    }
    setIsClearing(false);
  }, [isClearing, clearAll]);

  // ==========================================
  // LOADING SKELETON
  // ==========================================
  if (!isMounted || loading) {
    return <WishlistSkeleton />;
  }

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return <NotAuthenticatedView />;
  }

  // ==========================================
  // EMPTY WISHLIST
  // ==========================================
  if (!hasItems) {
    return <EmptyWishlistView router={router} />;
  }

  // ==========================================
  // MAIN WISHLIST VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {totalItems} item{totalItems !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>

          <button
            onClick={handleClearWishlist}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear all items"
          >
            {isClearing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clear All
          </button>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={selectAllItems}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  aria-label="Select all items"
                />
                <span className="text-sm font-medium">
                  {allSelected ? "Deselect All" : "Select All"} ({selectedCount}{" "}
                  selected)
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={addSelectedToCart}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Add ${selectedCount} selected items to cart`}
              >
                <ShoppingCart className="w-4 h-4" />
                Add Selected to Cart
              </button>

              <button
                onClick={addAllToCart}
                className="flex items-center gap-2 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                aria-label="Add all items to cart"
              >
                <Plus className="w-4 h-4" />
                Add All to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              onToggleSelect={() => toggleSelectItem(item.id)}
              onRemove={() => removeItem(item.product_id)}
              onAddToCart={() => addToCart(item.product, 1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// WISHLIST ITEM CARD COMPONENT
// FIXED: Better performance and error handling
// ==========================================
const WishlistItemCard = React.memo(
  ({ item, isSelected, onToggleSelect, onRemove, onAddToCart }) => {
    const [isRemoving, setIsRemoving] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const product = item.product;

    // FIXED: Validate product data
    if (!product || !product.id) {
      return null;
    }

    const handleRemove = async () => {
      if (isRemoving) return;

      setIsRemoving(true);
      await onRemove();
      setIsRemoving(false);
    };

    const handleAddToCart = async () => {
      if (isAddingToCart) return;

      setIsAddingToCart(true);
      const success = await onAddToCart();

      if (success) {
        toast.success(`Added "${product.name}" to cart`, {
          duration: 2000,
        });
      } else {
        toast.error("Failed to add to cart");
      }

      setIsAddingToCart(false);
    };

    // FIXED: Safe image access
    const productImage =
      product.images && product.images.length > 0
        ? product.images[0]
        : "/placeholder-product.jpg";

    // FIXED: Safe price display
    const displayPrice = product.price
      ? `€${parseFloat(product.price).toFixed(2)}`
      : "€0.00";

    const originalPrice =
      product.originalprice && product.originalprice > product.price
        ? `€${parseFloat(product.originalprice).toFixed(2)}`
        : null;

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group relative">
        {/* Selection Checkbox */}
        <div className="absolute top-3 left-3 z-10">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              aria-label={`Select ${product.name}`}
            />
          </label>
        </div>

        {/* Remove Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Remove ${product.name} from wishlist`}
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Product Image */}
        <Link href={`/products/${product.slug || product.id}`}>
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={productImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              {displayPrice}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice}
              </span>
            )}
            {product.discount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.stock_quantity <= 0 && (
            <p className="text-sm text-red-600 mb-3">Out of Stock</p>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_quantity <= 0}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            {isAddingToCart ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {product.stock_quantity <= 0 ? "Out of Stock" : "Add to Cart"}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
);

WishlistItemCard.displayName = "WishlistItemCard";

// ==========================================
// LOADING SKELETON COMPONENT
// ==========================================
const WishlistSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// NOT AUTHENTICATED VIEW COMPONENT
// ==========================================
const NotAuthenticatedView = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center px-4">
      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Sign in to view your wishlist
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Save your favorite items and access them anywhere
      </p>
      <Link
        href="/sign-in"
        className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
      >
        Sign In
      </Link>
    </div>
  </div>
);

// ==========================================
// EMPTY WISHLIST VIEW COMPONENT
// ==========================================
const EmptyWishlistView = ({ router }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
      </div>

      {/* Empty State */}
      <div className="text-center py-16">
        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your wishlist is empty
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Start adding products you love to your wishlist. It's a great way to
          keep track of items you want to buy later.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          <Package className="w-5 h-5" />
          Browse Products
        </Link>
      </div>
    </div>
  </div>
);

export default WishlistPage;
