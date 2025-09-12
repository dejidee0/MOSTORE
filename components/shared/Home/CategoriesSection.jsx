"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ✅ Category image mapping
const getCategoryImage = (name) => {
  const lower = name?.toLowerCase() || "";
  if (lower.includes("tech"))
    return "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2FkZ2V0fGVufDB8fDB8fHww";
  if (lower.includes("used"))
    return "https://plus.unsplash.com/premium_photo-1678402542628-3d0ccf1224b7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG91c2Vob2xkJTIwaXRlbXN8ZW58MHx8MHx8fDA%3D";
  if (lower.includes("electric"))
    return "https://images.unsplash.com/photo-1635560019796-e256b3737dc2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZWxlY3RyaWMlMjBiaWtlc3xlbnwwfHwwfHx8MA%3D%3D";
  if (lower.includes("automobiles"))
    return "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop";
  if (lower.includes("autopart"))
    return "https://images.unsplash.com/photo-1519752594763-2633d8d4ea29?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXV0b3BhcnRzfGVufDB8fDB8fHww";
  if (lower.includes("boating"))
    return "https://images.unsplash.com/photo-1666223193806-a1f66ec15b00?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHdhdGVyY3JhZnR8ZW58MHx8MHx8fDA%3D";
  if (lower.includes("fluid"))
    return "https://images.unsplash.com/photo-1746014995761-bf045dc83b0a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fG1vdG9yJTIwb2lsfGVufDB8fDB8fHww";
  if (lower.includes("kids"))
    return "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?q=80&w=948&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop";
};

// ✅ Format description into bullet-like labels
const formatCategoryItems = (description) => {
  if (!description) return [];
  return description
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\b\w/g, (l) => l.toUpperCase()));
};

const CategoriesSection = ({ categories = [], categoriesLoading = false }) => {
  const router = useRouter();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="md:mb-8 mb-2 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-gray-900 mb-0">
              Featured <span className="text-orange-500">Categories</span>
            </h2>
            <p className="text-sm m-0 leading-tight">
              International Online Shopping Made Easy
            </p>
          </div>
          <button
            onClick={() => router.push("/products")}
            className="text-sm font-semibold cursor-pointer text-orange-500 hover:text-orange-600 transition-colors duration-200"
          >
            See All
          </button>
        </div>

        {categoriesLoading ? (
          // 🔹 Skeleton Loader - Horizontal
          <div className="flex gap-4 overflow-x-auto scrollbar-hide animate-pulse">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="group cursor-pointer flex-shrink-0 w-40"
              >
                <div className="relative mb-3">
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl"></div>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 🔹 Actual Categories - Horizontal Slider
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide hover:scrollbar-visible pb-4"
            >
              {categories.map((category) => {
                const items = formatCategoryItems(category.description);
                return (
                  <div
                    key={category.id}
                    onClick={() =>
                      router.push(
                        `/products?category=${encodeURIComponent(category.id)}`
                      )
                    }
                    className="group cursor-pointer flex-shrink-0 w-40"
                  >
                    {/* Image */}
                    <div className="relative mb-1">
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <Image
                          src={getCategoryImage(category.name)}
                          alt={category.name}
                          fill
                          sizes="40vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center px-2">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 truncate mb-1">
                        {category.name}
                      </h3>
                      {items.length > 0 && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {items.slice(0, 2).join(" • ")}
                          {items.length > 2 && "..."}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
          .scrollbar-visible:hover::-webkit-scrollbar {
            display: block;
          }
          .scrollbar-visible:hover::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .scrollbar-visible:hover::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          .scrollbar-visible:hover::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}</style>
      </div>
    </section>
  );
};

export default CategoriesSection;
