


'use client';

import React, { useEffect, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '@/lib/stores/wishList-store'; 
// import WishlistItem from './WishlistItem';

export default function WishlistPage({ isOpen, onClose }) {
  const { wishlist } = useWishlistStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Wishlist Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-50 z-50 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-white shadow-sm p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange-500 fill-current" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Wishlist ({wishlist.length})
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {wishlist.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center px-6"
                >
                  <Heart className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Start adding products you love to see them here
                  </p>
                </motion.div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {wishlist.map((product) => (
                      <WishlistItem key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="bg-white border-t p-4 flex-shrink-0"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
                >
                  Move all to bag
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
