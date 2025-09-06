import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { cn } from "@/lib/utils";

const WishlistButton = ({
  product,
  className = "",
  size = "default",
  variant = "default",
  showText = false,
}) => {
  const { isInWishlist, toggleItem, isAuthenticated } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  const isInList = isInWishlist(product.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }

    setIsLoading(true);
    await toggleItem(product);
    setIsLoading(false);
  };

  const sizeClasses = {
    small: "p-1.5",
    default: "p-2",
    large: "p-3",
  };

  const iconSizes = {
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-6 h-6",
  };

  const variantClasses = {
    default: `
      bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 
      hover:text-red-500 hover:border-red-200 shadow-sm hover:shadow-md
    `,
    minimal: `
      bg-transparent hover:bg-gray-100 text-gray-500 hover:text-red-500
    `,
    filled: `
      ${
        isInList
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
      }
    `,
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "relative rounded-lg transition-all duration-200 group disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title={isInList ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "transition-all duration-200",
          iconSizes[size],
          isInList ? "fill-current" : "group-hover:scale-110",
          isLoading && "animate-pulse"
        )}
      />

      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isInList ? "Saved" : "Save"}
        </span>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
};

export default WishlistButton;
