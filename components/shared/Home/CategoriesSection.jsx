"use client";
import React from "react";
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

  // Default fallback
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

  // Limit categories for display to ensure proper layout
  const displayCategories = categories.slice(0, 10); // Limit to 10 categories max

  return (
    <section className="py-4 bg-white ">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl lg:text-2xl font-black text-gray-900 mb-2">
            Featured <span className="text-orange-500">Categories</span>
          </h2>
        </div>

        {categoriesLoading ? (
          // 🔹 Skeleton Loader - Responsive
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 animate-pulse">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="group cursor-pointer">
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
          // 🔹 Actual Categories - Optimized Grid
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6 gap-4 lg:gap-6">
            {displayCategories.map((category) => {
              const items = formatCategoryItems(category.description);
              return (
                <div
                  key={category.id}
                  onClick={() =>
                    router.push(
                      `/products?category=${encodeURIComponent(category.id)}`
                    )
                  }
                  className="group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative mb-3">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <Image
                        src={getCategoryImage(category.name)}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 20vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Overlay for better text readability */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center px-2">
                    {/* Category Name - Truncated for consistency */}
                    <h3 className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 truncate mb-1">
                      {category.name}
                    </h3>

                    {/* Category Items - Limited for mobile */}
                    {items.length > 0 && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {/* Show fewer items on mobile for better fit */}
                        <span className="hidden md:inline">
                          {items.slice(0, 4).join(" • ")}
                          {items.length > 4 && "..."}
                        </span>
                        <span className="md:hidden">
                          {items.slice(0, 2).join(" • ")}
                          {items.length > 2 && "..."}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More Categories Button (if there are more than 10) */}
        {!categoriesLoading && categories.length > 10 && (
          <div className="text-center mt-8">
            <button
              onClick={() => router.push("/categories")}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              View All Categories
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
