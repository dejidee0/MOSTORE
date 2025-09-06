"use client";
import React, { useState, useEffect } from "react";
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
  const { items, removeItem, clearAll, loading, isAuthenticated } =
    useWishlist();
  const { addItem } = useCart(); // Changed from addToCart to addItem

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
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
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to view your wishlist
          </h2>
          <p className="text-gray-600 mb-6">
            Save your favorite items and access them anywhere
          </p>
          <Link
            href="/sign-in"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
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
  }

  const toggleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const addSelectedToCart = async () => {
    const selectedProducts = items.filter((item) => selectedItems.has(item.id));

    if (selectedProducts.length === 0) {
      toast.error("Please select items to add to cart");
      return;
    }

    let successCount = 0;

    for (const item of selectedProducts) {
      // Format product data properly for cart
      const cartItem = {
        id: item.product_id || item.product?.id,
        name: item.product?.name,
        price: item.product?.price,
        image: item.product?.images?.[0],
        ...item.product,
      };

      const success = addItem(cartItem, 1);
      if (success) {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Added ${successCount} item(s) to cart`);
      setSelectedItems(new Set());
    }
  };

  const addAllToCart = async () => {
    if (items.length === 0) return;

    let successCount = 0;

    for (const item of items) {
      // Format product data properly for cart
      const cartItem = {
        id: item.product_id || item.product?.id,
        name: item.product?.name,
        price: item.product?.price,
        image: item.product?.images?.[0],
        ...item.product,
      };

      const success = addItem(cartItem, 1);
      if (success) {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Added ${successCount} item(s) to cart`);
    }
  };

  const handleClearWishlist = async () => {
    setIsClearing(true);
    await clearAll();
    setIsClearing(false);
    setSelectedItems(new Set());
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              Start adding products you love to your wishlist. It's a great way
              to keep track of items you want to buy later.
            </p>
            <Link
              href="/products"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {items.length} item{items.length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>

          <button
            onClick={handleClearWishlist}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
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
                  checked={selectedItems.size === items.length}
                  onChange={selectAllItems}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium">
                  Select All ({selectedItems.size} selected)
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={addSelectedToCart}
                disabled={selectedItems.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Add Selected to Cart
              </button>

              <button
                onClick={addAllToCart}
                className="flex items-center gap-2 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors"
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
              onAddToCart={() => {
                // Format product data properly for cart
                const cartItem = {
                  id: item.product_id || item.product?.id,
                  name: item.product?.name,
                  price: item.product?.price,
                  image: item.product?.images?.[0],
                  ...item.product,
                };
                return addItem(cartItem, 1);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const WishlistItemCard = ({
  item,
  isSelected,
  onToggleSelect,
  onRemove,
  onAddToCart,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const product = item.product;

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove();
    setIsRemoving(false);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    const success = await onAddToCart();
    if (success) {
      toast.success("Added to cart");
    } else {
      toast.error("Failed to add to cart");
    }
    setIsAddingToCart(false);
  };

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
          />
        </label>
      </div>

      {/* Remove Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {isRemoving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Product Image */}
      <Link href={`/products/${product?.slug || product?.id}`}>
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={product?.images?.[0] || "/placeholder-product.jpg"}
            alt={product?.name || "Product"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product?.slug || product?.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 mb-2">
            {product?.name || "Product Name"}
          </h3>
        </Link>

        {/* Rating */}
        {product?.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {product.rating} ({product.review_count || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            €{product?.price || "0.00"}
          </span>
          {product?.original_price &&
            product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                €{product.original_price}
              </span>
            )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {isAddingToCart ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WishlistPage;
