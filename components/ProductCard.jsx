import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Share2, Eye } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export const ProductCard = ({ product }) => {
  if (!product) return null; // ✅ Do not render anything if product is missing

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, isItemInCart, getItemCount } = useCart();

  const discountedPrice =
    product?.originalprice != null
      ? (product.originalprice * (1 - (product.discount || 0) / 100)).toFixed(2)
      : product?.price != null
      ? product.price.toFixed(2)
      : "0.00";
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_quantity === 0) return;

    setIsAddingToCart(true);
    try {
      await addItem(
        {
          ...product,
          id: product.id.toString(),
          price: parseFloat(discountedPrice || product.price),
          image: product.images?.[0],
        },
        1
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
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
    }
  };

  const inCart = isItemInCart(product.id.toString());
  const cartQuantity = getItemCount(product.id.toString());

  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white rounded-lg shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/60 flex flex-col relative backdrop-blur-sm"
    >
      {/* Image Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-hidden aspect-[4/3] flex-shrink-0">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onLoadingComplete={() => setIsImageLoaded(true)}
            loading="lazy"
          />
        )}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        {/* Badges */}
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

        {/* Hover Actions */}
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
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-2 overflow-hidden">
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-xs truncate">
            {product.category && (
              <span className="font-semibold text-orange-600 uppercase tracking-wide truncate">
                {product.category}
              </span>
            )}
            {product.brand && (
              <span className="text-gray-500 font-medium truncate">
                {product.brand}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm leading-5 group-hover:text-orange-600 transition-colors duration-200 cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-end gap-2">
            {product.originalprice && product.discount ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-xs line-through text-gray-400 mb-0.5">
                  {formatPrice(product.originalprice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isAddingToCart || product.stock_quantity === 0}
          onClick={handleAddToCart}
          className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium shadow-md transition-colors duration-300 ${
            product.stock_quantity === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : inCart
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stock_quantity === 0
            ? "Out of Stock"
            : inCart
            ? `In Cart (${cartQuantity})`
            : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
};
