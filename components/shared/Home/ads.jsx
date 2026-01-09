"use client";

import { useState, useEffect } from "react";
import { Sparkles, Heart, ArrowRight, Star, TrendingUp } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import Image from "next/image";
import { Megaphone } from "lucide-react";

export default function SponsoredProductsSection() {
  const { isInWishlist, toggleItem } = useWishlist();
  const [sponsoredProducts, setSponsoredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsoredProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching sponsored products:", error);
        setLoading(false);
        return;
      }
      setSponsoredProducts(data || []);
      setLoading(false);
    };

    fetchSponsoredProducts();
  }, []);

  const formatPrice = (price) => `€${parseFloat(price).toLocaleString()}`;

  const handleWishlistClick = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      stock_quantity: product.stock_quantity,
      original_price: product.originalprice,
    };

    await toggleItem(wishlistProduct);
  };

  if (loading) {
    return (
      <section className="w-full py-8 bg-gradient-to-b from-orange-50/30 to-white">
        <div className="max-w-7xl mx-auto px-3">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-8 bg-orange-50">
      <div className="max-w-7xl mx-auto px-3">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Sponsored Products
              </h2>
            </div>
            <span className="hidden sm:inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Featured
            </span>
          </div>
          <Link href="/products">
            <button className="text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sponsoredProducts.map((product, index) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="group bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  )}

                  {/* Sponsored Badge - Subtle */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Megaphone className="w-2.5 h-2.5" />
                      Ad
                    </div>
                  </div>

                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Wishlist Heart */}
                  <button
                    onClick={(e) => handleWishlistClick(product, e)}
                    className="absolute bottom-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isInWishlist(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Premium Indicator - Top Product */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" />
                      Top
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2.5 space-y-1.5">
                  {/* Category - Small */}
                  {product.category && (
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide truncate">
                      {product.category}
                    </div>
                  )}

                  {/* Product Name */}
                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  {/* Rating - Compact */}
                  {product.rating > 0 && (
                    <div className="hidden sm:flex items-center gap-1">
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                      <span className="text-[10px] text-gray-600 font-medium">
                        {product.rating}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({product.total_reviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalprice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.originalprice)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status - Minimal */}
                    {product.stock_quantity !== undefined &&
                      product.stock_quantity > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className="text-[10px] text-green-700 font-medium">
                            In stock
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Hover CTA */}
                <div className="px-2.5 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="w-full bg-orange-500 text-white text-xs font-semibold py-2 rounded hover:bg-orange-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Info - Subtle */}
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Megaphone className="w-3.5 h-3.5 text-gray-400" />
            <span>
              These are sponsored listings.{" "}
              <Link
                href="#"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Advertise your products
              </Link>
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
