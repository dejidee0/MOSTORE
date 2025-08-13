// lib/cart.js - Enhanced Cart Context with Persistent Storage
"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";

// Cart storage key
const CART_STORAGE_KEY = "ecommerce_cart_v1";
const CART_EXPIRY_DAYS = 30; // Cart expires after 30 days

// Cart Actions
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  LOAD_CART: "LOAD_CART",
  SET_LOADING: "SET_LOADING",
};

// Enhanced cart reducer with better state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case CART_ACTIONS.ADD_ITEM: {
      const { item, quantity = 1 } = action.payload;

      // Validate item before adding
      if (!item || !item.id || !item.name || typeof item.price !== "number") {
        console.error("Invalid item data:", item);
        return state;
      }

      const itemKey = `${item.id}-${item.selectedColor || "default"}-${
        item.selectedSize || "default"
      }`;
      const existingItemIndex = state.items.findIndex((cartItem) => {
        const cartItemKey = `${cartItem.id}-${
          cartItem.selectedColor || "default"
        }-${cartItem.selectedSize || "default"}`;
        return cartItemKey === itemKey;
      });

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          lastUpdated: Date.now(),
        };
      } else {
        // Add new item with metadata
        newItems = [
          ...state.items,
          {
            ...item,
            quantity,
            addedAt: Date.now(),
            lastUpdated: Date.now(),
          },
        ];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        lastModified: Date.now(),
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { itemId, selectedColor, selectedSize } = action.payload;
      const newItems = state.items.filter(
        (item) =>
          !(
            item.id === itemId &&
            (item.selectedColor || "default") ===
              (selectedColor || "default") &&
            (item.selectedSize || "default") === (selectedSize || "default")
          )
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        lastModified: Date.now(),
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, selectedColor, selectedSize, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { itemId, selectedColor, selectedSize },
        });
      }

      const newItems = state.items.map((item) => {
        if (
          item.id === itemId &&
          (item.selectedColor || "default") === (selectedColor || "default") &&
          (item.selectedSize || "default") === (selectedSize || "default")
        ) {
          return {
            ...item,
            quantity: parseInt(quantity),
            lastUpdated: Date.now(),
          };
        }
        return item;
      });

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        lastModified: Date.now(),
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastModified: Date.now(),
      };

    case CART_ACTIONS.LOAD_CART: {
      const loadedCart = action.payload;

      // Validate loaded cart data
      if (!loadedCart || !Array.isArray(loadedCart.items)) {
        return state;
      }

      // Recalculate totals to ensure accuracy
      const validItems = loadedCart.items.filter(
        (item) =>
          item &&
          item.id &&
          item.name &&
          typeof item.price === "number" &&
          item.quantity > 0
      );

      const totalItems = validItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = validItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        items: validItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        lastModified: loadedCart.lastModified || Date.now(),
        isLoading: false,
      };
    }

    default:
      return state;
  }
};

// Initial cart state
const initialCartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  lastModified: Date.now(),
  isLoading: true, // Start with loading true until we load from storage
};

// Enhanced Storage Manager Class
class CartStorageManager {
  constructor() {
    this.isClient = typeof window !== "undefined";
    this.storageAvailable = this.isClient && this.checkStorageAvailable();
    this.fallbackStorage = new Map(); // In-memory fallback
  }

  checkStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn("localStorage not available, using memory storage fallback");
      return false;
    }
  }

  saveCart(cartData) {
    try {
      const dataToStore = {
        ...cartData,
        timestamp: Date.now(),
        expiresAt: Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000, // 30 days
        version: "1.0",
      };

      const serializedData = JSON.stringify(dataToStore);

      if (this.storageAvailable) {
        localStorage.setItem(CART_STORAGE_KEY, serializedData);
      } else {
        // Fallback to memory storage
        this.fallbackStorage.set(CART_STORAGE_KEY, dataToStore);
      }

      return true;
    } catch (error) {
      console.error("Failed to save cart:", error);

      // Try fallback storage even if localStorage was available
      try {
        const dataToStore = {
          ...cartData,
          timestamp: Date.now(),
          expiresAt: Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
          version: "1.0",
        };
        this.fallbackStorage.set(CART_STORAGE_KEY, dataToStore);
        return true;
      } catch (fallbackError) {
        console.error(
          "Failed to save cart to fallback storage:",
          fallbackError
        );
        return false;
      }
    }
  }

  loadCart() {
    try {
      let storedData = null;

      if (this.storageAvailable) {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          storedData = JSON.parse(stored);
        }
      }

      // If no data from localStorage, try fallback
      if (!storedData) {
        storedData = this.fallbackStorage.get(CART_STORAGE_KEY);
      }

      if (!storedData) {
        return null;
      }

      // Check if cart has expired
      if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
        console.log("Cart expired, clearing...");
        this.clearCart();
        return null;
      }

      // Return cart data without metadata
      const { timestamp, expiresAt, version, ...cartData } = storedData;
      return cartData;
    } catch (error) {
      console.error("Failed to load cart:", error);
      return null;
    }
  }

  clearCart() {
    try {
      if (this.storageAvailable) {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      this.fallbackStorage.delete(CART_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      return false;
    }
  }

  // Migration utility for future cart structure changes
  migrateCart(cartData) {
    if (!cartData.version || cartData.version === "1.0") {
      return cartData;
    }

    // Handle future migrations here
    return cartData;
  }
}

// Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  const storageManager = useRef(new CartStorageManager()).current;
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Load cart from storage on mount (client-side only)
  useEffect(() => {
    if (!isInitialized.current && storageManager.isClient) {
      const savedCart = storageManager.loadCart();

      if (savedCart) {
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: savedCart });
      } else {
        dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
      }

      isInitialized.current = true;
    }
  }, [storageManager]);

  // Debounced save to storage
  const debouncedSave = React.useCallback(
    (cartData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (isInitialized.current) {
          storageManager.saveCart(cartData);
        }
      }, 300); // 300ms debounce
    },
    [storageManager]
  );

  // Save cart to storage whenever cart changes (after initialization)
  useEffect(() => {
    if (isInitialized.current && !cart.isLoading) {
      debouncedSave(cart);
    }
  }, [cart, debouncedSave]);

  // Handle page visibility change (save immediately when tab becomes hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isInitialized.current) {
        // Clear timeout and save immediately
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        storageManager.saveCart(cart);
      }
    };

    if (storageManager.isClient) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", () =>
        storageManager.saveCart(cart)
      );

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("beforeunload", () =>
          storageManager.saveCart(cart)
        );
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [cart, storageManager]);

  // Cart actions with error handling
  const addItem = React.useCallback((item, quantity = 1) => {
    try {
      if (!item || !item.id) {
        throw new Error("Invalid item: missing ID");
      }

      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: { item, quantity: parseInt(quantity) || 1 },
      });

      return true;
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      return false;
    }
  }, []);

  const removeItem = React.useCallback(
    (itemId, selectedColor = null, selectedSize = null) => {
      try {
        dispatch({
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { itemId, selectedColor, selectedSize },
        });
        return true;
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
        return false;
      }
    },
    []
  );

  const updateQuantity = React.useCallback(
    (itemId, quantity, selectedColor = null, selectedSize = null) => {
      try {
        dispatch({
          type: CART_ACTIONS.UPDATE_QUANTITY,
          payload: {
            itemId,
            quantity: parseInt(quantity) || 0,
            selectedColor,
            selectedSize,
          },
        });
        return true;
      } catch (error) {
        console.error("Failed to update item quantity:", error);
        return false;
      }
    },
    []
  );

  const clearCart = React.useCallback(() => {
    try {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      storageManager.clearCart();
      return true;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      return false;
    }
  }, [storageManager]);

  const getItemCount = React.useCallback(
    (itemId, selectedColor = null, selectedSize = null) => {
      const item = cart.items.find(
        (cartItem) =>
          cartItem.id === itemId &&
          (cartItem.selectedColor || "default") ===
            (selectedColor || "default") &&
          (cartItem.selectedSize || "default") === (selectedSize || "default")
      );
      return item ? item.quantity : 0;
    },
    [cart.items]
  );

  const isItemInCart = React.useCallback(
    (itemId, selectedColor = null, selectedSize = null) => {
      return cart.items.some(
        (item) =>
          item.id === itemId &&
          (item.selectedColor || "default") === (selectedColor || "default") &&
          (item.selectedSize || "default") === (selectedSize || "default")
      );
    },
    [cart.items]
  );

  const value = React.useMemo(
    () => ({
      // Main cart data
      cart: cart.items,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      isLoading: cart.isLoading,
      lastModified: cart.lastModified,

      // Legacy compatibility
      total: cart.totalPrice,
      itemCount: cart.totalItems,

      // Actions
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearAllItems: clearCart, // Alias

      // Utilities
      getItemCount,
      isItemInCart,
      getCartTotal: () => cart.totalPrice,
      getCartItemsCount: () => cart.totalItems,

      // Storage utilities
      refreshCart: () => {
        const savedCart = storageManager.loadCart();
        if (savedCart) {
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: savedCart });
        }
      },
    }),
    [
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      isItemInCart,
      storageManager,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Enhanced useCart hook with error boundary
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Utility functions for cart calculations with proper error handling
export const calculateCartTotals = (items) => {
  try {
    if (!Array.isArray(items)) {
      return { subtotal: 0, tax: 0, shipping: 0, total: 0, totalItems: 0 };
    }

    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    const totalItems = items.reduce(
      (sum, item) => sum + (parseInt(item.quantity) || 0),
      0
    );

    // Business logic for tax and shipping
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50000 ? 0 : 5990; // Free shipping over ₦50,000
    const total = subtotal + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalItems,
    };
  } catch (error) {
    console.error("Error calculating cart totals:", error);
    return { subtotal: 0, tax: 0, shipping: 0, total: 0, totalItems: 0 };
  }
};

// Cart validation utilities
export const validateCartItem = (item) => {
  const required = ["id", "name", "price"];
  const missing = required.filter((field) => !item[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (typeof item.price !== "number" || item.price < 0) {
    throw new Error("Price must be a positive number");
  }

  if (
    item.quantity &&
    (typeof item.quantity !== "number" || item.quantity < 1)
  ) {
    throw new Error("Quantity must be a positive number");
  }

  return true;
};

// Export cart actions for external use
export { CART_ACTIONS };
