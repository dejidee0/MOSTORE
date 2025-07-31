
'use client';

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/lib/stores/wishList-store';

export default function WishlistButton({ product, className = "" }) {
  const [isClient, setIsClient] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const inWishlist = isInWishlist(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`w-8 h-8 p-1 border-2 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
        inWishlist 
          ? 'bg-orange-500 border-orange-500' 
          : 'bg-transparent border-orange-500'
      } ${className}`}
    >
      <Heart 
        className={`w-4 h-4 transition-all duration-200 ${
          inWishlist 
            ? 'text-white fill-current' 
            : 'text-orange-500'
        }`} 
      />
    </motion.button>
  );
}

