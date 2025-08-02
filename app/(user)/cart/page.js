'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart';
import { 
  Package, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  Truck
} from 'lucide-react'

export default function CartPage() {
  const { cart, isLoading, removeItem, updateQuantity, clearAllItems, total, itemCount } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto text-orange-500 mb-4 animate-pulse" size={64} />
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Package className="text-orange-500" size={32} />
              <h1 className="text-2xl font-bold text-gray-900">Mostore</h1>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-orange-500 transition-colors">
                Home
              </Link>
              <Link 
             href="#"
              // href="/shop" 
              className="text-gray-600 hover:text-orange-500 transition-colors">
                Shop
              </Link>
              <Link href="/cart" className="text-orange-500 font-medium flex items-center gap-2">
                <ShoppingCart size={20} />
                Cart ({itemCount})
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8 w-[200px]">
          <Link href="/shop" className="text-orange-500 hover:text-orange-600 flex items-center gap-2 mb-4">
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {itemCount === 0 ? 'Your cart is empty' : `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto text-gray-400 mb-6" size={80} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet. 
              Start shopping to fill it up!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
            >
              <Package size={20} />
              Start Shopping
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                <button
                  onClick={clearAllItems}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>

              {cart.map((item) => (
                <div key={item.itemId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                          {item.category && (
                            <p className="text-sm text-orange-600 mb-1">{item.category}</p>
                          )}
                          <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
                          
                          {/* Selected Options */}
                          {(item.selectedColor || item.selectedSize) && (
                            <div className="flex gap-4 text-sm text-gray-600 mb-2">
                              {item.selectedColor && (
                                <span>Color: <strong>{item.selectedColor}</strong></span>
                              )}
                              {item.selectedSize && (
                                <span>Size: <strong>{item.selectedSize}</strong></span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(item.price)}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300 min-w-[60px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            disabled={item.quantity >= item.stockQuantity}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.stockQuantity - item.quantity} left in stock
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Summary Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(total * 0.08)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(total * 1.08)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mb-4">
                  <Link
                  href="/checkout"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </Link>
                  
                </button>

                {/* Continue Shopping */}
                <Link
                  href="#"
              // href="/shop"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  Continue Shopping
                </Link>

                {/* Shipping Info */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Truck size={16} />
                    <span className="font-medium">Free Shipping</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Your order qualifies for free shipping!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}