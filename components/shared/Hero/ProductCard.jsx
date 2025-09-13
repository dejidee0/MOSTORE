import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/hooks/useWishlist";

export const JumiaStyleProductCard = ({ product }) => {
  if (!product) return null;

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  // Calculate discounted price
  const discountedPrice =
    product?.originalprice && product?.discount
      ? (product.originalprice * (1 - product.discount / 100)).toFixed(2)
      : product?.price?.toFixed(2) || "0.00";

  const formatPrice = (price) => `₦${parseFloat(price).toLocaleString()}`;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: parseFloat(discountedPrice),
      images: product.images,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      stock_quantity: product.stock_quantity,
      original_price: product.originalprice,
    };

    await toggleItem(wishlistProduct);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity === 0) return;

    await addItem(
      {
        ...product,
        id: product.id.toString(),
        price: parseFloat(discountedPrice),
        image: product.images?.[0],
      },
      1
    );
  };

  return (
    <Link href={`/products/${product.slug || product.id}`}>
      <div className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onLoadingComplete={() => setIsImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          )}

          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              -{product.discount}%
            </div>
          )}

          {/* Wishlist Heart - Visible by default on md screens, hidden on mobile until hover */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-1 right-1 p-1.5 bg-white/80 rounded-full opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-2 space-y-1">
          {/* Product Name - 2 lines max */}
          <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-gray-900">
              {formatPrice(discountedPrice)}
            </div>
            {product.originalprice && product.discount && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.originalprice)}
                </span>
                <span className="text-xs text-orange-600 font-medium">
                  -{product.discount}%
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart Button - Visible by default on md screens, hidden on mobile until hover */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full mt-2 bg-orange-500 text-white text-xs font-medium py-1.5 rounded opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity duration-200 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
};
