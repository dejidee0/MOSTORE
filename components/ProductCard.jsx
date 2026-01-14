import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  Share2,
  Eye,
  MapPin,
  Gift,
  ShoppingCart,
} from "lucide-react";
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
  const isCharity = product.product_type === "charity";

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
      price: isCharity ? 0 : parseFloat(discountedPrice),
      images: product.images,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      stock_quantity: product.stock_quantity,
      rating: product.rating,
      review_count: product.review_count,
      original_price: product.originalprice,
      product_type: product.product_type,
    };
    await toggleWishlist(wishlistProduct);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCharity) {
      // For charity items, redirect to product page or show request modal
      window.location.href = `/products/${product.slug}`;
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: parseFloat(discountedPrice),
        image: product.images?.[0],
        slug: product.slug,
        stock_quantity: product.stock_quantity,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
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
          {isCharity ? (
            <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg flex items-center gap-1">
              <Gift className="w-3 h-3" /> Charity
            </div>
          ) : (
            <>
              {product.discount > 0 && (
                <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                  -{product.discount}%
                </div>
              )}
              {product.isNew && (
                <div className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                  NEW
                </div>
              )}
            </>
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
            <Heart
              className="w-4 h-4"
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>

          <Link href={`/products/${product.slug}`}>
            <button
              className={`w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                isCharity
                  ? "text-gray-700 hover:text-green-500"
                  : "text-gray-700 hover:text-orange-500"
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>

          <button
            className={`w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isCharity
                ? "text-gray-700 hover:text-green-500"
                : "text-gray-700 hover:text-orange-500"
            }`}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add/Request Button (appears on hover at bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <button
            onClick={handleAddToCart}
            disabled={
              isAddingToCart || (!isCharity && product.stock_quantity <= 0)
            }
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isCharity
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            }`}
          >
            {isAddingToCart ? (
              <span>Processing...</span>
            ) : isCharity ? (
              <>
                <Gift className="w-4 h-4" />
                Request Item
              </>
            ) : product.stock_quantity <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2 flex flex-col flex-1 justify-between space-y-2">
        <div className="overflow-hidden">
          <div className="flex items-center justify-between text-xs truncate">
            {product.categories?.name && (
              <span
                className={`font-semibold truncate ${
                  isCharity ? "text-green-600" : "text-orange-600"
                }`}
              >
                {product.categories.name}
              </span>
            )}
            {product.brand && (
              <span className="text-gray-500 truncate">{product.brand}</span>
            )}
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3
              className={`font-semibold text-gray-800 line-clamp-2 text-sm sm:text-base cursor-pointer transition-colors ${
                isCharity
                  ? "group-hover:text-green-600"
                  : "group-hover:text-orange-600"
              }`}
            >
              {product.name}
            </h3>
          </Link>

          {product.location && (
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{product.location}</span>
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

        {/* Price or Charity Label */}
        <div className="flex items-end gap-2">
          {isCharity ? (
            <div className="flex items-center gap-1">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-600">
                Free to Good Home
              </span>
            </div>
          ) : (
            <>
              {product.originalprice && product.discount > 0 ? (
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
            </>
          )}
        </div>

        {/* Stock indicator for regular products */}
        {!isCharity &&
          product.stock_quantity != null &&
          product.stock_quantity <= 5 &&
          product.stock_quantity > 0 && (
            <div className="text-xs text-orange-600 font-medium">
              Only {product.stock_quantity} left!
            </div>
          )}
      </div>
    </motion.div>
  );
};
