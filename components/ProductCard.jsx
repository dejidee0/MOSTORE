// "use client"

// import { motion } from "framer-motion"
// import Image from "next/image"
// // import { Heart,  Star } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Eye } from "lucide-react"
// import { Share2 } from "lucide-react"
// import { MoveRight } from "lucide-react"
// import { useRouter } from "next/navigation"
// import WishlistButton from "./wishList/WishListButton"
// import { useEffect, useState } from "react"
// import { Star } from "lucide-react"
// export default function ProductCard({ product }) {
//   const router=useRouter();

//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   if (!isClient) return null; // prevent hydration mismatch

//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       transition={{ duration: 0.2 }}
//       className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4 h-full"
//     >
//       <div className="relative bg-white mb-4">
//         <Image
//           src={product.image || "/placeholder.svg"}
//           alt={product.name}
//           width={100}
//           height={100}
//           className=" w-[50%] object-cover mx-auto rounded backdrop-blur-2xl drop-shadow-2xl"
//         />
//         {product.discount && (
//           <div className="absolute top-2 left-2  text-orange-500 px-2 py-1 rounded text-lg font-semibold">
//             -{product.discount}%
//           </div>
//         )}
//         <div className="absolute top-2 right-2 space-y-2 flex flex-row items-center">
//           <Button size="sm" variant="secondary" className="w-8 h-8 p-0 text-orange-500">
//             <Eye className="w-8 h-8" /> 
//           </Button>
//           100k
//         </div>
//       </div>

//       <div className="p-4">
//         <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>

//         <div className="flex items-center mb-2">
//           {[...Array(5)].map((_, i) => (
//             <Star
//               key={i}
//               className={`w-4 h-4 ${i < product.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
//             />
//           ))}
//           <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
//         </div>

//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center space-x-2">
//             {product.originalPrice && (
//               <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
//             )}
//             <span className="text-lg font-bold text-orange-500">${product.price}</span>
//           </div>
//         </div>
// <div className="flex items-center  mt-auto  gap-2">

//         <Button onClick={()=>router.push(`/products/${product.id}`)}  className=" bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-lg  mr-4 pr-4 rounded-lg cursor-pointer">
        
//           SHOP <MoveRight className="font-extrabold"/>
//         </Button>

        

// <div className=" bg-transparent   text-center items-center mr-2">
//             {/* <Heart className="w-4 h-4 text-orange-500" /> */}
//             <WishlistButton product={product}/>
//           </div>
        
//         <Button size="sm" variant="secondary" className="w-8 h-8 p-1 bg-transparent border-2 border-orange-500 rounded-full text-center items-center">
//             <Share2 className="w-4 h-4 text-orange-500" />
//           </Button>
        
// </div>
  
//       </div>
//     </motion.div>
//   )
// }

"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Eye, Share2, MoveRight, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import WishlistButton from "./wishList/WishListButton"
import { useEffect, useState } from "react"

export default function ProductCard({ product }) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4 flex flex-col h-full"
    >
      <div className="relative bg-white mb-4 ">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={100}
          height={100}
          className="w-[50%] h-32 object-contain mx-auto hover:translate hover:transform-3d "
        />
        {product.discount && (
          <div className="absolute top-2 left-2 text-orange-500 px-2 py-1 rounded text-lg font-semibold">
            -{product.discount}%
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Button size="sm" variant="secondary" className="w-8 h-8 p-0 text-orange-500">
            <Eye className="w-5 h-5" />
          </Button>
          <span className="text-xs text-gray-500">100k</span>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 h-[48px]">
          {product.name}
        </h3>

        {/* Ratings */}
        <div className="flex items-center mb-2 h-[24px]">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < product.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
            )}
            <span className="text-lg font-bold text-orange-500">${product.price}</span>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="mt-auto flex items-center gap-2">
          <Button
            onClick={() => router.push(`/products/${product.id}`)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm px-4 py-2 rounded-lg cursor-pointer"
          >
            SHOP <MoveRight className="ml-2 w-4 h-4" />
          </Button>

          <div className="bg-transparent">
            <WishlistButton product={product} />
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="w-8 h-8 p-1 bg-transparent border-2 border-orange-500 rounded-full cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-orange-500" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
