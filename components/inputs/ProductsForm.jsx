"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Trash2,
  AlertCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import RichTextEditor from "../rich-text-editor";
import { AnimatePresence, motion } from "framer-motion";

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

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function ProductForm({ isOpen, onClose, productToEdit, user }) {
  const AUTOSAVE_KEY = "product_form_autosave";
  const AUTOSAVE_DEBOUNCE = 2000;

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

  const [colorVariants, setColorVariants] = useState([]);
  const [sizeVariants, setSizeVariants] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [memoryOptions, setMemoryOptions] = useState([]);
  const [simTypes, setSimTypes] = useState([]);

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

  // Image deletion state
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const autosaveTimerRef = useRef(null);
  const isInitialMount = useRef(true);
  const imagePreviewURLs = useRef([]);

  const isTechCategory = useMemo(() => {
    if (!selectedCategory) return false;
    const categoryName = selectedCategory.name?.toLowerCase() || "";
    return (
      categoryName.includes("mobile") ||
      categoryName.includes("phone") ||
      categoryName.includes("computer") ||
      categoryName.includes("laptop") ||
      categoryName.includes("tablet")
    );
  }, [selectedCategory]);

  // ... (keep all existing useEffects and functions until handleImageChange)

  const saveToLocalStorage = useCallback(() => {
    if (!isEditMode && isOpen) {
      try {
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
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
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
  ]);

  const loadFromLocalStorage = useCallback(() => {
    if (productToEdit) return;

    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid saved data");
      }

      const savedTime = new Date(parsed.timestamp);
      if (isNaN(savedTime.getTime())) {
        throw new Error("Invalid timestamp");
      }

      const hoursSinceLastSave = (new Date() - savedTime) / (1000 * 60 * 60);

      if (hoursSinceLastSave < 24) {
        if (parsed.formData && typeof parsed.formData === "object") {
          setFormData(parsed.formData);
        }
        if (Array.isArray(parsed.colorVariants))
          setColorVariants(parsed.colorVariants);
        if (Array.isArray(parsed.sizeVariants))
          setSizeVariants(parsed.sizeVariants);
        if (Array.isArray(parsed.storageOptions))
          setStorageOptions(parsed.storageOptions);
        if (Array.isArray(parsed.memoryOptions))
          setMemoryOptions(parsed.memoryOptions);
        if (Array.isArray(parsed.simTypes)) setSimTypes(parsed.simTypes);

        if (parsed.images && parsed.images.length > 0) {
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
      try {
        localStorage.removeItem(AUTOSAVE_KEY);
      } catch (clearErr) {
        console.error("Failed to clear corrupted autosave:", clearErr);
      }
    }
  }, [productToEdit]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isEditMode && isOpen) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        saveToLocalStorage();
      }, AUTOSAVE_DEBOUNCE);

      return () => {
        if (autosaveTimerRef.current) {
          clearTimeout(autosaveTimerRef.current);
        }
      };
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

  useEffect(() => {
    return () => {
      imagePreviewURLs.current.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      imagePreviewURLs.current = [];
    };
  }, []);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

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

    try {
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
    } catch (err) {
      console.error("SKU generation error:", err);
      return potentialSKU;
    }
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

      setColorVariants(
        Array.isArray(productToEdit.color_variants)
          ? productToEdit.color_variants
          : []
      );
      setSizeVariants(
        Array.isArray(productToEdit.size_variants)
          ? productToEdit.size_variants
          : []
      );
      setStorageOptions(
        Array.isArray(productToEdit.storage_options)
          ? productToEdit.storage_options
          : []
      );
      setMemoryOptions(
        Array.isArray(productToEdit.memory_options)
          ? productToEdit.memory_options
          : []
      );
      setSimTypes(
        Array.isArray(productToEdit.sim_types) ? productToEdit.sim_types : []
      );

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
            if (productToEdit?.category_id) {
              const category = data.find(
                (c) => c.id === productToEdit.category_id
              );
              setSelectedCategory(category);
            }
          }
        } catch (err) {
          console.error("Unexpected error fetching categories:", err);
          setError("Failed to load categories");
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

    const newImages = [];

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
        const previewURL = e.target.result;
        if (previewURL.startsWith("blob:")) {
          imagePreviewURLs.current.push(previewURL);
        }

        const newImage = {
          id: Date.now() + Math.random(),
          file: file, // Store the actual file object
          preview: previewURL,
          name: file.name,
          isNew: true,
        };

        setImages((prev) => [...prev, newImage]);
      };
      reader.onerror = () => {
        setError("Failed to read image file");
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Enhanced remove image function with confirmation
  const initiateImageRemoval = (imageId, imageName, isNew) => {
    setImageToDelete({ id: imageId, name: imageName, isNew });
    setShowDeleteConfirm(true);
  };

  const confirmImageRemoval = async () => {
    if (!imageToDelete) return;

    const { id: imageId, isNew } = imageToDelete;

    if (isNew) {
      // Remove new image (not yet uploaded)
      setImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === imageId);

        if (imageToRemove) {
          // Revoke blob URL to free memory
          if (
            imageToRemove.preview &&
            imageToRemove.preview.startsWith("blob:")
          ) {
            URL.revokeObjectURL(imageToRemove.preview);
            imagePreviewURLs.current = imagePreviewURLs.current.filter(
              (url) => url !== imageToRemove.preview
            );
          }
        }

        return prev.filter((img) => img.id !== imageId);
      });

      setShowDeleteConfirm(false);
      setImageToDelete(null);
      setSuccess("Image removed successfully");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      // Remove existing image from storage
      setIsDeletingImage(true);

      try {
        const imageToRemove = existingImages.find((img) => img.id === imageId);

        if (!imageToRemove) {
          throw new Error("Image not found");
        }

        const path = imageToRemove.url.split("/").pop();
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove([path]);

        if (storageError) {
          console.error("Error deleting image from storage:", storageError);
          throw new Error("Failed to delete image from storage");
        }

        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        setSuccess("Image deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Error removing image:", err);
        setError(err.message || "Failed to remove image");
        setTimeout(() => setError(""), 5000);
      } finally {
        setIsDeletingImage(false);
        setShowDeleteConfirm(false);
        setImageToDelete(null);
      }
    }
  };

  const cancelImageRemoval = () => {
    setShowDeleteConfirm(false);
    setImageToDelete(null);
  };

  const safeParseFloat = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // ... (keep all variant functions - addColorVariant, removeColorVariant, etc.)

  const addColorVariant = () => {
    if (colorInput.name.trim()) {
      const newColor = {
        name: colorInput.name.trim(),
        hex: colorInput.hex,
        priceAdjustment: safeParseFloat(colorInput.priceAdjustment),
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

  const addSizeVariant = () => {
    if (sizeInput.name.trim()) {
      const newSize = {
        name: sizeInput.name.trim(),
        priceAdjustment: safeParseFloat(sizeInput.priceAdjustment),
      };
      setSizeVariants((prev) => [...prev, newSize]);
      setSizeInput({ name: "", priceAdjustment: "" });
    }
  };

  const removeSizeVariant = (index) => {
    setSizeVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addStorageOption = () => {
    if (storageInput.value.trim()) {
      const newStorage = {
        value: storageInput.value.trim(),
        priceAdjustment: safeParseFloat(storageInput.priceAdjustment),
      };
      setStorageOptions((prev) => [...prev, newStorage]);
      setStorageInput({ value: "", priceAdjustment: "" });
    }
  };

  const removeStorageOption = (index) => {
    setStorageOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addMemoryOption = () => {
    if (memoryInput.value.trim()) {
      const newMemory = {
        value: memoryInput.value.trim(),
        priceAdjustment: safeParseFloat(memoryInput.priceAdjustment),
      };
      setMemoryOptions((prev) => [...prev, newMemory]);
      setMemoryInput({ value: "", priceAdjustment: "" });
    }
  };

  const removeMemoryOption = (index) => {
    setMemoryOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addSimType = () => {
    if (simInput.value.trim()) {
      const newSim = {
        value: simInput.value.trim(),
        priceAdjustment: safeParseFloat(simInput.priceAdjustment),
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

      // Extract files from images array (files that haven't been uploaded yet)
      const filesToUpload = images.map((img) => img.file).filter(Boolean);

      const uploadedImageUrls = [];
      for (const file of filesToUpload) {
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

      const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

      const finalColorVariants = safeArray(colorVariants);
      const finalSizeVariants = safeArray(sizeVariants);
      const finalStorageOptions = safeArray(storageOptions);
      const finalMemoryOptions = safeArray(memoryOptions);
      const finalSimTypes = safeArray(simTypes);

      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description || null,
        sku: formData.sku,
        brand: formData.brand || null,
        condition: formData.condition,
        location: location || null,
        supplier_id: authUser.id,
        price: parseFloat(formData.price),
        originalprice: formData.originalprice
          ? parseFloat(formData.originalprice)
          : null,
        discount: formData.discount ? parseInt(formData.discount, 10) : null,
        rating: formData.rating ? parseInt(formData.rating, 10) : null,
        stock_quantity: parseInt(formData.stock_quantity, 10),
        category_id: formData.category_id
          ? parseInt(formData.category_id, 10)
          : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: allImages,
        colors: finalColorVariants.map((c) => c.name),
        sizes: finalSizeVariants.map((s) => s.name),
        color_variants: finalColorVariants,
        size_variants: finalSizeVariants,
        storage_options: finalStorageOptions,
        memory_options: finalMemoryOptions,
        sim_types: finalSimTypes,
      };

      let result;
      if (isEditMode) {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productToEdit.id)
          .select();

        if (error) {
          console.error("❌ Update error:", error);
          throw new Error("Failed to update product: " + error.message);
        }

        result = data;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select();

        if (error) {
          console.error("❌ Insert error:", error);
          throw new Error("Failed to add product: " + error.message);
        }

        result = data;
      }

      try {
        localStorage.removeItem(AUTOSAVE_KEY);
      } catch (err) {
        console.error("Failed to clear autosave:", err);
      }

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
    imagePreviewURLs.current.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    imagePreviewURLs.current = [];

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
      try {
        localStorage.removeItem(AUTOSAVE_KEY);
        resetForm();
        setSuccess("Draft cleared successfully!");
      } catch (err) {
        console.error("Failed to clear autosave:", err);
        setError("Failed to clear draft");
      }
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
          {/* Header - keep same */}
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
            {/* Keep all form sections the same until Product Images */}

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

            {/* ... Keep all other form sections until Product Images ... */}

            {/* Enhanced Product Images Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Images
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images <span className="text-orange-500">*</span>
                <span className="text-gray-400 text-xs ml-2">
                  (Max 4 images, at least 1 required)
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
                  <span className="text-xs text-gray-500 mt-1">
                    {images.length + existingImages.length} / 4 images uploaded
                  </span>
                </label>
              </div>

              {(images.length > 0 || existingImages.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {/* Existing Images */}
                  {existingImages.map((image) => (
                    <motion.div
                      key={`existing-${image.id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group"
                    >
                      <div className="relative">
                        <img
                          src={image.url}
                          alt={image.name || "Product image"}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-orange-300 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all" />

                        {/* Delete Button with Better Visibility */}
                        <button
                          type="button"
                          onClick={() =>
                            initiateImageRemoval(image.id, image.name, false)
                          }
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                          disabled={isLoading}
                          title="Delete image"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* Image Label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white truncate">
                            {image.name || "Existing image"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* New Images (Not Yet Uploaded) */}
                  {images.map((image) => (
                    <motion.div
                      key={`new-${image.id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group"
                    >
                      <div className="relative">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded-lg border-2 border-green-200 group-hover:border-green-400 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all" />

                        {/* New Badge */}
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                          New
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() =>
                            initiateImageRemoval(image.id, image.name, true)
                          }
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                          disabled={isLoading}
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>

                        {/* Image Label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white truncate">
                            {image.name}
                          </p>
                        </div>
                      </div>
                    </motion.div>
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
            {isTechCategory && (
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
                          <Antenna className="w-4 h-4" />
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

            {/* Keep all other form sections (variants, etc.) */}
            {/* ... rest of the form ... */}

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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelImageRemoval}
        onConfirm={confirmImageRemoval}
        isLoading={isDeletingImage}
        title="Delete Image?"
        message={`Are you sure you want to ${
          imageToDelete?.isNew ? "remove" : "permanently delete"
        } "${imageToDelete?.name}"? ${
          !imageToDelete?.isNew ? "This action cannot be undone." : ""
        }`}
      />
    </div>
  );
}
