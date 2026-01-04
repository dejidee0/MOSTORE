"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/lib/toast";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase-client";
import { Heart, ShoppingCart, Zap, HardDrive, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import ProductReviews, { StarRating } from "./reviews";
import { getProductAverageRating, getProductReviewCount } from "@/lib/reviews";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Antenna } from "lucide-react";
import RichContentRenderer from "@/components/rich-text-renderer";
import { MessageCircle } from "lucide-react";
import { chatApi } from "@/lib/chat/api";

export default function ProductDetailsClient({ productId }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Variant selections
  const [selectedColorVariant, setSelectedColorVariant] = useState(null);
  const [selectedSizeVariant, setSelectedSizeVariant] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedSimType, setSelectedSimType] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [reviewCount, setReviewCount] = useState(0);

  const { addItem } = useCart();
  const { addToast } = useToast();
  const {
    isInWishlist,
    toggleItem: toggleWishlist,
    isAuthenticated,
  } = useWishlist();

  // Check if product is in wishlist
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Calculate variant adjustments sum
  const calculateVariantAdjustments = () => {
    let adjustments = 0;

    // Add color variant price adjustment
    if (
      selectedColorVariant &&
      selectedColorVariant.priceAdjustment !== undefined
    ) {
      adjustments += parseFloat(selectedColorVariant.priceAdjustment) || 0;
    }

    // Add size variant price adjustment
    if (
      selectedSizeVariant &&
      selectedSizeVariant.priceAdjustment !== undefined
    ) {
      adjustments += parseFloat(selectedSizeVariant.priceAdjustment) || 0;
    }

    // Add storage price adjustment
    if (selectedStorage && selectedStorage.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedStorage.priceAdjustment) || 0;
    }

    // Add memory price adjustment
    if (selectedMemory && selectedMemory.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedMemory.priceAdjustment) || 0;
    }

    // Add SIM type price adjustment
    if (selectedSimType && selectedSimType.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedSimType.priceAdjustment) || 0;
    }

    return adjustments;
  };

  // Calculate final price based on all selected variants
  const calculateFinalPrice = () => {
    if (!product) return 0;
    return parseFloat(product.price) + calculateVariantAdjustments();
  };

  // Calculate original price with variant adjustments (for strikethrough)
  const calculateOriginalPriceWithVariants = () => {
    if (!product || !product.originalprice) return null;
    return parseFloat(product.originalprice) + calculateVariantAdjustments();
  };

  const finalPrice = calculateFinalPrice();
  const originalPriceWithVariants = calculateOriginalPriceWithVariants();

  // Debug: Log price calculations in real-time
  useEffect(() => {
    if (product) {
      console.log("💰 Price Calculation Update:");
      console.log("Base Price:", parseFloat(product.price));
      console.log("Original Price:", product.originalprice);
      console.log("Quantity:", quantity);
      console.log("Selected Variants:", {
        color: selectedColorVariant,
        size: selectedSizeVariant,
        storage: selectedStorage,
        memory: selectedMemory,
        sim: selectedSimType,
      });
      console.log("Variant Adjustments:", calculateVariantAdjustments());
      console.log("Price per unit:", finalPrice);
      console.log("Original price with variants:", originalPriceWithVariants);
      console.log("Total Price (with quantity):", finalPrice * quantity);
      console.log("---");
    }
  }, [
    selectedColorVariant,
    selectedSizeVariant,
    selectedStorage,
    selectedMemory,
    selectedSimType,
    quantity,
    finalPrice,
    originalPriceWithVariants,
    product,
  ]);

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
          .eq("id", productId)
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
            .eq("slug", productId)
            .eq("is_active", true)
            .single();

          if (slugError) {
            throw new Error("Product not found");
          }

          setProduct(productBySlug);
          initializeDefaultSelections(productBySlug);

          if (
            productBySlug.related_products &&
            productBySlug.related_products.length > 0
          ) {
            await fetchRelatedProducts(productBySlug.related_products);
          }
        } else {
          setProduct(productData);
          initializeDefaultSelections(productData);

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

    const initializeDefaultSelections = (productData) => {
      // Don't auto-select anything - let user choose
      // This ensures intentional selection and prevents confusion
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

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch review stats for display in product header
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (product?.id) {
        const count = await getProductReviewCount(product.id);
        const avgRating = await getProductAverageRating(product.id);
        setReviewCount(count);
        setAverageRating(avgRating);
      }
    };

    fetchReviewStats();
  }, [product?.id]);

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => Math.min(prev + 1, product.stock_quantity));
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const buildCartItem = (product) => {
    const variantSelections = {
      colorVariant: selectedColorVariant,
      sizeVariant: selectedSizeVariant,
      storage: selectedStorage,
      memory: selectedMemory,
      simType: selectedSimType,
    };

    // Build variant description for display
    const variantParts = [];
    if (selectedColorVariant) variantParts.push(selectedColorVariant.name);
    if (selectedSizeVariant) variantParts.push(selectedSizeVariant.name);
    if (selectedStorage) variantParts.push(selectedStorage.value);
    if (selectedMemory) variantParts.push(selectedMemory.value);
    if (selectedSimType) variantParts.push(selectedSimType.value);

    return {
      id: product.id,
      name: product.name,
      price: finalPrice,
      basePrice: parseFloat(product.price),
      image: product.images?.[0] || "/placeholder-image.jpg",
      selectedColor: selectedColorVariant?.name || null,
      selectedSize: selectedSizeVariant?.name || null,
      quantity: quantity,
      variantSelections,
      variantDescription: variantParts.join(" • "),
      supplier_id: product.supplier_id,
    };
  };

  const handleAddToCart = () => {
    const cartItem = buildCartItem(product);
    addItem(cartItem, quantity);
    addToast(`${product.name} added to cart!`, "success");
  };

  const handleBuyNow = () => {
    const cartItem = buildCartItem(product);
    addItem(cartItem, quantity);
    addToast("Proceeding to checkout...", "success");
    router.push("/checkout");
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      addToast("Please sign in to add items to wishlist", "error");
      return;
    }

    if (!product) return;

    const discountedPrice =
      product.originalprice && product.discount
        ? (product.originalprice * (1 - product.discount / 100)).toFixed(2)
        : product.price;

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };
  const handleMessageVendor = async () => {
    if (!product.supplier_id) {
      addToast("Vendor information not available", "error");
      return;
    }

    setIsLoadingChat(true);

    try {
      // Get or create conversation directly
      const conversation = await chatApi.getOrCreateConversation(
        product.id,
        product.supplier_id
      );

      // Navigate directly to the conversation
      router.push(`/messages?id=${conversation.id}`);
    } catch (error) {
      console.error("Failed to open chat:", error);
      addToast("Failed to open chat. Please try again.", "error");
    } finally {
      setIsLoadingChat(false);
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
  const hasColorVariants =
    product.color_variants && product.color_variants.length > 0;
  const hasSizeVariants =
    product.size_variants && product.size_variants.length > 0;
  const hasStorageOptions =
    product.storage_options && product.storage_options.length > 0;
  const hasMemoryOptions =
    product.memory_options && product.memory_options.length > 0;
  const hasSimTypes = product.sim_types && product.sim_types.length > 0;
  const hasTechSpecs = hasStorageOptions || hasMemoryOptions || hasSimTypes;

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
          {/* Left Column - Images */}
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
            <div className="text-gray-800 text-xl leading-relaxed hidden md:block">
              <h1 className="font-bold text-primary text-2xl">
                Product Description
              </h1>
              <RichContentRenderer
                content={product.description}
                compact={true}
              />
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-4">
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
                rating={averageRating.average}
                totalReviews={reviewCount}
              />
              <span
                className={`text-sm ${
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

            {/* Price Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-baseline gap-3 mb-2">
                <div className="text-3xl font-bold text-gray-800">
                  {formatPrice(finalPrice * quantity)}
                </div>

                {originalPriceWithVariants && quantity === 1 && (
                  <div className="text-lg text-gray-400 line-through">
                    {formatPrice(originalPriceWithVariants)}
                  </div>
                )}
                {product.discount && (
                  <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Color Variants */}
            {hasColorVariants && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Color: {selectedColorVariant?.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.color_variants.map((colorVariant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColorVariant(colorVariant)}
                      className={`relative flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
                        selectedColorVariant?.name === colorVariant.name
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      title={colorVariant.name}
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: colorVariant.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Variants */}
            {hasSizeVariants && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Size: {selectedSizeVariant?.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.size_variants.map((sizeVariant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSizeVariant(sizeVariant)}
                      className={`px-4 py-2 border-2 rounded ${
                        selectedSizeVariant?.name === sizeVariant.name
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span className="font-medium">{sizeVariant.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            {hasTechSpecs && (
              <div className="space-y-4">
                {/* Storage Options */}
                {hasStorageOptions && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                      <HardDrive size={14} />
                      Storage: {selectedStorage?.value}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.storage_options.map((storage, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-3 py-2 text-sm border-2 rounded ${
                            selectedStorage?.value === storage.value
                              ? "bg-orange-500 text-white border-orange-500"
                              : "border-orange-200 text-gray-700 hover:border-orange-400"
                          }`}
                        >
                          {storage.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Memory Options */}
                {hasMemoryOptions && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                      <Cpu size={14} />
                      Memory: {selectedMemory?.value}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.memory_options.map((memory, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedMemory(memory)}
                          className={`px-3 py-2 text-sm border-2 rounded ${
                            selectedMemory?.value === memory.value
                              ? "bg-orange-500 text-white border-orange-500"
                              : "border-orange-200 text-gray-700 hover:border-orange-400"
                          }`}
                        >
                          {memory.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SIM Type Options */}
                {hasSimTypes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                      <Antenna size={14} />
                      SIM Type: {selectedSimType?.value}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sim_types.map((simType, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSimType(simType)}
                          className={`px-3 py-2 text-sm border-2 rounded ${
                            selectedSimType?.value === simType.value
                              ? "bg-orange-500 text-white border-orange-500"
                              : "border-orange-200 text-gray-700 hover:border-orange-400"
                          }`}
                        >
                          {simType.value}
                          {simType.priceAdjustment !== 0 && (
                            <span className="text-xs ml-1">
                              ({simType.priceAdjustment > 0 ? "+" : ""}
                              {formatPrice(simType.priceAdjustment)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-3">
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
              </div>

              {/* Action Buttons */}
              <div className="flex w-full gap-3">
                <button
                  className={`px-6 py-3 rounded font-semibold flex items-center justify-center gap-2 ${
                    isInStock
                      ? "bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                  onClick={() => isInStock && handleAddToCart()}
                  disabled={!isInStock}
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>

                <button
                  className={`px-6 py-3 rounded font-semibold flex items-center justify-center gap-2 ${
                    isInStock
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                  onClick={() => isInStock && handleBuyNow()}
                  disabled={!isInStock}
                >
                  <ShoppingBag size={20} />
                  Buy Now
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
              <button
                className={`w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all ${
                  isInStock
                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
                onClick={() => isInStock && handleMessageVendor()}
                disabled={!isInStock}
              >
                <MessageCircle size={22} />
                Chat with Seller About This Product
              </button>
            </div>

            {/* Product Details */}
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
                {product?.profiles?.full_name && (
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

            {/* Delivery Information */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 hidden md:block">
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
          <div className="text-gray-800 text-base leading-relaxed flex flex-col md:flex-row gap-4 md:hidden">
            <RichContentRenderer content={product.description} />
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 block md:hidden pt-3">
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

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
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
