'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';

const AddToCartButton = ({ product, variant = 'primary', size = 'md' }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    const result = addToCart(product);
    
    if (result.success) {
      // Optional: Show success feedback
      setTimeout(() => setIsAdding(false), 1000);
    } else {
      // Handle error
      console.error('Failed to add to cart:', result.errors);
      setIsAdding(false);
    }
  };

  const baseClasses = 'font-medium rounded-md transition-colors duration-200 disabled:opacity-50';
  
  const variantClasses = {
    primary: isAdding 
      ? 'bg-green-500 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={buttonClasses}
      aria-label={`Add ${product.name} to cart`}
    >
      {isAdding ? 'Added!' : 'Add to Cart'}
    </button>
  );
};

export { AddToCartButton };