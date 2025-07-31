import { useState, useEffect } from 'react'

const CART_STORAGE_KEY = 'mostore_cart'

// Gets cart from localStorage
export const getCartFromStorage = () => {
  if (typeof window === 'undefined') return []
  
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY)
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error reading cart from storage:', error)
    return []
  }
}

// Saves cart to localStorage
export const saveCartToStorage = (cart) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

// Adds item to cart
export const addToCart = (product, quantity = 1, selectedColor = '', selectedSize = '') => {
  const cart = getCartFromStorage()
  
  // Create unique item ID based on product ID and selected options
  const itemId = `${product.id}-${selectedColor}-${selectedSize}`
  
  // Checks if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.itemId === itemId)
  
  if (existingItemIndex > -1) {
    // Update quantity of existing item
    cart[existingItemIndex].quantity += quantity
    
    // Don't exceed stock quantity
    if (cart[existingItemIndex].quantity > product.stock_quantity) {
      cart[existingItemIndex].quantity = product.stock_quantity
    }
  } else {
    // Add new item to cart
    const cartItem = {
      itemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalprice,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      quantity: Math.min(quantity, product.stock_quantity),
      selectedColor,
      selectedSize,
      stockQuantity: product.stock_quantity,
      category: product.categories?.name || '',
      sku: product.sku
    }
    
    cart.push(cartItem)
  }
  
  saveCartToStorage(cart)
  return cart
}

// Remove item from cart
export const removeFromCart = (itemId) => {
  const cart = getCartFromStorage()
  const updatedCart = cart.filter(item => item.itemId !== itemId)
  saveCartToStorage(updatedCart)
  return updatedCart
}

// Update item quantity in cart
export const updateCartItemQuantity = (itemId, quantity) => {
  const cart = getCartFromStorage()
  const itemIndex = cart.findIndex(item => item.itemId === itemId)
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Removes item if quantity is 0 or less
      cart.splice(itemIndex, 1)
    } else {
      // Updates quantity (don't exceed stock)
      cart[itemIndex].quantity = Math.min(quantity, cart[itemIndex].stockQuantity)
    }
  }
  
  saveCartToStorage(cart)
  return cart
}

// Clears entire cart
export const clearCart = () => {
  saveCartToStorage([])
  return []
}

// Gets cart total
export const getCartTotal = (cart) => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// Gets cart item count
export const getCartItemCount = (cart) => {
  return cart.reduce((count, item) => count + item.quantity, 0)
}

// Custom hook
export const useCart = () => {
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Loads cart from storage on mount
    const savedCart = getCartFromStorage()
    setCart(savedCart)
    setIsLoading(false)
  }, [])

  const addItem = (product, quantity = 1, selectedColor = '', selectedSize = '') => {
    const updatedCart = addToCart(product, quantity, selectedColor, selectedSize)
    setCart(updatedCart)
    return updatedCart
  }

  const removeItem = (itemId) => {
    const updatedCart = removeFromCart(itemId)
    setCart(updatedCart)
    return updatedCart
  }

  const updateQuantity = (itemId, quantity) => {
    const updatedCart = updateCartItemQuantity(itemId, quantity)
    setCart(updatedCart)
    return updatedCart
  }

  const clearAllItems = () => {
    const updatedCart = clearCart()
    setCart(updatedCart)
    return updatedCart
  }

  const total = getCartTotal(cart)
  const itemCount = getCartItemCount(cart)

  return {
    cart,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearAllItems,
    total,
    itemCount
  }
}