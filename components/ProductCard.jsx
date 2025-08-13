import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Share2, Eye } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart"; // Import your cart context

export const ProductCard = ({ product }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, isItemInCart, getItemCount } = useCart(); // Use cart context

  const discountedPrice = product.originalprice
    ? product.originalprice * (1 - (product.discount || 0) / 100).toFixed(2)
    : product.price;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity === 0) return;

    setIsAddingToCart(true);

    try {
      await addItem(
        {
          ...product,
          id: product.id.toString(), // Ensure ID is string for consistency
          price: parseFloat(discountedPrice || product.price),
          image: product.images?.[0],
        },
        1
      );

      // Optional: Add toast notification here
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Optional: Show error toast to user
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // Implement your wishlist logic here
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement quick view logic here
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: `${window.location.origin}/products/${product.slug}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/products/${product.slug}`
      );
      // Optional: Show "copied to clipboard" feedback
    }
  };

  // Check if product is already in cart
  const inCart = isItemInCart(product.id.toString());
  const cartQuantity = getItemCount(product.id.toString());

  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white rounded-lg shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/60 flex flex-col h-full relative backdrop-blur-sm"
    >
      {/* Image Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden aspect-square">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onLoadingComplete={() => setIsImageLoaded(true)}
            loading="lazy"
            priority={false}
          />
        )}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {product.discount && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg"
            >
              -{product.discount}% OFF
            </motion.div>
          )}
          {product.isNew && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
              NEW
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center shadow-lg ${
              isWishlisted
                ? "bg-orange-500 text-white"
                : "bg-white/90 hover:bg-white text-gray-700 hover:text-orange-500"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
            />
          </motion.button>
          <Link href={`/products/${product.slug}`} className="flex-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 bg-white/90 hover:bg-white text-gray-700 hover:text-orange-500 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-9 h-9 bg-white/90 hover:bg-white text-gray-700 hover:text-orange-500 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs">
          {product.category && (
            <span className="font-semibold text-orange-600 uppercase tracking-wide">
              {product.category}
            </span>
          )}
          {product.brand && (
            <span className="text-gray-500 font-medium">{product.brand}</span>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm leading-5 group-hover:text-orange-600 transition-colors duration-200 cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating || 4)
                    ? "text-orange-400 fill-orange-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {product.rating || 4.0}
          </span>
          {product.total_reviews && (
            <span className="text-xs text-gray-400">
              ({product.total_reviews})
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-end gap-2">
          {product.originalprice && product.discount ? (
            <>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-sm line-through text-gray-400 mb-0.5">
                {formatPrice(product.originalprice)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock_quantity !== undefined && (
          <div className="flex items-center justify-between text-xs">
            {product.stock_quantity > 0 ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-500 font-medium">Out of Stock</span>
              </div>
            )}
            {product.stock_quantity > 0 && product.stock_quantity < 10 && (
              <span className="text-orange-600 font-medium">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-2 space-y-2">
          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isAddingToCart}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
              product.stock_quantity === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isAddingToCart
                ? "bg-orange-400 text-white cursor-wait"
                : inCart
                ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg hover:shadow-green-500/25"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-lg hover:shadow-orange-500/25"
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : product.stock_quantity === 0 ? (
              "Out of Stock"
            ) : inCart ? (
              <>
                <ShoppingCart className="w-4 h-4" />
                {cartQuantity} in Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </motion.button>

          {/* Secondary Actions Row */}
          <div className="flex items-center gap-2">
            {/* View Product Button */}
            <Link href={`/products/${product.slug}`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-3 rounded-lg font-medium text-sm border-2 border-orange-200 text-orange-600 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </motion.button>
            </Link>

            {/* Quick Action Buttons */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center border-2 ${
                isWishlisted
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-orange-200 text-orange-600 hover:border-orange-500 hover:bg-orange-50"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-10 h-10 border-2 border-orange-200 text-orange-600 hover:border-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
