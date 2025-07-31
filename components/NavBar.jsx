"use client"
import { Search, User, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useStore } from 'zustand';
import { motion } from 'framer-motion';
import { useWishlistStore } from "@/lib/stores/wishList-store"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "@/lib/cart"
export default function NavBar({onWishListClick}) {
const wishList = useStore(useWishlistStore, (state) => state.wishlist);
const [isClient, setIsClient] = useState(false);
const {itemCount}=useCart()

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; 


  return (
    <nav className="shadow-sm border-b py-4 px-4 w-full bg-black">
      <div className="container border-none mx-auto flex flex-col md:flex-row items-center justify-between inset-0 bg-gradient-to-br from-black via-gray-900 to-blue-900/20">
        {/* Logo */}
        <div className="flex items-start">
          {/* <h1 className="text-2xl font-bold text-orange-500">MOSTORE</h1> */}
          <Image src="/logo.png"  width={200}  height={200}  alt="logo" className=""/>
        </div>

        {/* Search Bar */}
        <div className="block sm:flex-1 max-w-xl mx-8 ">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-4 pr-12 py-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <Button size="sm" className="absolute right-1 top-1 bg-orange-500 hover:bg-orange-600 text-white px-3">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Account & Cart */}
        <div className="flex items-center space-x-4 pt-2  md:pt-0 lg:pt-0 gap-4">
          <div className="flex items-center space-x-2 cursor-pointer hover:text-orange-500 transition-colors">
            <User className="w-10 h-10 md:w-5 md:h-5 lg:w-5 lg:h-5 text-white" />
            <span className="hidden md:block  text-white">Account</span>
          </div>

          <div className="relative cursor-pointer hover:text-orange-500 transition-colors">
            {/* <Heart className="w-10 h-10 md:w-5 md:h-5 lg:w-5 lg:h-5 text-white" />
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span> */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onWishListClick}
          className="relative p-2"
        >
          <Heart className="w-10 h-10 md:w-5 md:h-5 lg:w-5 lg:h-5 text-white" />
          {wishList.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {wishList.length}
            </motion.span>
          )}
        </motion.button>
          </div>

          <div className="relative cursor-pointer hover:text-orange-500 transition-colors">
            <Link href="/cart">
            
            <ShoppingCart className="w-10 h-10 md:w-5 md:h-5 lg:w-5 lg:h-5  text-white" />
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {(itemCount)}
            </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
