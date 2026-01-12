import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useEffect } from "react";

// Query keys
export const charityKeys = {
  all: ["charity-products"],
  lists: () => [...charityKeys.all, "list"],
  list: (filters) => [...charityKeys.lists(), filters],
  details: () => [...charityKeys.all, "detail"],
  detail: (id) => [...charityKeys.details(), id],
};

// Fetch all charity products with randomization
export function useCharityProducts(filters = {}) {
  return useQuery({
    queryKey: charityKeys.list(filters),
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
        `
        )
        .eq("product_type", "charity")
        .eq("is_active", true);

      // Apply filters
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters.condition) {
        query = query.eq("condition", filters.condition);
      }

      if (filters.searchTerm) {
        query = query.or(
          `name.ilike.%${filters.searchTerm}%,brand.ilike.%${filters.searchTerm}%,sku.ilike.%${filters.searchTerm}%`
        );
      }

      // Fetch data
      const { data, error } = await query;

      if (error) throw error;

      // Randomize the results using Fisher-Yates shuffle
      const shuffled = data ? [...data] : [];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled.map((product) => ({
        ...product,
        category_name: product.categories?.name || "Uncategorized",
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
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
        `
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

// Delete charity product mutation
export function useDeleteCharityProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      // First, fetch the product to get images
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("images, supplier_id")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;

      // Verify ownership (optional - can be done server-side)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (product.supplier_id !== user?.id) {
        throw new Error("Unauthorized to delete this product");
      }

      // Delete images from storage
      if (product.images && product.images.length > 0) {
        const paths = product.images.map((url) => {
          const parts = url.split("/");
          return parts[parts.length - 1];
        });

        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(paths);

        if (storageError) {
          console.error("Error deleting images:", storageError);
          // Continue with deletion even if images fail
        }
      }

      // Delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      return { id: productId };
    },
    onSuccess: () => {
      // Invalidate and refetch
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
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: charityKeys.all });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
