// @/lib/services/cart-service.js

/**
 * Cart calculation utilities
 */
export const cartCalculations = {
  /**
   * Calculate total price of all items in cart
   */
  calculateTotal: (items) => {
    return items.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 0;
      return total + itemPrice * itemQuantity;
    }, 0);
  },

  /**
   * Calculate total number of items in cart
   */
  calculateItemCount: (items) => {
    return items.reduce((count, item) => {
      const itemQuantity = parseInt(item.quantity) || 0;
      return count + itemQuantity;
    }, 0);
  },

  /**
   * Get quantity of specific item in cart
   */
  getItemQuantity: (items, productId) => {
    const item = items.find((item) => item.id === productId);
    return item ? parseInt(item.quantity) || 0 : 0;
  },

  /**
   * Check if item exists in cart
   */
  hasItem: (items, productId) => {
    return items.some((item) => item.id === productId);
  },

  /**
   * Format price for display
   */
  formatPrice: (price) => {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    }).format(numPrice);
  },

  /**
   * Calculate subtotal for a specific item
   */
  calculateItemSubtotal: (item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return price * quantity;
  },
};

/**
 * Cart validation utilities
 */
export const cartValidation = {
  /**
   * Validate product before adding to cart
   */
  validateProduct: (product) => {
    const errors = [];

    if (!product) {
      errors.push("Product is required");
      return { isValid: false, errors };
    }

    if (!product.id) {
      errors.push("Product ID is required");
    }

    if (!product.name || typeof product.name !== "string") {
      errors.push("Product name is required and must be a string");
    }

    if (!product.price || isNaN(parseFloat(product.price))) {
      errors.push("Valid product price is required");
    }

    if (product.price && parseFloat(product.price) < 0) {
      errors.push("Product price cannot be negative");
    }

    // Optional validations
    if (product.stock_quantity !== undefined) {
      if (
        isNaN(parseInt(product.stock_quantity)) ||
        parseInt(product.stock_quantity) < 0
      ) {
        errors.push("Stock quantity must be a non-negative number");
      }
    }

    if (product.quantity !== undefined) {
      if (
        isNaN(parseInt(product.quantity)) ||
        parseInt(product.quantity) <= 0
      ) {
        errors.push("Quantity must be a positive number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate quantity value
   */
  validateQuantity: (quantity) => {
    const qty = parseInt(quantity);
    return !isNaN(qty) && qty > 0;
  },

  /**
   * Validate stock availability
   */
  validateStock: (requestedQuantity, availableStock) => {
    const requested = parseInt(requestedQuantity) || 0;
    const available = parseInt(availableStock) || 0;

    return {
      isValid: requested <= available,
      available,
      requested,
      message:
        requested > available
          ? `Only ${available} items available in stock`
          : "Stock is available",
    };
  },

  /**
   * Validate cart item before update
   */
  validateCartItem: (item) => {
    const errors = [];

    if (!item || typeof item !== "object") {
      errors.push("Cart item must be an object");
      return { isValid: false, errors };
    }

    if (!item.id) {
      errors.push("Cart item ID is required");
    }

    if (!item.quantity || !cartValidation.validateQuantity(item.quantity)) {
      errors.push("Valid quantity is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
