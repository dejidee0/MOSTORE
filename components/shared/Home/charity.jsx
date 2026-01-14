"use client";

import { useState, useEffect } from "react";
import { Sparkles, Heart, ArrowRight, Star, TrendingUp } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import Image from "next/image";
import { Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CharityProductsSection() {
  const router = useRouter();
  const { isInWishlist, toggleItem } = useWishlist();
  const [chartityProducts, setCharityProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharityProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("product_type", "charity")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching charity products:", error);
        setLoading(false);
        return;
      }
      setCharityProducts(data || []);
      setLoading(false);
    };

    fetchCharityProducts();
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
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-gray-900 mb-0">
              Charity <span className="text-orange-500">Products</span>
            </h2>
            <p className="text-sm m-0 leading-tight">
              Explore premium goodies—free for the taking
            </p>
          </div>
          <button
            onClick={() => router.push("/products?tab=charity")}
            className="text-sm font-semibold cursor-pointer text-orange-500 hover:text-orange-600 transition-colors duration-200"
          >
            See All
          </button>
        </div>

        {/* Products Grid */}
        {/* Infinite Slider */}
        <div className="relative overflow-hidden">
          <div className="slider-track flex w-max gap-3">
            {[...chartityProducts, ...chartityProducts].map(
              (product, index) => (
                <Link
                  key={`${product.id}-${index}`}
                  href={`/products/${product.id}`}
                  className="flex-shrink-0 w-[160px] sm:w-[200px] lg:w-[220px]"
                >
                  <div className="group bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Sponsored Badge */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <Megaphone className="w-2.5 h-2.5" />
                          Ad
                        </div>
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={(e) => handleWishlistClick(product, e)}
                        className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isInWishlist(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-2.5 space-y-1 border-t border-gray-300">
                      <h3 className="text-xs font-medium line-clamp-2">
                        {product.name}
                      </h3>

                      <span className="text-sm font-bold text-green-600">
                        Free
                      </span>
                      {product.location && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 11.5c0 5-7 10-7 10s-7-5-7-10a7 7 0 1114 0z"
                            />
                          </svg>
                          <span className="truncate">{product.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            )}
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
