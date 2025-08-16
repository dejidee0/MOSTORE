"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

export default function ProductShowcaseSection() {
  const router = useRouter();
  const { addItem } = useCart();
  const [favoriteItems, setFavoriteItems] = useState(new Set());
  const [products, setProducts] = useState([]);

  // Fetch 8 most recent active products
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

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavoriteItems(newFavorites);
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "text-orange-400 fill-orange-400"
            : "text-gray-300 fill-gray-300"
        }`}
      />
    ));

  return (
    <section className="w-full bg-gray-50 py-8 sm:py-6">
      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Promotional Banner */}
          <div className="lg:col-span-3">
            <div className="relative bg-slate-800 rounded-2xl overflow-hidden h-full min-h-[400px] lg:min-h-[600px]">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=800&fit=crop"
                  alt="Promotional Banner"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-slate-800/80"></div>
              </div>
              <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
                    -35%
                  </div>
                  <div className="text-white text-sm mb-2 opacity-90">
                    Only This Week
                  </div>
                  <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">
                    Electronics
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Nis telesa, laber. Mytonomi bedessade mineten. Pokura
                    rengen, lulurat. Niren nunade häd.
                  </p>
                </div>
                <Link
                  href={
                    "/products?category=a4ebac6f-50a2-4ce2-9057-0003cd1b737d"
                  }
                >
                  <button className="flex items-center gap-2 text-white text-sm font-medium hover:text-orange-400 transition-colors group">
                    <span>Shop Now</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md transition-shadow duration-300 group flex flex-col overflow-hidden border border-gray-100 hover:shadow-xl hover:border-orange-100 h-full"
                >
                  {/* Product Image with Badge */}
                  <div className="relative overflow-hidden rounded-t-2xl h-48">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.discount && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-gray-900 font-medium text-sm leading-snug line-clamp-2 mb-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(product.rating || 0)}
                        <span className="text-gray-500 text-xs ml-1">
                          ({product.total_reviews || 0})
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        {product.originalprice && (
                          <span className="text-gray-400 text-sm line-through">
                            ${product.originalprice}
                          </span>
                        )}
                        <span className="text-orange-600 text-lg font-bold">
                          ${product.price}
                        </span>
                      </div>
                    </div>

                    {/* Hidden Action Buttons */}
                    <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-300 mt-4">
                      <div className="flex items-center gap-3 justify-center">
                        <button
                          onClick={() => addItem(product, 1)}
                          className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg flex items-center justify-center shadow-md transition-transform duration-300"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 p-3 rounded-lg flex items-center justify-center shadow-sm transition-transform duration-300"
                          aria-label="View product"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
