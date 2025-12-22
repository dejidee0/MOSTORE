import { useEffect, useCallback, useMemo } from "react";
import useUserStore from "@/lib/stores/useUserStore";
import { toast } from "react-hot-toast";
import useWishlistStore from "@/lib/stores/wishList-store";

export const useWishlist = () => {
  const { user, isAuthenticated } = useUserStore();
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

  // FIXED: Memoize userId to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  // FIXED: Stable isAuth value
  const isAuth = useMemo(() => isAuthenticated(), [isAuthenticated]);

  // ==========================================
  // INITIALIZE WISHLIST
  // FIXED: Proper dependency array and prevent infinite loops
  // ==========================================
  useEffect(() => {
    let mounted = true;

    const initWishlist = async () => {
      if (!mounted) return;

      if (isAuth && userId && !initialized) {
        await initialize(userId);
      } else if (!isAuth && initialized) {
        reset();
      }
    };

    initWishlist();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      mounted = false;
    };
  }, [isAuth, userId, initialized, initialize, reset]);

  // ==========================================
  // MEMOIZED ACTIONS
  // FIXED: Stable callback references
  // ==========================================

  const addItem = useCallback(
    async (product) => {
      if (!isAuth) {
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

      if (!product || !product.id) {
        toast.error("Invalid product");
        return false;
      }

      return await addToWishlist(userId, product);
    },
    [isAuth, userId, addToWishlist]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!isAuth || !userId) return false;
      return await removeFromWishlist(userId, productId);
    },
    [isAuth, userId, removeFromWishlist]
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
    [addItem, removeItem, isInWishlist]
  );

  const clearAll = useCallback(async () => {
    if (!isAuth || !userId) return false;
    return await clearWishlist(userId);
  }, [isAuth, userId, clearWishlist]);

  const checkIsInWishlist = useCallback(
    (productId) => {
      return isInWishlist(productId);
    },
    [isInWishlist]
  );

  const getItem = useCallback(
    (productId) => {
      return getWishlistItem(productId);
    },
    [getWishlistItem]
  );

  // ==========================================
  // MEMOIZED VALUES
  // FIXED: Prevent unnecessary re-calculations
  // ==========================================
  const totalItems = useMemo(() => getWishlistCount(), [items]);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  // FIXED: Safe product access
  const safeItems = useMemo(() => {
    return items
      .filter((item) => item.product && item.product.id)
      .map((item) => ({
        ...item,
        product: {
          id: item.product.id,
          name: item.product.name || "Unknown Product",
          slug: item.product.slug || item.product.id,
          price: item.product.price || 0,
          originalprice: item.product.originalprice,
          images: Array.isArray(item.product.images) ? item.product.images : [],
          rating: item.product.rating || 0,
          stock_quantity: item.product.stock_quantity || 0,
          discount: item.product.discount || 0,
          brand: item.product.brand,
          condition: item.product.condition || "new",
        },
      }));
  }, [items]);

  // ==========================================
  // RETURN STABLE API
  // ==========================================
  return {
    // Data
    items: safeItems,
    loading,
    hasItems,
    totalItems,

    // Auth state
    isAuthenticated: isAuth,

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
