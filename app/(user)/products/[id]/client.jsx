"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/lib/toast";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/lib/supabase-client";
import { Heart, ShoppingCart, HardDrive, Cpu, Gift, Send } from "lucide-react";
import { motion } from "framer-motion";
import ProductReviews, { StarRating } from "./reviews";
import { getProductAverageRating, getProductReviewCount } from "@/lib/reviews";
import { useRouter } from "next/navigation";
import { ShoppingBag, Antenna, MessageCircle } from "lucide-react";
import RichContentRenderer from "@/components/rich-text-renderer";
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

  // Check if product is charity
  const isCharity = product?.product_type === "charity";

  // Check if product is in wishlist
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Calculate variant adjustments sum
  const calculateVariantAdjustments = () => {
    if (isCharity) return 0; // No price adjustments for charity items

    let adjustments = 0;

    if (selectedColorVariant?.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedColorVariant.priceAdjustment) || 0;
    }

    if (selectedSizeVariant?.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedSizeVariant.priceAdjustment) || 0;
    }

    if (selectedStorage?.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedStorage.priceAdjustment) || 0;
    }

    if (selectedMemory?.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedMemory.priceAdjustment) || 0;
    }

    if (selectedSimType?.priceAdjustment !== undefined) {
      adjustments += parseFloat(selectedSimType.priceAdjustment) || 0;
    }

    return adjustments;
  };

  // Calculate final price based on all selected variants
  const calculateFinalPrice = () => {
    if (!product || isCharity) return 0;
    return parseFloat(product.price) + calculateVariantAdjustments();
  };

  // Calculate original price with variant adjustments (for strikethrough)
  const calculateOriginalPriceWithVariants = () => {
    if (!product || !product.originalprice || isCharity) return null;
    return parseFloat(product.originalprice) + calculateVariantAdjustments();
  };

  const finalPrice = calculateFinalPrice();
  const originalPriceWithVariants = calculateOriginalPriceWithVariants();

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
    if (isCharity) {
      addToast("Please use 'Request Item' to claim this charity item", "info");
      return;
    }

    const cartItem = buildCartItem(product);
    addItem(cartItem, quantity);
    addToast(`${product.name} added to cart!`, "success");
  };

  const handleBuyNow = () => {
    if (isCharity) {
      addToast("Please use 'Request Item' to claim this charity item", "info");
      return;
    }

    const cartItem = buildCartItem(product);
    addItem(cartItem, quantity);
    addToast("Proceeding to checkout...", "success");
    router.push("/checkout");
  };

  const handleRequestItem = async () => {
    if (!isAuthenticated) {
      addToast("Please sign in to request charity items", "error");
      router.push("/sign-in");
      return;
    }

    // Open chat with seller for charity item request
    handleMessageVendor();
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      addToast("Please sign in to add items to wishlist", "error");
      return;
    }

    if (!product) return;

    const discountedPrice = isCharity
      ? 0
      : product.originalprice && product.discount
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
      product_type: product.product_type,
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
      const conversation = await chatApi.getOrCreateConversation(
        product.id,
        product.supplier_id
      );

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
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            {product.categories && (
              <>
                <Link href={`/products`} className="hover:text-gray-700">
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
            <div className="border border-gray-200 rounded-lg p-4 bg-white relative">
              {isCharity && (
                <div className="absolute top-6 left-6 z-10 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 font-semibold">
                  <Gift className="w-5 h-5" />
                  Charity Item
                </div>
              )}
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
                        ? isCharity
                          ? "border-green-500"
                          : "border-orange-500"
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
              <h1
                className={`font-bold text-2xl ${
                  isCharity ? "text-green-600" : "text-primary"
                }`}
              >
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
                {isCharity ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Free Item
                  </span>
                ) : (
                  product.condition && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.condition === "new"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {product.condition === "new" ? "Brand New" : "Pre-Owned"}
                    </span>
                  )
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
            {isCharity ? (
              <div
                className={`border rounded-lg py-6 px-4 text-center ${
                  isCharity
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Gift className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      Free to Good Home
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      This item is being offered for free as a charity donation
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg py-4 px-0">
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
            )}

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
                          ? isCharity
                            ? "border-green-500 bg-green-50"
                            : "border-orange-500 bg-orange-50"
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
                          ? isCharity
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-orange-500 text-white border-orange-500"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span className="font-medium">{sizeVariant.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications - Hide price adjustments for charity */}
            {hasTechSpecs && (
              <div className="space-y-4">
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
                              ? isCharity
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-orange-500 text-white border-orange-500"
                              : isCharity
                              ? "border-green-200 text-gray-700 hover:border-green-400"
                              : "border-orange-200 text-gray-700 hover:border-orange-400"
                          }`}
                        >
                          {storage.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                              ? isCharity
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-orange-500 text-white border-orange-500"
                              : isCharity
                              ? "border-green-200 text-gray-700 hover:border-green-400"
                              : "border-orange-200 text-gray-700 hover:border-orange-400"
                          }`}
                        >
                          {memory.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                              ? isCharity
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-orange-500 text-white border-orange-500"
                              : isCharity
                              ? "border-green-200 text-gray-700 hover:border-green-400"
                              : "border-orange-200 text-gray-700 hover:border-orange-400"
                          }`}
                        >
                          {simType.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Actions - Different for charity */}
            <div className="space-y-3">
              {!isCharity && (
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
              )}

              {/* Action Buttons */}
              {isCharity ? (
                <div className="space-y-3">
                  <button
                    className={`w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                      isInStock
                        ? "bg-green-500 text-white hover:bg-green-600 shadow-lg"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                    onClick={handleRequestItem}
                    disabled={!isInStock || isLoadingChat}
                  >
                    <Send size={20} />
                    {isLoadingChat ? "Opening Chat..." : "Request This Item"}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className={`w-full border-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isWishlisted
                        ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                        : "border-green-500 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                    {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>

                  <p className="text-sm text-green-700 text-center bg-green-50 p-3 rounded-lg">
                    💚 This item is free! Request it to start a conversation
                    with the donor.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex w-full gap-3">
                    <button
                      className={`px-6 py-3 rounded font-semibold flex items-center justify-center gap-2 ${
                        isInStock
                          ? "bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                          : "bg-gray-400 text-white cursor-not-allowed"
                      }`}
                      onClick={handleAddToCart}
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
                      onClick={handleBuyNow}
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
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-200 ${
                          isWishlisted ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Message Vendor */}
                  <button
                    onClick={handleMessageVendor}
                    disabled={isLoadingChat}
                    className="w-full mt-3 border border-gray-300 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
                  >
                    <MessageCircle size={20} />
                    {isLoadingChat ? "Opening chat..." : "Message Seller"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Description */}
        <div className="mt-10 md:hidden bg-white p-4 rounded-lg border">
          <h2
            className={`font-bold text-xl mb-3 ${
              isCharity ? "text-green-600" : "text-gray-800"
            }`}
          >
            Product Description
          </h2>
          <RichContentRenderer content={product.description} />
        </div>

        {!isCharity && (
          <>
            <div className="mt-14">
              <ProductReviews productId={product.id} />
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Related Products
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.slug || item.id}`}
                      className="bg-white border rounded-lg p-3 hover:shadow-lg transition"
                    >
                      <img
                        src={item.images?.[0] || "/placeholder-image.jpg"}
                        alt={item.name}
                        className="w-full h-40 object-contain mb-3"
                      />
                      <h3 className="font-medium text-sm text-gray-800 truncate">
                        {item.name}
                      </h3>

                      {item.product_type === "charity" ? (
                        <p className="text-green-600 font-semibold mt-1">
                          Free
                        </p>
                      ) : (
                        <p className="text-orange-600 font-semibold mt-1">
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {/* Reviews Section */}
      </div>
    </div>
  );
}
