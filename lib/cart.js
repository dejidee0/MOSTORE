// lib/cart.js - Cart Context and Hook
"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";

// Cart Actions
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  LOAD_CART: "LOAD_CART",
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { item, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.selectedColor === item.selectedColor &&
          cartItem.selectedSize === item.selectedSize
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item
        newItems = [...state.items, { ...item, quantity, addedAt: Date.now() }];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { itemId, selectedColor, selectedSize } = action.payload;
      const newItems = state.items.filter(
        (item) =>
          !(
            item.id === itemId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
          )
      );

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
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
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
        ) {
          return { ...item, quantity };
        }
        return item;
      });

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

// Initial cart state
const initialCartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from memory storage on mount
  useEffect(() => {
    const savedCart = getCartFromStorage();
    if (savedCart) {
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: savedCart });
    }
  }, []);

  // Save cart to memory storage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Cart actions
  const addItem = (item, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { item, quantity },
    });
  };

  const removeItem = (itemId, selectedColor = null, selectedSize = null) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { itemId, selectedColor, selectedSize },
    });
  };

  const updateQuantity = (
    itemId,
    quantity,
    selectedColor = null,
    selectedSize = null
  ) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, quantity, selectedColor, selectedSize },
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemCount = (itemId, selectedColor = null, selectedSize = null) => {
    const item = cart.items.find(
      (cartItem) =>
        cartItem.id === itemId &&
        cartItem.selectedColor === selectedColor &&
        cartItem.selectedSize === selectedSize
    );
    return item ? item.quantity : 0;
  };

  const isItemInCart = (itemId, selectedColor = null, selectedSize = null) => {
    return cart.items.some(
      (item) =>
        item.id === itemId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );
  };

  const getCartTotal = () => {
    return cart.totalPrice;
  };

  const getCartItemsCount = () => {
    return cart.totalItems;
  };

  const value = {
    cart: cart.items, // For compatibility with checkout page
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    total: cart.totalPrice, // For compatibility with checkout page
    itemCount: cart.totalItems, // For compatibility with checkout page
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearAllItems: clearCart, // Alias for compatibility with checkout page
    getItemCount,
    isItemInCart,
    getCartTotal,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Memory storage utilities (since localStorage is not available)
let cartStorage = null;

const saveCartToStorage = (cart) => {
  try {
    cartStorage = JSON.stringify(cart);
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

const getCartFromStorage = () => {
  try {
    return cartStorage ? JSON.parse(cartStorage) : null;
  } catch (error) {
    console.error("Failed to load cart:", error);
    return null;
  }
};

// Utility functions for cart calculations
export const calculateCartTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // You can add tax, shipping, discount calculations here
  const tax = subtotal * 0.08; // 8% tax example
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    totalItems,
  };
};

// Cart validation utilities
export const validateCartItem = (item) => {
  const required = ["id", "name", "price", "image"];
  const missing = required.filter((field) => !item[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (typeof item.price !== "number" || item.price < 0) {
    throw new Error("Price must be a positive number");
  }

  return true;
};

// Export cart actions for external use
export { CART_ACTIONS };
