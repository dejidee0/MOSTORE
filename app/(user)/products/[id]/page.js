"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/lib/toast";
import { useCart } from "@/lib/cart";
export default function ProductDetails() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(2); 
  const [quantity, setQuantity] = useState(2);
const{addItem,itemCount}=useCart();
const {addToast}=useToast();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const StarRating = ({ rating, reviews }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-orange-400 fill-current" : "text-gray-300"
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
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Product not found</p>
      </div>
    );
  }

  const relatedProducts = product.relatedProductsData || [];

  const handleAddToCart=(product)=>{
    addItem(product,1);
addToast(`${product.name} added to cart!`,'success');
    console.log("Item added to cart", product.name);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="#"
            // href="/electronics" 
            
            className="hover:text-gray-700">
              Electronics
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{product.name }</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <img
                src={product.images[selectedImage]}
                alt={product.images[selectedImage].alt_text}
                className="w-full h-96 object-contain"
              />
            </div>
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
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>
              <StarRating rating={product.rating} reviews={product.reviews} />
              <span className="text-green-600 text-sm ml-4">In Stock</span>
            </div>

            <div className="text-3xl font-bold text-gray-800">
              ${product.price}
            </div>

            <div className="text-gray-600 leading-relaxed">
              {product.description}
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Colours:</h3>
              <div className="flex gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === index
                        ? "border-gray-800"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
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

            {/* Quantity and Buy Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => handleQuantityChange("decrement")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-4 py-2 border-l border-r border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("increment")}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button className="bg-orange-500 text-white px-8 py-3 rounded font-semibold hover:bg-orange-600 flex-1" onClick={()=>handleAddToCart(product)}>
                Buy Now
              </button>
              <button className="border border-gray-300 p-3 rounded hover:bg-gray-100">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Delivery Info */}
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
                    Enter your postal code to delivery availability
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

        {/* Related Items */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-4 h-6 bg-orange-500 rounded"></div>
              Related Item
            </h2>
            <button className="text-gray-600 hover:text-gray-800">
              See All
            </button>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      {product.discount}%
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-gray-800 text-sm truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-bold">
                        ${product.price}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        ${product.originalPrice}
                      </span>
                    </div>
                    <button className="w-full bg-orange-500 text-white py-2 rounded text-sm font-medium hover:bg-orange-600 flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
                        />
                      </svg>
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No related products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
