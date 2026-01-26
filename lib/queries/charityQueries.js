import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useEffect } from "react";
import { toast } from "react-hot-toast"; // Optional: for better notifications

// Query keys
export const charityKeys = {
  all: ["charity-products"],
  lists: () => [...charityKeys.all, "list"],
  list: (filters) => [...charityKeys.lists(), filters],
  details: () => [...charityKeys.all, "detail"],
  detail: (id) => [...charityKeys.details(), id],
};

// Fetch all charity products with randomization
export function useCharityProducts(
  filters = {},
  admin = false,
  vendorId = null,
) {
  return useQuery({
    queryKey: ["charity-products", filters, admin, vendorId],
    // Convert to boolean explicitly to avoid undefined/null issues
    enabled: Boolean(admin || vendorId),
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name
          ),
          profiles (
            id,
            username
          )
        `,
        )
        .eq("product_type", "charity")
        .eq("is_active", true);

      // ONLY restrict non-admins
      if (!admin && vendorId) {
        query = query.eq("supplier_id", vendorId);
      }

      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters.condition) {
        query = query.eq("condition", filters.condition);
      }

      if (filters.searchTerm) {
        query = query.or(
          `name.ilike.%${filters.searchTerm}%,brand.ilike.%${filters.searchTerm}%,sku.ilike.%${filters.searchTerm}%`,
        );
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((product) => ({
        ...product,
        category_name: product.categories?.name || "Uncategorized",
        vendor_username: product.profiles?.username || "Unknown",
      }));
    },
  });
}

// Fetch single charity product
export function useCharityProduct(id) {
  return useQuery({
    queryKey: charityKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name
          ),
          profiles (
            id,
            username,
            email
          )
        `,
        )
        .eq("id", id)
        .eq("product_type", "charity")
        .single();

      if (error) throw error;

      return {
        ...data,
        category_name: data.categories?.name || "Uncategorized",
      };
    },
    enabled: !!id,
  });
}

// Delete charity product mutation with comprehensive error handling
export function useDeleteCharityProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      try {
        // Step 1: Fetch the product to get images and verify ownership
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("images, supplier_id, name")
          .eq("id", productId)
          .single();

        if (fetchError) {
          console.error("Error fetching product:", fetchError);
          throw new Error("Failed to fetch product details");
        }

        if (!product) {
          throw new Error("Product not found");
        }

        // Step 2: Verify ownership
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Auth error:", authError);
          throw new Error("Authentication failed");
        }

        if (!user) {
          throw new Error("You must be logged in to delete products");
        }

        if (product.supplier_id !== user.id) {
          throw new Error("You are not authorized to delete this product");
        }

        // Step 3: Delete images from storage if they exist
        if (
          product.images &&
          Array.isArray(product.images) &&
          product.images.length > 0
        ) {
          try {
            // Extract file paths from URLs
            const paths = product.images
              .map((url) => {
                if (typeof url === "string") {
                  // Handle both full URLs and relative paths
                  const parts = url.split("/");
                  return parts[parts.length - 1];
                }
                return null;
              })
              .filter(Boolean);

            if (paths.length > 0) {
              const { error: storageError } = await supabase.storage
                .from("product-images")
                .remove(paths);

              if (storageError) {
                console.warn(
                  "Warning: Some images may not have been deleted:",
                  storageError,
                );
                // Don't throw - continue with product deletion
              }
            }
          } catch (imageError) {
            console.warn("Warning: Error during image deletion:", imageError);
            // Don't throw - continue with product deletion
          }
        }

        // Step 4: Delete the product record
        const { error: deleteError } = await supabase
          .from("products")
          .delete()
          .eq("id", productId)
          .eq("supplier_id", user.id); // Extra safety check

        if (deleteError) {
          console.error("Error deleting product:", deleteError);
          throw new Error(`Failed to delete product: ${deleteError.message}`);
        }

        return {
          id: productId,
          name: product.name,
          success: true,
        };
      } catch (error) {
        console.error("Delete mutation error:", error);
        throw error;
      }
    },
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: charityKeys.all });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(charityKeys.lists());

      // Optimistically remove the product from all list queries
      queryClient.setQueriesData({ queryKey: charityKeys.lists() }, (old) => {
        if (!old) return old;
        return old.filter((product) => product.id !== productId);
      });

      return { previousProducts };
    },
    onError: (error, productId, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(charityKeys.lists(), context.previousProducts);
      }

      console.error("Mutation error:", error);

      // Optional: Show error toast
      // toast.error(error.message || "Failed to delete charity product");
    },
    onSuccess: (data) => {
      // Invalidate and refetch all charity product queries
      queryClient.invalidateQueries({ queryKey: charityKeys.all });

      // Optional: Show success toast
      // toast.success(`${data.name} deleted successfully`);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: charityKeys.all });
    },
  });
}

// Real-time subscription hook
export function useCharityProductsSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel("charity-products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: "product_type=eq.charity",
        },
        (payload) => {
          console.log("Real-time update received:", payload);

          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: charityKeys.all });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to charity products changes");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("Subscription error");
        }
      });

    return () => {
      console.log("Unsubscribing from charity products changes");
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
