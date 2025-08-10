import { useState } from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";

const ProductShowcaseSection = () => {
  const [favoriteItems, setFavoriteItems] = useState(new Set());

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavoriteItems(newFavorites);
  };

  const products = [
    {
      id: 1,
      name: "VISION® - 147 DAYTONA Hyper Silver",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      discount: "18%",
      discountType: "percentage",
      originalPrice: "$254.00",
      currentPrice: "$209.00",
      rating: 5,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-yellow-400", "bg-gray-400", "bg-gray-300"],
    },
    {
      id: 2,
      name: "Thinkware F770 Dash Cam Dual Channel Wifi",
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop",
      discount: "8%",
      discountType: "percentage",
      originalPrice: "$260.99",
      currentPrice: "$249.99",
      rating: 3,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-orange-400", "bg-gray-400", "bg-gray-300"],
    },
    {
      id: 3,
      name: "Technaxx car Alarm with Charging Function",
      image:
        "https://images.unsplash.com/photo-1588200908342-23b585c03e26?w=400&h=300&fit=crop",
      discount: "SUPER PRICE",
      discountType: "label",
      originalPrice: "$51.99",
      currentPrice: "$47.99",
      rating: 5,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-yellow-400", "bg-gray-400", "bg-gray-300", "bg-gray-300"],
    },
    {
      id: 4,
      name: "Spyder® - Projector Headlights",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
      discount: "11%",
      discountType: "percentage",
      originalPrice: "$582.99",
      currentPrice: "$521.89",
      rating: 5,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-orange-400", "bg-gray-400", "bg-gray-300"],
    },
    {
      id: 5,
      name: "Spec-D® - Projector Headlights",
      image:
        "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop",
      discount: "24%",
      discountType: "percentage",
      originalPrice: "$364.86",
      currentPrice: "$279.02",
      rating: 4,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-yellow-400", "bg-gray-400"],
    },
    {
      id: 6,
      name: "SnowyFox RV 15Amp to 50Amp Adapter - 15Male",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      discount: "TOP PRODUCT",
      discountType: "top",
      originalPrice: "$25.98",
      currentPrice: "$23.88",
      rating: 5,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-yellow-400", "bg-gray-400", "bg-orange-400"],
    },
    {
      id: 7,
      name: "Shell Rotella T1 SAE 30 Conventional Heavy Duty",
      image:
        "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=400&h=300&fit=crop",
      discount: "29%",
      discountType: "percentage",
      originalPrice: "$24.85",
      currentPrice: "$17.85",
      rating: 4,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-yellow-400", "bg-gray-400"],
    },
    {
      id: 8,
      name: "Schumacher 125 Chrome Rain 12V",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      discount: "34%",
      discountType: "percentage",
      originalPrice: "$45.99",
      currentPrice: "$30.54",
      rating: 5,
      reviews: 1,
      inStock: true,
      dotColors: ["bg-yellow-400", "bg-gray-400"],
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "text-orange-400 fill-orange-400"
            : "text-gray-300 fill-gray-300"
        }`}
      />
    ));
  };

  const getDiscountBadge = (product) => {
    if (product.discountType === "top") {
      return (
        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold z-10">
          {product.discount}
        </div>
      );
    } else if (product.discountType === "label") {
      return (
        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold z-10">
          {product.discount}
        </div>
      );
    } else {
      return (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded text-xs font-bold z-10">
          {product.discount}
        </div>
      );
    }
  };

  return (
    <section className="w-full bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Promotional Banner */}
          <div className="lg:col-span-3">
            <div className="relative bg-slate-800 rounded-2xl overflow-hidden h-full min-h-[400px] lg:min-h-[600px]">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=800&fit=crop"
                  alt="Car"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-slate-800/80"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
                    -35%
                  </div>
                  <div className="text-white text-sm mb-2 opacity-90">
                    Only This Week
                  </div>
                  <h2 className="text-white text-xl sm:text-2xl font-bold mb-4">
                    Tools & Equipment
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Nis telesa, laber. Mytonomi bedessade mineten. Pokura
                    rengen, lulurat. Niren nunade häd. Sest berade.
                  </p>
                </div>

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
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount Badge */}
                    {getDiscountBadge(product)}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 p-2 rounded-full transition-colors shadow-sm"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favoriteItems.has(product.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </button>

                    {/* Color Dots */}
                    <div className="absolute bottom-3 left-3 flex gap-1">
                      {product.dotColors.map((color, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${color} border border-white/50`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-gray-800 text-sm font-medium leading-tight mb-3 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-gray-500 text-xs">
                        {product.reviews} review
                        {product.reviews !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-400 text-sm line-through">
                        {product.originalPrice}
                      </span>
                      <span className="text-red-500 text-lg font-bold">
                        {product.currentPrice}
                      </span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 text-teal-600 text-sm mb-3">
                      <div className="w-3 h-3 bg-teal-100 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      </div>
                      <span className="font-medium">In Stock</span>
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
};

export default ProductShowcaseSection;
