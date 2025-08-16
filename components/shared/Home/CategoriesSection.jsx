"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ✅ Category image mapping
const getCategoryImage = (name) => {
  const lower = name?.toLowerCase() || "";
  if (lower.includes("electronics"))
    return "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop";
  if (lower.includes("general household"))
    return "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop";
  if (lower.includes("motorcycles"))
    return "https://images.unsplash.com/photo-1598032892972-3585a84b21d1?w=400&h=300&fit=crop";
  if (lower.includes("automobiles"))
    return "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop";
  if (lower.includes("general parts"))
    return "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop";

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

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl lg:text-2xl font-black text-gray-900 mb-2">
            Featured <span className="text-orange-500">Categories</span>
          </h2>
        </div>

        {categoriesLoading ? (
          // 🔹 Skeleton Loader
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-pulse">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative mb-3">
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 🔹 Actual Categories
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
                  className="group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative mb-3">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={getCategoryImage(category.name)}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="text-center">
                    <span className="text-sm  text-gray-900 font-semibold group-hover:text-orange-600 transition-colors duration-200">
                      {category.name}
                    </span>
                    {items.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {items.join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
