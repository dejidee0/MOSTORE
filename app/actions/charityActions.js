"use server";

import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Create Charity Product
export async function createCharityProduct(formData) {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User on server side not authenticated",
      };
    }

    // Validate required fields
    if (!formData.name || !formData.description || !formData.sku) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Upload images
    const uploadedImageUrls = [];
    if (formData.images && formData.images.length > 0) {
      for (const imageFile of formData.images) {
        const fileName = `${Date.now()}-${crypto.randomUUID()}-${
          imageFile.name
        }`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          uploadedImageUrls.push(publicUrlData.publicUrl);
        }
      }
    }

    // Prepare product data
    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      short_description: formData.short_description || null,

      sku: formData.sku,
      brand: formData.brand || null,
      condition: formData.condition || "new",
      product_type: "charity",
      price: null, // Charity products don't have prices

      stock_quantity: formData.stock_quantity
        ? parseInt(formData.stock_quantity, 10)
        : 1,
      category_id: formData.category_id
        ? parseInt(formData.category_id, 10)
        : null,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
      is_featured: formData.is_featured || false,
      supplier_id: user.id,
      images: uploadedImageUrls,
      colors: formData.colorVariants?.map((c) => c.name) || [],
      sizes: formData.sizeVariants?.map((s) => s.name) || [],
      color_variants: formData.colorVariants || [],
      size_variants: formData.sizeVariants || [],
      storage_options: formData.storageOptions || [],
      memory_options: formData.memoryOptions || [],
      sim_types: formData.simTypes || [],
      location: formData.location || null,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return {
        success: false,
        error: `Failed to create charity product: ${error.message}`,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/charity-products");
    revalidatePath("/charity");

    return {
      success: true,
      data: data[0],
      message: "Charity product created successfully!",
    };
  } catch (err) {
    console.error("Server action error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred",
    };
  }
}

// Update Charity Product
export async function updateCharityProduct(productId, formData) {
  const supabase = createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate product ownership
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("supplier_id, images")
      .eq("id", productId)
      .single();

    if (fetchError || !existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    if (existingProduct.supplier_id !== user.id) {
      return {
        success: false,
        error: "Unauthorized to update this product",
      };
    }

    // Handle new image uploads
    const uploadedImageUrls = [];
    if (formData.newImages && formData.newImages.length > 0) {
      for (const imageFile of formData.newImages) {
        const fileName = `${Date.now()}-${crypto.randomUUID()}-${
          imageFile.name
        }`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          uploadedImageUrls.push(publicUrlData.publicUrl);
        }
      }
    }

    // Combine existing and new images
    const allImages = [
      ...(formData.existingImages || []),
      ...uploadedImageUrls,
    ];

    // Prepare update data
    const updateData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      short_description: formData.short_description || null,
      charity_description: formData.charity_description || null,
      sku: formData.sku,
      brand: formData.brand || null,
      condition: formData.condition || "new",
      donation_goal: formData.donation_goal
        ? parseFloat(formData.donation_goal)
        : null,
      charity_end_date: formData.charity_end_date || null,
      stock_quantity: formData.stock_quantity
        ? parseInt(formData.stock_quantity, 10)
        : 1,
      category_id: formData.category_id
        ? parseInt(formData.category_id, 10)
        : null,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
      is_featured: formData.is_featured || false,
      images: allImages,
      colors: formData.colorVariants?.map((c) => c.name) || [],
      sizes: formData.sizeVariants?.map((s) => s.name) || [],
      color_variants: formData.colorVariants || [],
      size_variants: formData.sizeVariants || [],
      storage_options: formData.storageOptions || [],
      memory_options: formData.memoryOptions || [],
      sim_types: formData.simTypes || [],
      location: formData.location || null,
    };

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select();

    if (error) {
      console.error("Update error:", error);
      return {
        success: false,
        error: `Failed to update charity product: ${error.message}`,
      };
    }

    // Revalidate relevant paths
    revalidatePath("/admin/charity-products");
    revalidatePath("/charity");

    return {
      success: true,
      data: data[0],
      message: "Charity product updated successfully!",
    };
  } catch (err) {
    console.error("Server action error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred",
    };
  }
}

// Update donation amount
export async function updateDonationAmount(productId, amount) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("increment_donation", {
      product_id: productId,
      amount: amount,
    });

    if (error) throw error;

    revalidatePath("/charity");
    return { success: true, data };
  } catch (err) {
    console.error("Donation update error:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}
