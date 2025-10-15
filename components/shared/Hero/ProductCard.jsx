import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

export const JumiaStyleProductCard = ({ product }) => {
  if (!product) return null;

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { isInWishlist, toggleItem } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const discountedPrice =
    product?.originalprice && product?.discount
      ? (product.originalprice * (1 - product.discount / 100)).toFixed(2)
      : product?.price?.toFixed(2) || "0.00";

  const formatPrice = (price) => `€${parseFloat(price).toLocaleString()}`;

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

  return (
    <Link href={`/products/${product.slug || product.id}`}>
      <div className="bg-white rounded-lg border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-200 overflow-hidden group cursor-pointer">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.images?.[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onLoadingComplete={() => setIsImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          )}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {product.discount && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </div>
          )}
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>
        <div className="p-2 space-y-1">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <div className="space-y-0.5">
            <div className="text-base font-bold text-gray-900">
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
        </div>
      </div>
    </Link>
  );
};
