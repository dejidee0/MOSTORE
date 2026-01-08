import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Heart, Share2, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/hooks/useWishlist";

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, isItemInCart, getItemCount } = useCart();
  const {
    isInWishlist,
    toggleItem: toggleWishlist,
    isAuthenticated,
  } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const discountedPrice =
    product?.originalprice != null
      ? (product.originalprice * (1 - (product.discount || 0) / 100)).toFixed(2)
      : product?.price != null
      ? product.price.toFixed(2)
      : "0.00";

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return console.log("Sign in to wishlist");

    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: parseFloat(discountedPrice),
      images: product.images,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      stock_quantity: product.stock_quantity,
      rating: product.rating,
      review_count: product.review_count,
      original_price: product.originalprice,
    };
    await toggleWishlist(wishlistProduct);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-200 flex flex-col relative"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {product.images?.[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            onLoadingComplete={() => setIsImageLoaded(true)}
          />
        )}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {product.discount && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
              -{product.discount}%
            </div>
          )}
          {product.isNew && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
              NEW
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-700 hover:text-red-500 hover:bg-white"
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className="w-4 h-4" />
          </button>

          <Link href={`/products/${product.slug}`}>
            <button className="w-9 h-9 bg-white/90 text-gray-700 hover:text-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Eye className="w-4 h-4" />
            </button>
          </Link>

          <button className="w-9 h-9 bg-white/90 text-gray-700 hover:text-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2 flex flex-col flex-1 justify-between space-y-2">
        <div className="overflow-hidden">
          <div className="flex items-center justify-between text-xs truncate">
            {product.category && (
              <span className="text-orange-600 font-semibold truncate">
                {product.category}
              </span>
            )}
            {product.brand && (
              <span className="text-gray-500 truncate">{product.brand}</span>
            )}
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm sm:text-base cursor-pointer group-hover:text-orange-600">
              {product.name}
            </h3>
          </Link>

          {product.location && (
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
              <MapPin className="w-3 h-3" />
              <span>{product.location}</span>
            </div>
          )}

          {product.rating != null && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">
                {product.rating} ({product.review_count || 0})
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2">
          {product.originalprice && product.discount ? (
            <>
              <span className="text-sm font-bold text-gray-900">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-xs line-through text-gray-400">
                {formatPrice(product.originalprice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
