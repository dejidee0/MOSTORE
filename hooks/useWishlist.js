import { useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import useWishlistStore from "@/lib/stores/wishList-store";
import { useCurrentUser } from "./use-auth";

export const useWishlist = () => {
  // Get user from React Query hook
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  // Get wishlist store state and actions
  const {
    items,
    loading,
    initialized,
    currentUserId,
    initialize,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    getWishlistItem,
    reset,
  } = useWishlistStore();

  // Memoized userId to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id || null, [user?.id]);

  // Stable authentication check
  const isAuthenticated = useMemo(() => Boolean(user?.id), [user?.id]);

  // ==========================================
  // INITIALIZE WISHLIST
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const initWishlist = async () => {
      if (!mounted) return;

      // Initialize wishlist if authenticated and not yet initialized
      if (isAuthenticated && userId && !initialized) {
        await initialize(userId);
      }
      // Reset wishlist if user logs out
      else if (!isAuthenticated && initialized) {
        reset();
      }
    };

    // Only run if not currently loading user data
    if (!userLoading) {
      initWishlist();
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, userId, initialized, userLoading, initialize, reset]);

  // ==========================================
  // WISHLIST ACTIONS
  // ==========================================

  const addItem = useCallback(
    async (product) => {
      // Check authentication
      if (!isAuthenticated || !userId) {
        toast.error("Please sign in to add items to wishlist", {
          duration: 3000,
          style: {
            background: "#EF4444",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
          },
        });
        return false;
      }

      // Validate product
      if (!product || !product.id) {
        toast.error("Invalid product", {
          duration: 2000,
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
        return false;
      }

      try {
        const result = await addToWishlist(userId, product);
        if (result) {
          toast.success("Added to wishlist", {
            duration: 2000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
          });
        }
        return result;
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        toast.error("Failed to add to wishlist");
        return false;
      }
    },
    [isAuthenticated, userId, addToWishlist],
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!isAuthenticated || !userId) return false;

      if (!productId) {
        toast.error("Invalid product ID");
        return false;
      }

      try {
        const result = await removeFromWishlist(userId, productId);
        if (result) {
          toast.success("Removed from wishlist", {
            duration: 2000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
          });
        }
        return result;
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast.error("Failed to remove from wishlist");
        return false;
      }
    },
    [isAuthenticated, userId, removeFromWishlist],
  );

  const toggleItem = useCallback(
    async (product) => {
      if (!product || !product.id) {
        toast.error("Invalid product");
        return false;
      }

      const inWishlist = isInWishlist(product.id);

      if (inWishlist) {
        return await removeItem(product.id);
      } else {
        return await addItem(product);
      }
    },
    [addItem, removeItem, isInWishlist],
  );

  const clearAll = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      toast.error("Please sign in first");
      return false;
    }

    try {
      const result = await clearWishlist(userId);
      if (result) {
        toast.success("Wishlist cleared", {
          duration: 2000,
          style: {
            background: "#10B981",
            color: "#fff",
          },
        });
      }
      return result;
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
      return false;
    }
  }, [isAuthenticated, userId, clearWishlist]);

  const checkIsInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return isInWishlist(productId);
    },
    [isInWishlist],
  );

  const getItem = useCallback(
    (productId) => {
      if (!productId) return null;
      return getWishlistItem(productId);
    },
    [getWishlistItem],
  );

  // ==========================================
  // MEMOIZED VALUES
  // ==========================================
  const totalItems = useMemo(() => getWishlistCount(), [items]);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  // Safe product access with proper validation
  const safeItems = useMemo(() => {
    return items
      .filter((item) => item?.product && item?.product?.id)
      .map((item) => ({
        ...item,
        product: {
          id: item.product.id,
          name: item.product.name || "Unknown Product",
          slug: item.product.slug || item.product.id,
          price: item.product.price || 0,
          originalprice: item.product.originalprice || null,
          images: Array.isArray(item.product.images) ? item.product.images : [],
          rating: item.product.rating || 0,
          stock_quantity: item.product.stock_quantity || 0,
          discount: item.product.discount || 0,
          brand: item.product.brand || null,
          condition: item.product.condition || "new",
          category_name: item.product.category_name || null,
          is_active: item.product.is_active ?? true,
        },
      }));
  }, [items]);

  // ==========================================
  // RETURN STABLE API
  // ==========================================
  return {
    // Data
    items: safeItems,
    loading: loading || userLoading,
    hasItems,
    totalItems,

    // Auth state
    isAuthenticated,
    userId,

    // Actions
    addItem,
    removeItem,
    toggleItem,
    clearAll,

    // Utilities
    isInWishlist: checkIsInWishlist,
    getItem,
  };
};
