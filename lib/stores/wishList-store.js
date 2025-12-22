import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { supabase } from "../supabase-client";

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // STATE
      // ==========================================
      items: [],
      loading: false,
      initialized: false,
      currentUserId: null,

      // ==========================================
      // INITIALIZE WISHLIST
      // ==========================================
      initialize: async (userId) => {
        // Skip if already initialized for this user
        if (!userId || (get().initialized && get().currentUserId === userId)) {
          return;
        }

        set({ loading: true });

        try {
          // FIXED: Single query with proper join to get product data
          const { data, error } = await supabase
            .from("wishlists")
            .select(
              `
    id,
    user_id,
    product_id,
    created_at,
    products!wishlists_product_id_fkey (
      id,
      name,
      slug,
      price,
      originalprice,
      images,
      rating,
      stock_quantity,
      discount,
      brand,
      condition
    )
  `
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          // FIXED: Properly format data with product info
          const formattedItems = (data || []).map((item) => ({
            id: item.id,
            user_id: item.user_id,
            product_id: item.product_id,
            created_at: item.created_at,
            product: item.products, // Products table data
          }));

          set({
            items: formattedItems,
            initialized: true,
            currentUserId: userId,
            loading: false,
          });
        } catch (error) {
          console.error("Error initializing wishlist:", error);
          set({ loading: false });
          toast.error("Failed to load wishlist");
        }
      },

      // ==========================================
      // ADD TO WISHLIST
      // ==========================================
      addToWishlist: async (userId, product) => {
        if (!userId) {
          toast.error("Please sign in to add items to wishlist");
          return false;
        }

        if (!product || !product.id) {
          toast.error("Invalid product");
          return false;
        }

        const currentItems = get().items;

        // Check if already exists
        const existingItem = currentItems.find(
          (item) => item.product_id === product.id
        );

        if (existingItem) {
          toast.success("Already in wishlist", {
            duration: 2000,
            icon: "ℹ️",
          });
          return true;
        }

        // Optimistic update with temp ID
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const optimisticItem = {
          id: tempId,
          user_id: userId,
          product_id: product.id,
          created_at: new Date().toISOString(),
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalprice: product.originalprice,
            images: product.images,
            rating: product.rating,
            stock_quantity: product.stock_quantity,
            discount: product.discount,
            brand: product.brand,
            condition: product.condition,
          },
          isTemp: true,
        };

        set({ items: [optimisticItem, ...currentItems] });

        try {
          // FIXED: Insert only necessary data
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
              item.id === tempId
                ? {
                    ...data,
                    product: optimisticItem.product,
                  }
                : item
            ),
          });

          toast.success(
            <div className="flex items-center gap-2">
              <span>Added to wishlist</span>
            </div>,
            {
              duration: 2000,
              style: {
                background: "#10B981",
                color: "#fff",
                borderRadius: "8px",
              },
            }
          );

          return true;
        } catch (error) {
          console.error("Error adding to wishlist:", error);

          // Revert optimistic update
          set({
            items: currentItems,
          });

          // Handle duplicate error silently
          if (error.code === "23505") {
            toast.success("Already in wishlist", {
              duration: 2000,
              icon: "ℹ️",
            });
            return true;
          } else {
            toast.error("Failed to add to wishlist");
            return false;
          }
        }
      },

      // ==========================================
      // REMOVE FROM WISHLIST
      // ==========================================
      removeFromWishlist: async (userId, productId) => {
        if (!userId) return false;

        const currentItems = get().items;
        const itemToRemove = currentItems.find(
          (item) => item.product_id === productId
        );

        if (!itemToRemove) return false;

        // Optimistic update
        const updatedItems = currentItems.filter(
          (item) => item.product_id !== productId
        );
        set({ items: updatedItems });

        try {
          const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);

          if (error) throw error;

          toast.success("Removed from wishlist", {
            duration: 2000,
            style: {
              background: "#EF4444",
              color: "#fff",
              borderRadius: "8px",
            },
          });

          return true;
        } catch (error) {
          console.error("Error removing from wishlist:", error);

          // Revert optimistic update
          set({ items: currentItems });
          toast.error("Failed to remove from wishlist");
          return false;
        }
      },

      // ==========================================
      // CLEAR WISHLIST
      // ==========================================
      clearWishlist: async (userId) => {
        if (!userId) return false;

        const currentItems = get().items;
        const itemCount = currentItems.length;

        if (itemCount === 0) {
          toast.error("Wishlist is already empty");
          return false;
        }

        // Optimistic update
        set({ items: [] });

        try {
          const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId);

          if (error) throw error;

          toast.success(
            `Cleared ${itemCount} item${itemCount !== 1 ? "s" : ""}`,
            {
              duration: 2000,
              style: {
                background: "#F59E0B",
                color: "#fff",
                borderRadius: "8px",
              },
            }
          );

          return true;
        } catch (error) {
          console.error("Error clearing wishlist:", error);

          // Revert optimistic update
          set({ items: currentItems });
          toast.error("Failed to clear wishlist");
          return false;
        }
      },

      // ==========================================
      // UTILITY FUNCTIONS
      // ==========================================
      isInWishlist: (productId) => {
        return get().items.some((item) => item.product_id === productId);
      },

      getWishlistCount: () => {
        return get().items.length;
      },

      getWishlistItem: (productId) => {
        return get().items.find((item) => item.product_id === productId);
      },

      // ==========================================
      // RESET STATE (for logout)
      // ==========================================
      reset: () => {
        set({
          items: [],
          loading: false,
          initialized: false,
          currentUserId: null,
        });
      },
    }),
    {
      name: "mostore-wishlist",
      // FIXED: Only persist non-temp items and basic state
      partialize: (state) => ({
        items: state.items
          .filter((item) => !item.isTemp)
          .map((item) => ({
            id: item.id,
            user_id: item.user_id,
            product_id: item.product_id,
            created_at: item.created_at,
            product: item.product, // Keep product data for offline access
          })),
        currentUserId: state.currentUserId,
      }),
    }
  )
);

export default useWishlistStore;
