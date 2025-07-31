'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/lib/stores/wishList-store';

export default function WishlistItem({ product }) {
  const { removeFromWishlist } = useWishlistStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; 


  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 relative group"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-gray-800 mb-1 truncate">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm">
              ${product.originalPrice}
            </span>
          )}
          <span className="text-orange-500 font-bold">
            ${product.price}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors duration-200 flex items-center gap-1 whitespace-nowrap"
        >
          <ShoppingCart className="w-3 h-3" />
          Add To Cart
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => removeFromWishlist(product.id)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 self-center"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}