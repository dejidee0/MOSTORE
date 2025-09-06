import { useEffect } from "react";

import useUserStore from "@/lib/stores/useUserStore";
import { toast } from "react-hot-toast";
import useWishlistStore from "@/lib/stores/wishList-store";

export const useWishlist = () => {
  const { user, isAuthenticated } = useUserStore();
  const {
    items,
    loading,
    initialized,
    initialize,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    reset,
  } = useWishlistStore();

  const userId = user?.id;

  // Initialize wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated() && userId && !initialized) {
      initialize(userId);
    } else if (!isAuthenticated() && initialized) {
      reset();
    }
  }, [isAuthenticated, userId, initialized, initialize, reset]);

  const addItem = async (product) => {
    if (!isAuthenticated()) {
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
    return await addToWishlist(userId, product);
  };

  const removeItem = async (productId) => {
    return await removeFromWishlist(userId, productId);
  };

  const toggleItem = async (product) => {
    if (isInWishlist(product.id)) {
      return await removeItem(product.id);
    } else {
      return await addItem(product);
    }
  };

  const clearAll = async () => {
    return await clearWishlist(userId);
  };

  return {
    items,
    loading,
    isAuthenticated: isAuthenticated(),
    addItem,
    removeItem,
    toggleItem,
    clearAll,
    isInWishlist,
    totalItems: getWishlistCount(),
  };
};
