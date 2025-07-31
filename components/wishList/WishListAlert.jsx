'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistAlert({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="font-medium">Added to wishlist</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}