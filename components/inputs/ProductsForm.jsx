"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import {
  Upload,
  X,
  Loader2,
  Plus,
  Check,
  X as XIcon,
  Package,
  Save,
  Palette,
  DollarSign,
  Smartphone,
  HardDrive,
  Cpu,
  Antenna,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Predefined color palette with common colors
const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gray", hex: "#808080" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#00FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Purple", hex: "#800080" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Navy", hex: "#000080" },
  { name: "Teal", hex: "#008080" },
];

export default function ProductForm({ isOpen, onClose, productToEdit, user }) {
  const AUTOSAVE_KEY = "product_form_autosave";

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
    condition: "new",
    discount: "",
    rating: "",
    is_active: true,
    is_featured: false,
  });

  // New state for variants
  const [colorVariants, setColorVariants] = useState([]);
  const [sizeVariants, setSizeVariants] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [memoryOptions, setMemoryOptions] = useState([]);
  const [simTypes, setSimTypes] = useState([]);

  // Input states for variants
  const [colorInput, setColorInput] = useState({
    name: "",
    hex: "#000000",
    priceAdjustment: "",
  });
  const [sizeInput, setSizeInput] = useState({ name: "", priceAdjustment: "" });
  const [storageInput, setStorageInput] = useState({
    value: "",
    priceAdjustment: "",
  });
  const [memoryInput, setMemoryInput] = useState({
    value: "",
    priceAdjustment: "",
  });
  const [simInput, setSimInput] = useState({ value: "", priceAdjustment: "" });

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [authUser, setAuthUser] = useState(user);
  const [lastSaved, setLastSaved] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Check if category requires tech specs
  const isTechCategory = () => {
    if (!selectedCategory) return false;
    const categoryName = selectedCategory.name?.toLowerCase() || "";
    return (
      categoryName.includes("mobile") ||
      categoryName.includes("phone") ||
      categoryName.includes("computer") ||
      categoryName.includes("laptop") ||
      categoryName.includes("tablet")
    );
  };

  // Autosave form data to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!isEditMode) {
      const dataToSave = {
        formData,
        colorVariants,
        sizeVariants,
        storageOptions,
        memoryOptions,
        simTypes,
        images: images.map((img) => ({
          id: img.id,
          preview: img.preview,
          name: img.name,
        })),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
    }
  }, [
    formData,
    colorVariants,
    sizeVariants,
    storageOptions,
    memoryOptions,
    simTypes,
    images,
    isEditMode,
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!productToEdit) {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedTime = new Date(parsed.timestamp);
          const hoursSinceLastSave =
            (new Date() - savedTime) / (1000 * 60 * 60);

          if (hoursSinceLastSave < 24) {
            setFormData(parsed.formData);
            setColorVariants(parsed.colorVariants || []);
            setSizeVariants(parsed.sizeVariants || []);
            setStorageOptions(parsed.storageOptions || []);
            setMemoryOptions(parsed.memoryOptions || []);
            setSimTypes(parsed.simTypes || []);
            if (parsed.images.length > 0) {
              setSuccess(
                `Draft restored from ${savedTime.toLocaleString()}. Please re-upload images.`
              );
            }
            setLastSaved(savedTime);
          } else {
            localStorage.removeItem(AUTOSAVE_KEY);
          }
        } catch (err) {
          console.error("Error loading autosave:", err);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [productToEdit]);

  // Autosave on form changes (debounced)
  useEffect(() => {
    if (!isEditMode && isOpen) {
      const timer = setTimeout(() => {
        saveToLocalStorage();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [
    formData,
    colorVariants,
    sizeVariants,
    storageOptions,
    memoryOptions,
    simTypes,
    images,
    isEditMode,
    isOpen,
    saveToLocalStorage,
  ]);

  // Save on visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isEditMode && isOpen) {
        saveToLocalStorage();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [saveToLocalStorage, isEditMode, isOpen]);

  // Save on beforeunload (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isEditMode && isOpen) {
        saveToLocalStorage();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveToLocalStorage, isEditMode, isOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser) {
        try {
          const {
            data: { user: fetchedUser },
            error,
          } = await supabase.auth.getUser();
          if (error) {
            console.error("Error fetching user in ProductForm:", error);
            setError("Failed to authenticate user");
            return;
          }
          if (fetchedUser) {
            setAuthUser(fetchedUser);
          } else {
            setError("User not authenticated");
          }
        } catch (err) {
          console.error("Client-side auth error in ProductForm:", err);
          setError("Failed to authenticate user");
        }
      }
    };

    fetchUser();
  }, [authUser]);

  const generateRandomSKU = async () => {
    const prefix = "PRD";
    const randomPart = uuidv4().split("-")[0].toUpperCase();
    const potentialSKU = `${prefix}-${randomPart}`;

    const { data, error } = await supabase
      .from("products")
      .select("sku")
      .eq("sku", potentialSKU);

    if (error) {
      console.error("Error checking SKU:", error.message);
      return potentialSKU;
    }

    if (data && data.length > 0) {
      return generateRandomSKU();
    }

    return potentialSKU;
  };

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
        condition: productToEdit.condition || "new",
        discount: productToEdit.discount?.toString() || "",
        rating: productToEdit.rating?.toString() || "",
        is_active: productToEdit.is_active,
        is_featured: productToEdit.is_featured,
      });

      // Load variants
      setColorVariants(productToEdit.color_variants || []);
      setSizeVariants(productToEdit.size_variants || []);
      setStorageOptions(productToEdit.storage_options || []);
      setMemoryOptions(productToEdit.memory_options || []);
      setSimTypes(productToEdit.sim_types || []);

      setExistingImages(
        (productToEdit.images || []).map((url, index) => ({
          id: `existing-${index}`,
          url,
          name: `Image ${index + 1}`,
          isNew: false,
        }))
      );
    } else {
      setIsEditMode(false);
      if (!localStorage.getItem(AUTOSAVE_KEY)) {
        resetForm();
        generateRandomSKU().then((sku) => {
          setFormData((prev) => ({ ...prev, sku }));
        });
      }
    }
  }, [productToEdit]);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
          const { data, error } = await supabase
            .from("categories")
            .select("id, name, slug");

          if (error) {
            console.error("Error fetching categories:", error.message);
            setError("Failed to load categories");
            return;
          }

          if (data) {
            setCategories(data);
            // Set selected category if editing
            if (productToEdit?.category_id) {
              const category = data.find(
                (c) => c.id === productToEdit.category_id
              );
              setSelectedCategory(category);
            }
          }
        } finally {
          setCategoriesLoading(false);
        }
      };

      fetchCategories();
    }
  }, [isOpen, productToEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find((c) => c.id === parseInt(categoryId));
    setSelectedCategory(category);
    setFormData((prev) => ({
      ...prev,
      category_id: categoryId,
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

      if (file.size > 10 * 1024 * 1024) {
        setError("Each image must be less than 10MB");
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

  const removeImage = async (imageId) => {
    const imageToRemove =
      images.find((img) => img.id === imageId) ||
      existingImages.find((img) => img.id === imageId);

    if (imageToRemove.isNew) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setImageFiles((prev) =>
        prev.filter((file) => file !== imageToRemove.file)
      );
    } else {
      const path = imageToRemove.url.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([path]);

      if (storageError) {
        console.error("Error deleting image from storage:", storageError);
        setError(
          "Failed to delete image from storage: " + storageError.message
        );
        return;
      }

      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  // Color variant functions
  const addColorVariant = () => {
    if (colorInput.name.trim()) {
      const newColor = {
        name: colorInput.name.trim(),
        hex: colorInput.hex,
        priceAdjustment: colorInput.priceAdjustment
          ? parseFloat(colorInput.priceAdjustment)
          : 0,
      };
      setColorVariants((prev) => [...prev, newColor]);
      setColorInput({ name: "", hex: "#000000", priceAdjustment: "" });
    }
  };

  const removeColorVariant = (index) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const selectPresetColor = (color) => {
    setColorInput((prev) => ({ ...prev, name: color.name, hex: color.hex }));
    setShowColorPicker(false);
  };

  // Size variant functions
  const addSizeVariant = () => {
    if (sizeInput.name.trim()) {
      const newSize = {
        name: sizeInput.name.trim(),
        priceAdjustment: sizeInput.priceAdjustment
          ? parseFloat(sizeInput.priceAdjustment)
          : 0,
      };
      setSizeVariants((prev) => [...prev, newSize]);
      setSizeInput({ name: "", priceAdjustment: "" });
    }
  };

  const removeSizeVariant = (index) => {
    setSizeVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Storage option functions
  const addStorageOption = () => {
    if (storageInput.value.trim()) {
      const newStorage = {
        value: storageInput.value.trim(),
        priceAdjustment: storageInput.priceAdjustment
          ? parseFloat(storageInput.priceAdjustment)
          : 0,
      };
      setStorageOptions((prev) => [...prev, newStorage]);
      setStorageInput({ value: "", priceAdjustment: "" });
    }
  };

  const removeStorageOption = (index) => {
    setStorageOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Memory option functions
  const addMemoryOption = () => {
    if (memoryInput.value.trim()) {
      const newMemory = {
        value: memoryInput.value.trim(),
        priceAdjustment: memoryInput.priceAdjustment
          ? parseFloat(memoryInput.priceAdjustment)
          : 0,
      };
      setMemoryOptions((prev) => [...prev, newMemory]);
      setMemoryInput({ value: "", priceAdjustment: "" });
    }
  };

  const removeMemoryOption = (index) => {
    setMemoryOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // SIM type functions
  const addSimType = () => {
    if (simInput.value.trim()) {
      const newSim = {
        value: simInput.value.trim(),
        priceAdjustment: simInput.priceAdjustment
          ? parseFloat(simInput.priceAdjustment)
          : 0,
      };
      setSimTypes((prev) => [...prev, newSim]);
      setSimInput({ value: "", priceAdjustment: "" });
    }
  };

  const removeSimType = (index) => {
    setSimTypes((prev) => prev.filter((_, i) => i !== index));
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
      setSelectedCategory(newCategory);
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
      "condition",
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

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError("Price must be a positive number");
      return false;
    }

    if (
      formData.originalprice &&
      (isNaN(Number(formData.originalprice)) ||
        Number(formData.originalprice) <= 0)
    ) {
      setError("Original price must be a positive number if provided");
      return false;
    }

    if (
      formData.discount &&
      (isNaN(Number(formData.discount)) ||
        Number(formData.discount) < 0 ||
        Number(formData.discount) > 100)
    ) {
      setError("Discount must be between 0 and 100 if provided");
      return false;
    }

    if (
      isNaN(Number(formData.stock_quantity)) ||
      Number(formData.stock_quantity) < 0
    ) {
      setError("Stock quantity must be a non-negative number");
      return false;
    }

    return true;
  };

  const getLocationFromIP = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to fetch location");
      }
      const data = await response.json();
      return `${data.region || "Unknown"}, ${data.country_name || "Unknown"}`;
    } catch (err) {
      console.error("Error fetching location:", err);
      return null;
    }
  };

  // ============================================
  // GUARANTEED WORKING handleSubmit Function
  // Schema verified - all JSONB columns exist
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authUser) {
      setError("User not authenticated");
      console.error("No authenticated user available");
      return;
    }

    setError("");
    setSuccess("");

    if (!validateForm()) {
      console.error("Form validation failed");
      return;
    }

    setIsLoading(true);

    try {
      // SKU uniqueness check
      if (!isEditMode) {
        const { data: existingSKU, error: skuError } = await supabase
          .from("products")
          .select("sku")
          .eq("sku", formData.sku);

        if (skuError) {
          throw new Error("Error checking SKU: " + skuError.message);
        }

        if (existingSKU && existingSKU.length > 0) {
          const newSKU = await generateRandomSKU();
          setFormData((prev) => ({ ...prev, sku: newSKU }));
          throw new Error("SKU already exists, generated a new one");
        }
      }

      // Upload images
      const uploadedImageUrls = [];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${uuidv4()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) {
          console.error("Image upload error:", error);
          throw new Error("Image upload failed: " + error.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        if (!publicUrlData?.publicUrl) {
          throw new Error("Failed to get public URL for uploaded image");
        }

        uploadedImageUrls.push(publicUrlData.publicUrl);
      }

      const allImages = [
        ...existingImages.map((img) => img.url),
        ...uploadedImageUrls,
      ];

      const location = await getLocationFromIP();

      // ==========================================
      // CRITICAL: Safe variant array preparation
      // This guarantees valid JSONB arrays
      // ==========================================

      const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

      const finalColorVariants = safeArray(colorVariants);
      const finalSizeVariants = safeArray(sizeVariants);
      const finalStorageOptions = safeArray(storageOptions);
      const finalMemoryOptions = safeArray(memoryOptions);
      const finalSimTypes = safeArray(simTypes);

      // Debug logging
      console.log("🔍 Variant data being prepared:");
      console.log("colorVariants state:", colorVariants);
      console.log("finalColorVariants:", finalColorVariants);
      console.log("Counts:", {
        colors: finalColorVariants.length,
        sizes: finalSizeVariants.length,
        storage: finalStorageOptions.length,
        memory: finalMemoryOptions.length,
        sim: finalSimTypes.length,
      });

      // ==========================================
      // Build product data - EXACT schema match
      // ==========================================
      const productData = {
        // TEXT columns
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description || null,
        sku: formData.sku,
        brand: formData.brand || null,
        condition: formData.condition,
        location: location || null,

        // UUID column
        supplier_id: authUser.id,

        // NUMERIC columns
        price: parseFloat(formData.price),
        originalprice: formData.originalprice
          ? parseFloat(formData.originalprice)
          : null,

        // INTEGER columns
        discount: formData.discount ? parseInt(formData.discount, 10) : null,
        rating: formData.rating ? parseInt(formData.rating, 10) : null,
        stock_quantity: parseInt(formData.stock_quantity, 10),
        category_id: formData.category_id
          ? parseInt(formData.category_id, 10)
          : null,

        // BOOLEAN columns
        is_active: formData.is_active,
        is_featured: formData.is_featured,

        // JSONB columns - backward compatibility
        images: allImages,
        colors: finalColorVariants.map((c) => c.name),
        sizes: finalSizeVariants.map((s) => s.name),

        // ==========================================
        // JSONB columns - NEW VARIANTS
        // These MUST be arrays, never null
        // ==========================================
        color_variants: finalColorVariants,
        size_variants: finalSizeVariants,
        storage_options: finalStorageOptions,
        memory_options: finalMemoryOptions,
        sim_types: finalSimTypes,
      };

      console.log("📦 Product data to insert/update:", {
        name: productData.name,
        price: productData.price,
        category_id: productData.category_id,
        variant_data: {
          color_variants_length: productData.color_variants.length,
          size_variants_length: productData.size_variants.length,
          storage_options_length: productData.storage_options.length,
          memory_options_length: productData.memory_options.length,
          sim_types_length: productData.sim_types.length,
        },
        color_variants_sample: productData.color_variants[0] || null,
        size_variants_sample: productData.size_variants[0] || null,
      });

      // Execute database operation
      let result;
      if (isEditMode) {
        console.log("🔄 Updating product ID:", productToEdit.id);

        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productToEdit.id)
          .select();

        if (error) {
          console.error("❌ Update error:", error);
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw new Error("Failed to update product: " + error.message);
        }

        result = data;
      } else {
        console.log("➕ Inserting new product");

        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select();

        if (error) {
          console.error("❌ Insert error:", error);
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw new Error("Failed to add product: " + error.message);
        }

        result = data;
      }

      // ==========================================
      // Verify what was actually saved
      // ==========================================
      if (result && result[0]) {
        const saved = result[0];

        console.log("✅ Product saved successfully!");
        console.log("📊 Verification - what's in database:");
        console.log({
          id: saved.id,
          name: saved.name,
          color_variants: saved.color_variants,
          size_variants: saved.size_variants,
          storage_options: saved.storage_options,
          memory_options: saved.memory_options,
          sim_types: saved.sim_types,
        });

        // Check if variants match what we sent
        const sentCounts = {
          colors: finalColorVariants.length,
          sizes: finalSizeVariants.length,
          storage: finalStorageOptions.length,
          memory: finalMemoryOptions.length,
          sim: finalSimTypes.length,
        };

        const savedCounts = {
          colors: saved.color_variants?.length || 0,
          sizes: saved.size_variants?.length || 0,
          storage: saved.storage_options?.length || 0,
          memory: saved.memory_options?.length || 0,
          sim: saved.sim_types?.length || 0,
        };

        console.log("📈 Comparison:");
        console.log("Sent:", sentCounts);
        console.log("Saved:", savedCounts);

        // Warn if mismatch
        if (sentCounts.colors !== savedCounts.colors) {
          console.warn("⚠️ Color variants mismatch!");
          console.warn("Sent:", finalColorVariants);
          console.warn("Saved:", saved.color_variants);
        }

        if (sentCounts.sizes !== savedCounts.sizes) {
          console.warn("⚠️ Size variants mismatch!");
          console.warn("Sent:", finalSizeVariants);
          console.warn("Saved:", saved.size_variants);
        }

        if (sentCounts.storage !== savedCounts.storage) {
          console.warn("⚠️ Storage options mismatch!");
          console.warn("Sent:", finalStorageOptions);
          console.warn("Saved:", saved.storage_options);
        }
      }

      // Clear autosave
      localStorage.removeItem(AUTOSAVE_KEY);

      setSuccess(`Product ${isEditMode ? "updated" : "added"} successfully!`);

      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      console.error("💥 Submit error:", err);
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
      condition: "new",
      discount: "",
      rating: "",
      is_active: true,
      is_featured: false,
    });
    setImages([]);
    setImageFiles([]);
    setExistingImages([]);
    setColorVariants([]);
    setSizeVariants([]);
    setStorageOptions([]);
    setMemoryOptions([]);
    setSimTypes([]);
    setColorInput({ name: "", hex: "#000000", priceAdjustment: "" });
    setSizeInput({ name: "", priceAdjustment: "" });
    setStorageInput({ value: "", priceAdjustment: "" });
    setMemoryInput({ value: "", priceAdjustment: "" });
    setSimInput({ value: "", priceAdjustment: "" });
    setSelectedCategory(null);
    setError("");
    setSuccess("");
    setLastSaved(null);
    generateRandomSKU().then((sku) => {
      setFormData((prev) => ({ ...prev, sku }));
    });
  };

  const clearAutosave = () => {
    if (confirm("Are you sure you want to discard the saved draft?")) {
      localStorage.removeItem(AUTOSAVE_KEY);
      resetForm();
      setSuccess("Draft cleared successfully!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 sticky top-0 z-10">
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
                {lastSaved && !isEditMode && (
                  <p className="text-orange-200 text-sm mt-2 flex items-center gap-1">
                    <Save size={14} />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
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

          <form
            onSubmit={handleSubmit}
            method="POST"
            action=""
            className="p-6 space-y-6"
          >
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

            {!isEditMode && lastSaved && (
              <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700">
                  <Save size={16} />
                  <span className="text-sm">
                    Draft auto-saved at {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearAutosave}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Draft
                </button>
              </div>
            )}

            {/* Basic Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-orange-500">*</span>{" "}
                    <span className="text-gray-400">
                      ({isEditMode ? "Fixed" : "Auto-generated"})
                    </span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Auto-generated SKU"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                    disabled={isLoading || true}
                    required
                  />
                </div>

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

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Condition <span className="text-orange-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, condition: "new" }))
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                      formData.condition === "new"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                    disabled={isLoading}
                  >
                    <Package className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">New</div>
                      <div className="text-xs opacity-75">
                        Brand new product
                      </div>
                    </div>
                    {formData.condition === "new" && (
                      <Check className="w-5 h-5 ml-auto" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, condition: "used" }))
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                      formData.condition === "used"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                    disabled={isLoading}
                  >
                    <Package className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Used</div>
                      <div className="text-xs opacity-75">
                        Pre-owned product
                      </div>
                    </div>
                    {formData.condition === "used" && (
                      <Check className="w-5 h-5 ml-auto" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-orange-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleCategoryChange}
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
                  </div>
                )}
              </div>
            </div>

            {/* Descriptions */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Descriptions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description{" "}
                    <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    placeholder="Brief product summary for listings (max 300 characters)"
                    rows={3}
                    maxLength={300}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.short_description.length}/300 characters
                  </p>
                </div>

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
            </div>

            {/* Pricing */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing & Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      €
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="99.99"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Variants may adjust this price
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price{" "}
                    <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      €
                    </span>
                    <input
                      type="number"
                      name="originalprice"
                      value={formData.originalprice}
                      onChange={handleInputChange}
                      placeholder="149.99"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
            </div>

            {/* Product Images */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Images
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images <span className="text-orange-500">*</span>
                <span className="text-gray-400 text-xs ml-2">
                  (Max 4 images)
                </span>
              </label>

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

              {(images.length > 0 || existingImages.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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

            {/* Color Variants */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-500" />
                Color Variants{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (Optional)
                </span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add color options with visual preview and optional price
                adjustments
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Name
                    </label>
                    <input
                      type="text"
                      value={colorInput.name}
                      onChange={(e) =>
                        setColorInput((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Midnight Black"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Preview
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="color"
                          value={colorInput.hex}
                          onChange={(e) =>
                            setColorInput((prev) => ({
                              ...prev,
                              hex: e.target.value,
                            }))
                          }
                          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                          disabled={isLoading}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                      >
                        <Palette size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Adjustment{" "}
                      <span className="text-gray-400">(€)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">
                        €
                      </span>
                      <input
                        type="number"
                        value={colorInput.priceAdjustment}
                        onChange={(e) =>
                          setColorInput((prev) => ({
                            ...prev,
                            priceAdjustment: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +/- amount from base price
                    </p>
                  </div>
                </div>

                {showColorPicker && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Quick Color Selection
                    </p>
                    <div className="grid grid-cols-8 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => selectPresetColor(color)}
                          className="group relative"
                          title={color.name}
                        >
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-orange-500 transition-colors cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={addColorVariant}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Plus size={16} />
                  Add Color
                </button>

                {colorVariants.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map((color, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                      >
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm font-medium">
                          {color.name}
                        </span>
                        {color.priceAdjustment !== 0 && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {color.priceAdjustment > 0 ? "+" : ""}€
                            {color.priceAdjustment.toFixed(2)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeColorVariant(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Size Variants */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Size Variants{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (Optional)
                </span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add size options with optional price adjustments
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Name
                    </label>
                    <input
                      type="text"
                      value={sizeInput.name}
                      onChange={(e) =>
                        setSizeInput((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Medium, Large, XL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isLoading}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addSizeVariant())
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Adjustment{" "}
                      <span className="text-gray-400">(€)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">
                        €
                      </span>
                      <input
                        type="number"
                        value={sizeInput.priceAdjustment}
                        onChange={(e) =>
                          setSizeInput((prev) => ({
                            ...prev,
                            priceAdjustment: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isLoading}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addSizeVariant())
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +/- amount from base price
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addSizeVariant}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Plus size={16} />
                  Add Size
                </button>

                {sizeVariants.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sizeVariants.map((size, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                      >
                        <span className="text-sm font-medium">{size.name}</span>
                        {size.priceAdjustment !== 0 && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {size.priceAdjustment > 0 ? "+" : ""}€
                            {size.priceAdjustment.toFixed(2)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSizeVariant(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tech Specifications (Conditional) */}
            {isTechCategory() && (
              <div className="border-b pb-6 bg-blue-50 -mx-6 px-6 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Technical Specifications
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Mobile/Computer Category
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add technical specs for mobile devices and computers with
                  optional price adjustments
                </p>

                {/* Storage Options */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-600" />
                    Storage Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Size
                      </label>
                      <input
                        type="text"
                        value={storageInput.value}
                        onChange={(e) =>
                          setStorageInput((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        placeholder="e.g., 128GB, 256GB, 512GB"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isLoading}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addStorageOption())
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Adjustment{" "}
                        <span className="text-gray-400">(€)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">
                          €
                        </span>
                        <input
                          type="number"
                          value={storageInput.priceAdjustment}
                          onChange={(e) =>
                            setStorageInput((prev) => ({
                              ...prev,
                              priceAdjustment: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          disabled={isLoading}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addStorageOption())
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addStorageOption}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                    disabled={isLoading}
                  >
                    <Plus size={16} />
                    Add Storage
                  </button>
                  {storageOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {storageOptions.map((storage, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                        >
                          <HardDrive className="w-4 h-4" />
                          <span className="font-medium">{storage.value}</span>
                          {storage.priceAdjustment !== 0 && (
                            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              {storage.priceAdjustment > 0 ? "+" : ""}€
                              {storage.priceAdjustment.toFixed(2)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeStorageOption(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Memory/RAM Options */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-600" />
                    Memory (RAM) Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Memory Size
                      </label>
                      <input
                        type="text"
                        value={memoryInput.value}
                        onChange={(e) =>
                          setMemoryInput((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        placeholder="e.g., 4GB RAM, 8GB RAM, 16GB RAM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isLoading}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addMemoryOption())
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Adjustment{" "}
                        <span className="text-gray-400">(€)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">
                          €
                        </span>
                        <input
                          type="number"
                          value={memoryInput.priceAdjustment}
                          onChange={(e) =>
                            setMemoryInput((prev) => ({
                              ...prev,
                              priceAdjustment: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          disabled={isLoading}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addMemoryOption())
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addMemoryOption}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                    disabled={isLoading}
                  >
                    <Plus size={16} />
                    Add Memory
                  </button>
                  {memoryOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {memoryOptions.map((memory, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                        >
                          <Cpu className="w-4 h-4" />
                          <span className="font-medium">{memory.value}</span>
                          {memory.priceAdjustment !== 0 && (
                            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              {memory.priceAdjustment > 0 ? "+" : ""}€
                              {memory.priceAdjustment.toFixed(2)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMemoryOption(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SIM Type Options */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Antenna className="w-4 h-4 text-gray-600" />
                    SIM Type Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SIM Type
                      </label>
                      <input
                        type="text"
                        value={simInput.value}
                        onChange={(e) =>
                          setSimInput((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        placeholder="e.g., Single SIM, Dual SIM, eSIM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isLoading}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addSimType())
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Adjustment{" "}
                        <span className="text-gray-400">(€)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">
                          €
                        </span>
                        <input
                          type="number"
                          value={simInput.priceAdjustment}
                          onChange={(e) =>
                            setSimInput((prev) => ({
                              ...prev,
                              priceAdjustment: e.target.value,
                            }))
                          }
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          disabled={isLoading}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addSimType())
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addSimType}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                    disabled={isLoading}
                  >
                    <Plus size={16} />
                    Add SIM Type
                  </button>
                  {simTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {simTypes.map((sim, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                        >
                          <Sim className="w-4 h-4" />
                          <span className="font-medium">{sim.value}</span>
                          {sim.priceAdjustment !== 0 && (
                            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              {sim.priceAdjustment > 0 ? "+" : ""}€
                              {sim.priceAdjustment.toFixed(2)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeSimType(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Settings */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
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
