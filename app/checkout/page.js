'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useToast } from '@/lib/toast'
import { 
  Package, 
  ArrowLeft, 
  CreditCard,
  Truck,
  Shield,
  Check
} from 'lucide-react'

export default function CheckoutPage() {
  const { cart, total, itemCount, clearAllItems } = useCart()
  const { addToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    saveInfo: false
  })

  const [deliveryMethod, setDeliveryMethod] = useState('cash')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Formats price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Calculates totals
  const subtotal = total
  const shippingFee = 0 
  const discountAmount = subtotal * (discount / 100)
  const finalTotal = subtotal - discountAmount + shippingFee

  // Handles coupon application
  const applyCoupon = () => {
    const validCoupons = {
      'SAVE10': 10,
      'WELCOME20': 20,
      'FIRST15': 15
    }

    if (validCoupons[couponCode.toUpperCase()]) {
      setDiscount(validCoupons[couponCode.toUpperCase()])
      addToast(`Coupon applied! ${validCoupons[couponCode.toUpperCase()]}% discount`, 'success')
    } else {
      addToast('Invalid coupon code', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const requiredFields = ['name', 'address', 'city', 'phone', 'email']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    if (cart.length === 0) {
      addToast('Your cart is empty', 'error')
      return
    }

    setIsProcessing(true)

    try {
      // Simulates order processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear cart and show success
      clearAllItems()
      addToast('Order placed successfully! Thank you for your purchase.', 'success', 5000)
      
      setFormData({
        name: '',
        company: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        saveInfo: false
      })
      setCouponCode('')
      setDiscount(0)
      
    } catch (error) {
      addToast('Failed to process order. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto text-orange-500 mb-4 animate-pulse" size={64} />
          <p className="text-gray-600">Loading checkout...</p>
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
              <Link href="/cart" className="text-orange-500 hover:text-orange-600 flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Cart
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order below</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto text-gray-400 mb-6" size={80} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
            <Link
            href="#"
              // href="/shop"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
            >
              <Package size={20} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column - Billing Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Billing Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Name *"
                        className="w-full h-12 px-4 bg-gray-50 rounded border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Company Name (optional)"
                        className="w-full h-12 px-4 bg-gray-50 rounded border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street Address *"
                        className="w-full h-12 px-4 bg-gray-50 rounded border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Town / City *"
                        className="w-full h-12 px-4 bg-gray-50 rounded border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number *"
                        className="w-full h-12 px-4 bg-gray-50 rounded border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address *"
                        className="w-full h-12 px-4 bg-gray-50 rounded border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        name="saveInfo"
                        checked={formData.saveInfo}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <label className="text-sm text-gray-700">
                        Save this information for faster check-out next time
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary  */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
                  
                  {/* Product Items */}
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.itemId} className="flex items-center gap-4">
                        <div className="w-15 h-15 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-xs text-gray-500">
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ' • '}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount ({discount}%):</span>
                        <span className="text-green-600">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Options</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        value="bank"
                        checked={deliveryMethod === 'bank'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                      />
                      <label className="text-sm text-gray-700">Bank Transfer</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        value="cash"
                        checked={deliveryMethod === 'cash'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2"
                      />
                      <label className="text-sm text-gray-700">Cash on Delivery</label>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                  
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {/* Payment Card Icons */}
                    <div className="h-12 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PayPal</span>
                    </div>
                    <div className="h-12 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MC</span>
                    </div>
                    <div className="h-12 bg-blue-700 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div className="h-12 bg-gray-600 rounded flex items-center justify-center">
                      <CreditCard className="text-white" size={20} />
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon Code"
                      className="flex-1 h-12 px-4 bg-gray-50 rounded border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-6 h-12 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors font-medium"
                    >
                      Apply Coupon
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-13 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Place Order
                      </>
                    )}
                  </button>
                </div>

                {/* Security Features */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Truck className="text-orange-500" size={24} />
                    <span className="text-xs text-gray-600">Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="text-orange-500" size={24} />
                    <span className="text-xs text-gray-600">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Package className="text-orange-500" size={24} />
                    <span className="text-xs text-gray-600">Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}