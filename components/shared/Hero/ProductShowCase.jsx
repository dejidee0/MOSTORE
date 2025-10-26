"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import Image from "next/image";

export default function ProductShowcaseSection() {
  const router = useRouter();
  const { isInWishlist, toggleItem } = useWishlist();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      setProducts(data);
    };

    fetchProducts();
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

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 ${
          index < rating
            ? "text-orange-400 fill-orange-400"
            : "text-gray-300 fill-gray-300"
        }`}
      />
    ));

  return (
    <section className="w-full py-4">
      <div className="max-w-7xl mx-auto px-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Promotional Banner */}
          <div className="lg:col-span-3">
            <div className="relative bg-slate-500 rounded-xl overflow-hidden h-64 lg:h-full lg:min-h-[500px]">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=800&fit=crop"
                  alt="Promotional Banner"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <div className="relative z-10 p-4 lg:p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="text-white text-3xl lg:text-5xl font-black mb-2">
                    -35%
                  </div>
                  <div className="text-white text-xs mb-1 opacity-90">
                    Only This Week
                  </div>
                  <h2 className="text-white text-lg lg:text-xl font-bold mb-2">
                    Electronics
                  </h2>
                  <p className="text-gray-300 text-xs leading-relaxed mb-4 lg:mb-6">
                    Get amazing deals on the latest electronics and gadgets.
                  </p>
                </div>
                <Link href="/products?category=electronics">
                  <button className="flex items-center gap-2 text-white text-xs font-medium hover:text-orange-400 transition-colors group">
                    <span>Shop Now</span>
                    <svg
                      className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Product Grid - Jumia Style */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}

                      {/* Discount Badge */}
                      {product.discount && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-bold px-1 py-0.5 rounded">
                          -{product.discount}%
                        </div>
                      )}

                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => handleWishlistClick(product, e)}
                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
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

                    {/* Product Info */}
                    <div className="p-1 space-y-0.5">
                      {/* Product Name */}
                      <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>

                      {/* Rating - Only show on larger screens */}
                      <div className="hidden sm:flex items-center gap-1">
                        {renderStars(product.rating || 0)}
                        <span className="text-gray-500 text-xs">
                          ({product.total_reviews || 0})
                        </span>
                      </div>

                      {/* Price Section */}
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-gray-900">
                          {formatPrice(product.price)}
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
              ))}
            </div>
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
