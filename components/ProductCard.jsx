import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Share2, MoveRight, Heart } from "lucide-react";

export const ProductCard = ({ product }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const discountedPrice = product.originalPrice
    ? (product.originalPrice * (1 - (product.discount || 0) / 100)).toFixed(2)
    : product.price;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-3 overflow-hidden">
        {/* Discount Badge */}
        {product.discount && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10"
          >
            -{product.discount}%
          </motion.div>
        )}

        {/* Product Image */}
        <div className="relative h-72 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain drop-shadow-xl transition-opacity duration-300 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsImageLoaded(true)}
            />
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
            )}
          </motion.div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Product Category */}
        {product.category && (
          <span className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-2">
            {product.category}
          </span>
        )}

        {/* Product Title */}
        <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 text-lg leading-tight min-h-[56px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < (product.rating || 4)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2 font-medium">
            ({product.rating || 4.0})
          </span>
          {product.reviewCount && (
            <span className="text-xs text-gray-500 ml-1">
              • {product.reviewCount} reviews
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            {product.originalPrice && product.discount ? (
              <>
                <span className="text-xl font-bold text-orange-500">
                  ${discountedPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-orange-500">
                ${product.price}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex items-center gap-3">
          <button className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 mr-2" />
            SHOP NOW
            <MoveRight className="w-4 h-4 ml-2" />
          </button>

          <button className="w-10 h-10 p-0 border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300 group flex items-center justify-center">
            <Heart className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
          </button>

          <button className="w-10 h-10 p-0 border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300 group flex items-center justify-center">
            <Share2 className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {product.stock > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium">
                  ✓ In Stock
                </span>
                {product.stock < 10 && (
                  <span className="text-xs text-orange-500 font-medium">
                    Only {product.stock} left!
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-red-500 font-medium">
                Out of Stock
              </span>
            )}
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};

// Mock data
