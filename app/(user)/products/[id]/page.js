"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/lib/toast";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase-client";
import { Package, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { addToast } = useToast();
  const {
    isInWishlist,
    toggleItem: toggleWishlist,
    isAuthenticated,
  } = useWishlist();

  // Check if product is in wishlist
  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(
            `
            *,
            categories (
              id,
              name,
              description
            ),
            profiles(
            full_name
            )
          `
          )
          .eq("id", params.id)
          .eq("is_active", true)
          .single();

        if (productError) {
          const { data: productBySlug, error: slugError } = await supabase
            .from("products")
            .select(
              `
              *,
              categories (
                id,
                name,
                description
              ),
                   profiles(
            full_name
            )
            `
            )
            .eq("slug", params.id)
            .eq("is_active", true)
            .single();

          if (slugError) {
            throw new Error("Product not found");
          }

          setProduct(productBySlug);

          if (
            productBySlug.related_products &&
            productBySlug.related_products.length > 0
          ) {
            await fetchRelatedProducts(productBySlug.related_products);
          }
        } else {
          setProduct(productData);

          if (
            productData.related_products &&
            productData.related_products.length > 0
          ) {
            await fetchRelatedProducts(productData.related_products);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async (relatedProductIds) => {
      try {
        const { data: relatedData, error: relatedError } = await supabase
          .from("products")
          .select("*")
          .in("id", relatedProductIds)
          .eq("is_active", true)
          .limit(5);

        if (!relatedError && relatedData) {
          setRelatedProducts(relatedData);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => Math.min(prev + 1, product.stock_quantity));
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const StarRating = ({ rating, totalReviews }) => {
    const stars = rating || 0;
    const reviews = totalReviews || 0;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < stars ? "text-orange-400 fill-current" : "text-gray-300"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L0 6.91l6.564-.954L10 0l3.436 5.956L20 6.91l-5.245 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className="text-gray-500 text-sm ml-2">({reviews} Reviews)</span>
      </div>
    );
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/placeholder-image.jpg",
      selectedColor: product.colors?.[selectedColor] || null,
      selectedSize: product.sizes?.[selectedSize] || null,
      quantity: quantity,
    };

    addItem(cartItem, quantity);
    addToast(`${product.name} added to cart!`, "success");
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      addToast("Please sign in to add items to wishlist", "error");
      return;
    }

    if (!product) return;

    // Calculate discounted price if applicable
    const discountedPrice =
      product.originalprice && product.discount
        ? (product.originalprice * (1 - product.discount / 100)).toFixed(2)
        : product.price;

    // Format product data for wishlist
    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: parseFloat(discountedPrice),
      images: product.images,
      slug: product.slug,
      category: product.categories?.name || product.category,
      brand: product.brand,
      stock_quantity: product.stock_quantity,
      rating: product.rating,
      review_count: product.total_reviews,
      original_price: product.originalprice,
      discount: product.discount,
    };

    await toggleWishlist(wishlistProduct);

    if (isWishlisted) {
      addToast(`${product.name} removed from wishlist`, "success");
    } else {
      addToast(`${product.name} added to wishlist!`, "success");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">Error: {error}</p>
        <Link
          href="/"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Product not found</p>
        <Link
          href="/"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const isInStock = product.stock_quantity > 0;
  const hasImages = product.images && product.images.length > 0;
  const hasColors = product.colors && product.colors.length > 0;
  const hasSizes = product.sizes && product.sizes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            {product.categories && (
              <>
                <Link
                  href={`/category/${product.categories.id}`}
                  className="hover:text-gray-700"
                >
                  {product.categories.name}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-gray-700">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <img
                src={
                  hasImages
                    ? product.images[selectedImage]
                    : "/placeholder-image.jpg"
                }
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            </div>
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg p-2 ${
                      selectedImage === index
                        ? "border-orange-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-16 h-16 object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {product.name}
                </h1>
                {product.condition && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.condition === "new"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {product.condition === "new" ? "Brand New" : "Pre-Owned"}
                  </span>
                )}
              </div>
              <StarRating
                rating={product.rating}
                totalReviews={product.total_reviews}
              />
              <span
                className={`text-sm ml-4 ${
                  isInStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {isInStock
                  ? `In Stock (${product.stock_quantity} available)`
                  : "Out of Stock"}
              </span>
              {product.brand && (
                <p className="text-gray-600 text-sm mt-1">
                  Brand: {product.brand}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-gray-800">
                €{product.price}
              </div>
              {product.originalprice &&
                product.originalprice > product.price && (
                  <div className="text-lg text-gray-400 line-through">
                    €{product.originalprice}
                  </div>
                )}
              {product.discount && (
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <div className="text-gray-600 leading-relaxed">
              {product.description || product.short_description}
            </div>
            <div className="text-gray-600 leading-relaxed">
              {product.short_description}
            </div>

            {hasColors && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Colors:</h3>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`px-3 py-2 border rounded capitalize ${
                        selectedColor === index
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSizes && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Size:</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(index)}
                      className={`px-3 py-2 border rounded ${
                        selectedSize === index
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => handleQuantityChange("decrement")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-4 py-2 border-l border-r border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("increment")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
              <button
                className={`px-8 py-3 rounded font-semibold flex-1 ${
                  isInStock
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
                onClick={() => isInStock && handleAddToCart(product)}
                disabled={!isInStock}
              >
                {isInStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                onClick={handleWishlist}
                className={`border p-3 rounded transition-all duration-300 ${
                  isWishlisted
                    ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                }`}
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-200 ${
                    isWishlisted ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Product Details
              </h4>
              <div className="text-sm text-gray-600 space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <span className="font-medium">SKU:</span>
                  <span>{product.sku}</span>
                </motion.div>
                {product.brand && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center justify-between py-2 border-b border-gray-100"
                  >
                    <span className="font-medium">Brand:</span>
                    <span>{product.brand}</span>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <span className="font-medium">Condition:</span>
                  <span
                    className={`font-semibold ${
                      product.condition === "new"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {product.condition === "new" ? "Brand New" : "Pre-Owned"}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <span className="font-medium">Stock:</span>
                  <span>{product.stock_quantity} units</span>
                </motion.div>
                {product.location && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Location:</span>
                    </div>
                    <span className="text-orange-500 font-semibold">
                      {product.location}
                    </span>
                  </motion.div>
                )}
                {product?.profiles.full_name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Uploaded By:</span>
                    </div>
                    <span className="text-black font-semibold">
                      {product?.profiles.full_name}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-gray-600 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-800">Free Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Enter your postal code to check delivery availability
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-gray-600 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Return Delivery
                  </h4>
                  <p className="text-sm text-gray-600">
                    Free 30-days Delivery Returns{" "}
                    <Link href="#" className="text-blue-500 underline">
                      Details
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-4 h-6 bg-orange-500 rounded"></div>
                Related Items
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={
                        relatedProduct.images?.[0] || "/placeholder-image.jpg"
                      }
                      alt={relatedProduct.name}
                      className="w-full h-40 object-cover"
                    />
                    {relatedProduct.discount && (
                      <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        {relatedProduct.discount}%
                      </span>
                    )}
                    {relatedProduct.condition && (
                      <span
                        className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${
                          relatedProduct.condition === "new"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {relatedProduct.condition === "new" ? "New" : "Used"}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-gray-800 text-sm truncate">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-bold">
                        €{relatedProduct.price}
                      </span>
                      {relatedProduct.originalprice &&
                        relatedProduct.originalprice > relatedProduct.price && (
                          <span className="text-gray-400 line-through text-sm">
                            €{relatedProduct.originalprice}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
