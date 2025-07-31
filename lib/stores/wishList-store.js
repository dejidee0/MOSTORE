// 'use client';

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useWishlistStore = create(
//   persist(
//     (set, get) => ({
//       wishlist: [],
//       showAlert: false,
      
//       addToWishlist: (product) => {
//         const { wishlist } = get();
//         const exists = wishlist.find(item => item.id === product.id);
        
//         if (!exists) {
//           set({ 
//             wishlist: [...wishlist, product],
//             showAlert: true 
//           });
          
//           setTimeout(() => {
//             set({ showAlert: false });
//           }, 3000);
//         }
//       },
      
//       removeFromWishlist: (productId) => {
//         const { wishlist } = get();
//         set({ 
//           wishlist: wishlist.filter(item => item.id !== productId) 
//         });
//       },
      
//       isInWishlist: (productId) => {
//         const { wishlist } = get();
//         return wishlist.some(item => item.id === productId);
//       }
//     }),
//     {
//       name: 'wishlist-storage',
//     }
//   )
// );


// app/lib/wishlist-store.js
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useWishlistStore = create(
//   persist(
//     (set, get) => ({
//       wishlist: [],
//       showAlert: false,

//       addToWishlist: (product) => {
//         const { wishlist } = get();
//         const exists = wishlist.find(item => item.id === product.id);

//         if (!exists) {
//           set({ 
//             wishlist: [...wishlist, product],
//             showAlert: true 
//           });
//         }
//       },

//       removeFromWishlist: (productId) => {
//         const { wishlist } = get();
//         set({ 
//           wishlist: wishlist.filter(item => item.id !== productId) 
//         });
//       },

//       isInWishlist: (productId) => {
//         const { wishlist } = get();
//         return wishlist.some(item => item.id === productId);
//       },

//       clearWishlist: () => {
//         set({ wishlist: [] });
//       },

//       setShowAlert: (value) => {
//         set({ showAlert: value });
//       },
//     }),
//     {
//       name: 'wishlist-storage',
//     }
//   )
// );



// app/lib/wishlist-store.js
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useWishlistStore = create(
//   persist(
//     (set, get) => ({
//       wishlist: [],
//       showAlert: false,

//       addToWishlist: (product) => {
//         const { wishlist } = get();
//         const exists = wishlist.find(item => item.id === product.id);

//         if (!exists) {
//           set({ 
//             wishlist: [...wishlist, product],
//             showAlert: true 
//           });
//         }
//       },

//       removeFromWishlist: (productId) => {
//         const { wishlist } = get();
//         set({ 
//           wishlist: wishlist.filter(item => item.id !== productId) 
//         });
//       },

//       isInWishlist: (productId) => {
//         const { wishlist } = get();
//         return wishlist.some(item => item.id === productId);
//       },

//       clearWishlist: () => {
//         set({ wishlist: [] });
//       },

//       setShowAlert: (value) => {
//         set({ showAlert: value });
//       },
//     }),
//     {
//       name: 'wishlist-storage',
//       partialize: (state) => ({ wishlist: state.wishlist }), // Persist only wishlist
//     }
//   )
// );


// app/lib/wishlist-store.js
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useWishlistStore = create(
//   persist(
//     (set, get) => ({
//       wishlist: [],
//       showAlert: false,

//       addToWishlist: (product) => {
//         console.log('addToWishlist called:', product.id); // Debug
//         const { wishlist } = get();
//         const exists = wishlist.find(item => item.id === product.id);

//         if (!exists) {
//           set({ 
//             wishlist: [...wishlist, product],
//             showAlert: true 
//           });
//         }
//       },

//       removeFromWishlist: (productId) => {
//         const { wishlist } = get();
//         set({ 
//           wishlist: wishlist.filter(item => item.id !== productId) 
//         });
//       },

//       isInWishlist: (productId) => {
//         const { wishlist } = get();
//         return wishlist.some(item => item.id === productId);
//       },

//       clearWishlist: () => {
//         set({ wishlist: [] });
//       },

//       setShowAlert: (value) => {
//         set({ showAlert: value });
//       },
//     }),
//     {
//       name: 'wishlist-storage',
//       partialize: (state) => ({ wishlist: state.wishlist }), // Persist only wishlist
//     }
//   )
// );


// lib/stores/wishList-store.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      showAlert: false,

      addToWishlist: (product) => {
        const { wishlist } = get();
        const exists = wishlist.find((item) => item.id === product.id);

        if (!exists) {
          set({
            wishlist: [...wishlist, product],
            showAlert: true,
          });
        }
      },

      removeFromWishlist: (productId) => {
        const { wishlist } = get();
        set({
          wishlist: wishlist.filter((item) => item.id !== productId),
        });
      },

      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.some((item) => item.id === productId);
      },

      clearWishlist: () => {
        set({ wishlist: [] });
      },

      setShowAlert: (value) => {
        set({ showAlert: value });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        wishlist: state.wishlist, // only persist wishlist
      }),
    }
  )
);
