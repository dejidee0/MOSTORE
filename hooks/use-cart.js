import { useCartStore } from '@/lib/stores/cart-store';
import { cartCalculations, cartValidation } from '@/lib/services/cart-service';
import { useCallback, useMemo } from 'react';

/**
 * Main cart hook with all cart functionality
 */
export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Memoized calculations to prevent unnecessary recalculations
  const total = useMemo(() => cartCalculations.calculateTotal(items), [items]);
  const itemCount = useMemo(() => cartCalculations.calculateItemCount(items), [items]);
  const isEmpty = useMemo(() => items.length === 0, [items]);

  // Enhanced actions with validation
  const addToCart = useCallback((product) => {
    const validation = cartValidation.validateProduct(product);
    if (!validation.isValid) {
      console.error('Invalid product:', validation.errors);
      return { success: false, errors: validation.errors };
    }
    
    addItem(product);
    return { success: true };
  }, [addItem]);

  const updateItemQuantity = useCallback((productId, quantity) => {
    if (!cartValidation.validateQuantity(quantity)) {
      console.error('Invalid quantity:', quantity);
      return { success: false, error: 'Invalid quantity' };
    }
    
    updateQuantity(productId, quantity);
    return { success: true };
  }, [updateQuantity]);

  const getItemQuantity = useCallback((productId) => {
    return cartCalculations.getItemQuantity(items, productId);
  }, [items]);

  const hasItem = useCallback((productId) => {
    return cartCalculations.hasItem(items, productId);
  }, [items]);

  const formatPrice = useCallback((price) => {
    return cartCalculations.formatPrice(price);
  }, []);

  return {
    // State
    items,
    total,
    itemCount,
    isEmpty,
    
    // Actions
    addToCart,
    removeItem,
    updateItemQuantity,
    clearCart,
    
    // Utilities
    getItemQuantity,
    hasItem,
    formatPrice,
  };
};

/**
 * Hook for cart item operations
 */
export const useCartItem = (productId) => {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const item = useMemo(() => 
    items.find(item => item.id === productId), 
    [items, productId]
  );

  const quantity = item?.quantity || 0;
  const isInCart = quantity > 0;

  const increment = useCallback(() => {
    updateQuantity(productId, quantity + 1);
  }, [productId, quantity, updateQuantity]);

  const decrement = useCallback(() => {
    if (quantity > 1) {
      updateQuantity(productId, quantity - 1);
    } else {
      removeItem(productId);
    }
  }, [productId, quantity, updateQuantity, removeItem]);

  const remove = useCallback(() => {
    removeItem(productId);
  }, [productId, removeItem]);

  return {
    item,
    quantity,
    isInCart,
    increment,
    decrement,
    remove,
  };
};

/**
 * Hook for cart summary data
 */
export const useCartSummary = () => {
  const items = useCartStore((state) => state.items);
  
  return useMemo(() => ({
    total: cartCalculations.calculateTotal(items),
    itemCount: cartCalculations.calculateItemCount(items),
    formattedTotal: cartCalculations.formatPrice(cartCalculations.calculateTotal(items)),
    isEmpty: items.length === 0,
  }), [items]);
};