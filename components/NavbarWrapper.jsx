// "use client";
// import { useEffect, useMemo, useState } from 'react';
// import NavBar from './NavBar';
// import WishlistPage from './wishList/WishListPage';

// import { useWishlistStore } from '@/lib/stores/wishList-store';
// import WishlistAlert from './wishList/WishListAlert';

// export default function NavbarWrapper() {
//   const [wishList, setWishList] = useState(false);
//   const { showAlert, setShowAlert } = useWishlistStore(
//     useMemo(
//       () => (state) => ({
//         showAlert: state.showAlert,
//         setShowAlert: state.setShowAlert,
//       }),
//       [] // Empty dependency array ensures the selector is created once
//     )
//   );

// useEffect(() => {
//     if (showAlert) {
//       const timer = setTimeout(() => {
//         setShowAlert(false);
//       }, 3000);
//       return () => clearTimeout(timer); // Cleanup on unmount or re-run
//     }
//   }, [showAlert, setShowAlert]);

// return(
// <>

// <NavBar onWishListClick={()=>setWishList(true)}  />;

//    <WishlistPage isOpen={wishList} onClose={setWishList(false)}/>
//   <WishlistAlert show={showAlert}/>
//   {/* <WishlistPage isOpen={wishli} onClose={() => setWishlistOpen(false)} /> */}

// </>
// )

// }

// app/components/NavbarWrapper.jsx
// app/components/NavbarWrapper.jsx
"use client";

import { useState, useEffect } from "react";
import { useStore } from "zustand"; // ✅ import useStore directly
import NavBar from "./shared/NavBar";
import WishlistPage from "./wishList/WishListPage";
import WishlistAlert from "./wishList/WishListAlert";
import { useWishlistStore } from "@/lib/stores/wishList-store";

export default function NavbarWrapper({ showWishlist = true }) {
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ✅ Use useStore instead of selector object to avoid snapshot error
  const showAlert = useStore(useWishlistStore, (state) => state.showAlert);
  const setShowAlert = useStore(
    useWishlistStore,
    (state) => state.setShowAlert
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert, setShowAlert]);

  if (!isClient) {
    return (
      <div className="bg-orange-500 text-white p-4">
        <NavBar onWishlistClick={() => {}} />
      </div>
    );
  }

  return (
    <>
      <NavBar onWishlistClick={() => setWishlistOpen(true)} />
      {showWishlist && (
        <WishlistPage
          isOpen={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
        />
      )}
      <WishlistAlert show={showAlert} />
    </>
  );
}
