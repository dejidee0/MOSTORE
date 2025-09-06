import { create } from "zustand";
import { persist } from "zustand/middleware";

import { toast } from "react-hot-toast";
import { supabase } from "../supabase-client";

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      loading: false,
      initialized: false,

      // Actions
      initialize: async (userId) => {
        if (!userId || get().initialized) return;

        set({ loading: true });

        try {
          const { data, error } = await supabase
            .from("wishlists")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          set({
            items: data || [],
            initialized: true,
            loading: false,
          });
        } catch (error) {
          console.error("Error initializing wishlist:", error);
          set({ loading: false });
          toast.error("Failed to load wishlist");
        }
      },

      addToWishlist: async (userId, product) => {
        if (!userId) {
          toast.error("Please sign in to add items to wishlist");
          return false;
        }

        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.product_id === product.id
        );

        if (existingItem) {
          toast.success("Item already in wishlist");
          return true;
        }

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newItem = {
          id: tempId,
          user_id: userId,
          product_id: product.id,
          product: product,
          created_at: new Date().toISOString(),
          isTemp: true,
        };

        set({ items: [newItem, ...currentItems] });

        try {
          const { data, error } = await supabase
            .from("wishlists")
            .insert({
              user_id: userId,
              product_id: product.id,
            })
            .select()
            .single();

          if (error) throw error;

          // Replace temp item with real item
          set({
            items: get().items.map((item) =>
              item.id === tempId ? { ...data, product: product } : item
            ),
          });

          // Success toast with product name
          toast.success(
            <div className="flex items-center gap-2">
              <span>Added &quot;{product.name}&quot; to wishlist</span>
            </div>,
            {
              duration: 3000,
              style: {
                background: "#10B981",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#10B981",
              },
            }
          );

          return true;
        } catch (error) {
          console.error("Error adding to wishlist:", error);

          // Revert optimistic update
          set({
            items: get().items.filter((item) => item.id !== tempId),
          });

          if (error.code === "23505") {
            toast.error("Item already in wishlist");
          } else {
            toast.error("Failed to add to wishlist");
          }
          return false;
        }
      },

      removeFromWishlist: async (userId, productId) => {
        if (!userId) return;

        const currentItems = get().items;
        const itemToRemove = currentItems.find(
          (item) => item.product_id === productId
        );

        if (!itemToRemove) return;

        // Get product name for toast
        const productName = itemToRemove.product?.name || "Item";

        // Optimistic update
        set({
          items: currentItems.filter((item) => item.product_id !== productId),
        });

        try {
          const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);

          if (error) throw error;

          // Success toast for removal
          toast.success(
            <div className="flex items-center gap-2">
              <span>Removed &quot;{productName}&quot; from wishlist</span>
            </div>,
            {
              duration: 2500,
              style: {
                background: "#EF4444",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#EF4444",
              },
            }
          );
        } catch (error) {
          console.error("Error removing from wishlist:", error);

          // Revert optimistic update
          set({ items: currentItems });
          toast.error("Failed to remove from wishlist");
        }
      },

      clearWishlist: async (userId) => {
        if (!userId) return;

        const currentItems = get().items;
        const itemCount = currentItems.length;

        // Optimistic update
        set({ items: [] });

        try {
          const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId);

          if (error) throw error;

          // Success toast for clearing
          toast.success(
            <div className="flex items-center gap-2">
              <span>
                Cleared {itemCount} item{itemCount !== 1 ? "s" : ""} from
                wishlist
              </span>
            </div>,
            {
              duration: 3000,
              style: {
                background: "#F59E0B",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#F59E0B",
              },
            }
          );
        } catch (error) {
          console.error("Error clearing wishlist:", error);

          // Revert optimistic update
          set({ items: currentItems });
          toast.error("Failed to clear wishlist");
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.product_id === productId);
      },

      getWishlistCount: () => {
        return get().items.length;
      },

      // Reset state (for logout)
      reset: () => {
        set({
          items: [],
          loading: false,
          initialized: false,
        });
      },
    }),
    {
      name: "mostore-wishlist",
      partialize: (state) => ({
        items: state.items.filter((item) => !item.isTemp),
      }),
    }
  )
);

export default useWishlistStore;
