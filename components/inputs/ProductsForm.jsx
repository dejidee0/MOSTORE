"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Upload, X, Loader2, Plus, Check, X as XIcon } from "lucide-react";

export default function ProductForm({ isOpen, onClose, productToEdit, user }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    originalprice: "",
    sku: "",
    brand: "",
    stock_quantity: "",
    category_id: "",
    colors: [],
    sizes: [],
    discount: "",
    rating: "",
    is_active: true,
    is_featured: false,
  });

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Initialize form with product data if in edit mode
  useEffect(() => {
    if (productToEdit) {
      setIsEditMode(true);
      setFormData({
        name: productToEdit.name,
        slug: productToEdit.slug,
        description: productToEdit.description,
        short_description: productToEdit.short_description || "",
        price: productToEdit.price.toString(),
        originalprice: productToEdit.originalprice?.toString() || "",
        sku: productToEdit.sku,
        brand: productToEdit.brand || "",
        stock_quantity: productToEdit.stock_quantity.toString(),
        category_id: productToEdit.category_id || "",
        colors: productToEdit.colors || [],
        sizes: productToEdit.sizes || [],
        discount: productToEdit.discount?.toString() || "",
        rating: productToEdit.rating?.toString() || "",
        is_active: productToEdit.is_active,
        is_featured: productToEdit.is_featured,
      });
      setExistingImages(productToEdit.images || []);
    } else {
      setIsEditMode(false);
      resetForm();
    }
  }, [productToEdit]);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
          const { data, error } = await supabase
            .from("categories")
            .select("id, name");

          if (error) {
            console.error("Error fetching categories:", error.message);
            return;
          }

          if (data) {
            setCategories(data);
          }
        } finally {
          setCategoriesLoading(false);
        }
      };

      fetchCategories();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length + existingImages.length > 4) {
      setError("Maximum 4 images allowed per product");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          name: file.name,
          isNew: true,
        };
        setImages((prev) => [...prev, newImage]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (imageId) => {
    // Check if it's a new image or existing one
    const imageToRemove =
      images.find((img) => img.id === imageId) ||
      existingImages.find((img) => img.id === imageId);

    if (imageToRemove.isNew) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setImageFiles((prev) =>
        prev.filter((file) => file !== imageToRemove.file)
      );
    } else {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  const addColor = () => {
    if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, colorInput.trim()],
      }));
      setColorInput("");
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  const addSize = () => {
    if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()],
      }));
      setSizeInput("");
    }
  };

  const removeSize = (sizeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }));
  };

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const slug = generateSlug(newCategoryName);

      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            name: newCategoryName.trim(),
            slug: slug,
          },
        ])
        .select();

      if (error) throw error;

      const newCategory = data[0];
      setCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name))
      );
      setFormData((prev) => ({ ...prev, category_id: newCategory.id }));
      setNewCategoryName("");
      setShowNewCategoryInput(false);
      setSuccess("New category created successfully!");
    } catch (err) {
      setError(`Failed to create new category: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const required = [
      "name",
      "description",
      "price",
      "sku",
      "stock_quantity",
      "category_id",
    ];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      setError(`Please fill in required fields: ${missing.join(", ")}`);
      return false;
    }

    if (images.length + existingImages.length === 0) {
      setError("Please add at least one product image");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. Upload new images to Supabase Storage and get public URLs
      const uploadedImageUrls = [];

      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) {
          throw new Error("Image upload failed: " + error.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        uploadedImageUrls.push(publicUrlData.publicUrl);
      }

      // Combine existing images with new ones
      const allImages = [
        ...existingImages.map((img) => img.url),
        ...uploadedImageUrls,
      ];

      // Prepare product data
      const productData = {
        name: formData.name,
        slug: formData.slug,
        supplier_id: user.id,
        description: formData.description,
        short_description: formData.short_description || null,
        price: Number(formData.price),
        originalprice: formData.originalprice
          ? Number(formData.originalprice)
          : null,
        sku: formData.sku,
        brand: formData.brand || null,
        stock_quantity: Number(formData.stock_quantity),
        category_id: formData.category_id || null,
        images: allImages,
        colors: formData.colors,
        sizes: formData.sizes,
        discount: formData.discount ? Number(formData.discount) : null,
        rating: formData.rating ? Number(formData.rating) : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      };

      // 2. Insert or update based on mode
      let result;
      if (isEditMode) {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productToEdit.id)
          .select();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select();

        if (error) throw error;
        result = data;
      }

      // 3. Reset + notify
      setSuccess(`Product ${isEditMode ? "updated" : "added"} successfully!`);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      setError(
        err.message || `Failed to ${isEditMode ? "update" : "add"} product`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: "",
      originalprice: "",
      sku: "",
      brand: "",
      stock_quantity: "",
      category_id: "",
      colors: [],
      sizes: [],
      discount: "",
      rating: "",
      is_active: true,
      is_featured: false,
    });
    setImages([]);
    setImageFiles([]);
    setExistingImages([]);
    setColorInput("");
    setSizeInput("");
    setError("");
    setSuccess("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {isEditMode ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-orange-100 mt-1">
                  {isEditMode
                    ? "Update this product in your catalog"
                    : "Create a new product for your catalog"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X size={24} className="text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter product name (e.g., iPhone 15 Pro Max)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Product Slug - Auto-generated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Slug{" "}
                  <span className="text-gray-400">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="product-url-slug"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  disabled={isLoading}
                />
              </div>

              {/* SKU - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Enter unique SKU (e.g., IPH15PM-256-BLK)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading || isEditMode} // Disable editing SKU in edit mode
                  required
                />
              </div>

              {/* Brand - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Enter brand name (e.g., Apple, Samsung)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-orange-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isLoading || categoriesLoading}
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* New Category Input */}
              {showNewCategoryInput && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name (e.g., Smartphones, Laptops)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                    disabled={isLoading}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), createNewCategory())
                    }
                  />
                  <button
                    type="button"
                    onClick={createNewCategory}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              )}
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Short Description - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  placeholder="Brief product summary for listings (max 150 characters)"
                  rows={3}
                  maxLength={150}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.short_description.length}/150 characters
                </p>
              </div>

              {/* Full Description - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description <span className="text-orange-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed product description with features and specifications"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Pricing Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Current Price - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Original Price - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalprice}
                  onChange={handleInputChange}
                  placeholder="149.99"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Discount Percentage - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount % <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Stock Quantity - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images <span className="text-orange-500">*</span>
                <span className="text-gray-400 text-xs ml-2">
                  (Max 4 images)
                </span>
              </label>

              {/* Image Upload Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={
                    isLoading || images.length + existingImages.length >= 4
                  }
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    images.length + existingImages.length >= 4
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="text-gray-400" size={32} />
                  <span className="text-gray-600">
                    {images.length + existingImages.length >= 4
                      ? "Maximum images reached"
                      : "Click to upload images"}
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, JPEG up to 10MB each
                  </span>
                </label>
              </div>

              {/* Image Previews */}
              {/* Image Previews */}
              {(images.length > 0 || existingImages.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {/* Existing images */}
                  {existingImages.map((image) => (
                    <div
                      key={`existing-${image.id}`}
                      className="relative group"
                    >
                      <img
                        src={image.url}
                        alt={image.name || "Product image"}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        disabled={isLoading}
                      >
                        <X size={16} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {image.name || "Existing image"}
                      </p>
                    </div>
                  ))}

                  {/* New images */}
                  {images.map((image) => (
                    <div key={`new-${image.id}`} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        disabled={isLoading}
                      >
                        <X size={16} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colors and Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Colors{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Enter color (e.g., Red, Blue, Black)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isLoading}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addColor())
                    }
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    disabled={isLoading}
                  >
                    Add
                  </button>
                </div>
                {/* Color Tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color, index) => (
                    <span
                      key={`color-${index}-${color}`} // Added unique key
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-orange-600 hover:text-orange-800"
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Enter size (e.g., S, M, L, XL)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isLoading}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSize())
                    }
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    disabled={isLoading}
                  >
                    Add
                  </button>
                </div>
                {/* Size Tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size, index) => (
                    <span
                      key={`size-${index}-${size}`} // Added unique key
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-orange-600 hover:text-orange-800"
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Rating{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              {/* Product Status Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Product is Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : isEditMode ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
