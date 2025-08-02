import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore"; // Adjust path as needed
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Car,
  Bike,
  Smartphone,
  Wrench,
  Battery,
  Monitor,
  MapPin,
  Phone,
  LogOut,
  Settings,
  Package,
} from "lucide-react";

const NavBar = ({ onWishListClick }) => {
  const router = useRouter();

  // User store
  const { user, loading, isAuthenticated, signOut, getUserEmail, initialized } =
    useUserStore();

  const [isClient, setIsClient] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with your actual stores/cart data
  const wishList = [];
  const itemCount = 3;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation categories
  const categories = [
    {
      name: "Automobiles",
      icon: <Car className="w-4 h-4" />,
      href: "/automobiles",
    },
    {
      name: "Motorcycles & Gear",
      icon: <Bike className="w-4 h-4" />,
      href: "/motorcycles",
    },
    {
      name: "Electric Bikes",
      icon: <Battery className="w-4 h-4" />,
      href: "/electric-bikes",
    },
    {
      name: "Tech & Gadgets",
      icon: <Smartphone className="w-4 h-4" />,
      href: "/tech-gadgets",
    },
    {
      name: "Appliances",
      icon: <Monitor className="w-4 h-4" />,
      href: "/appliances",
    },
    {
      name: "Parts & Tools",
      icon: <Wrench className="w-4 h-4" />,
      href: "/parts-tools",
    },
  ];

  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      router.push("/sign-in");
    } else {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navigateToProfile = () => {
    setIsProfileDropdownOpen(false);
    router.push("/my-account");
  };

  const navigateToOrders = () => {
    setIsProfileDropdownOpen(false);
    router.push("/orders");
  };

  const navigateToSettings = () => {
    setIsProfileDropdownOpen(false);
    router.push("/settings");
  };

  if (!isClient) return null;

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>+234 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-orange-400 font-medium">
                Free shipping on orders over ₦50,000
              </div>
              {user && (
                <div className="text-gray-300 text-xs">
                  Welcome back, {getUserEmail()?.split("@")[0] || "User"}!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => router.push("/")}
            >
              <div className="flex items-center bg-gradient-to-r from-gray-900 to-black px-6 py-3 rounded-lg shadow-lg">
                <img
                  src="/logo.png"
                  alt="MOSTORE"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center ml-8">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => router.push(category.href)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-all duration-200 rounded-lg hover:bg-gray-50 hover:scale-105"
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md ml-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(
                        `/search?q=${encodeURIComponent(searchQuery.trim())}`
                      );
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-full text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 ml-6">
              {/* Wishlist */}
              <button
                onClick={onWishListClick}
                className="relative p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 hover:scale-105"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishList.length}
                  </span>
                )}
              </button>

              {/* Account */}
              <div className="relative profile-dropdown">
                <button
                  onClick={handleProfileClick}
                  disabled={loading && !initialized}
                  className="relative p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAuthenticated() ? "Account Menu" : "Sign In"}
                >
                  <User className="w-5 h-5" />
                  {isAuthenticated() && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  {loading && !initialized && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 border border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && isAuthenticated() && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getUserEmail()}
                      </p>
                      <p className="text-xs text-gray-500">Signed in</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={navigateToProfile}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </button>

                      <button
                        onClick={navigateToOrders}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors"
                      >
                        <Package className="w-4 h-4 mr-3" />
                        My Orders
                      </button>

                      <button
                        onClick={navigateToSettings}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => router.push("/cart")}
                className="relative p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 hover:scale-105"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-1">
              {/* Mobile Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-700 hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Wishlist */}
              <button
                onClick={onWishListClick}
                className="relative p-2 text-gray-700 hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
                {wishList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishList.length}
                  </span>
                )}
              </button>

              {/* Mobile Cart */}
              <button
                onClick={() => router.push("/cart")}
                className="relative p-2 text-gray-700 hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(
                        `/search?q=${encodeURIComponent(searchQuery.trim())}`
                      );
                      setIsSearchOpen(false);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-full text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    router.push(category.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-2 text-gray-700 font-medium hover:text-orange-600 transition-colors w-full text-left"
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}

              {/* Mobile Account Section */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {isAuthenticated() ? (
                  <>
                    <div className="px-2 py-1">
                      <p className="text-xs text-gray-500">Signed in as:</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getUserEmail()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigateToProfile();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 py-2 text-gray-700 font-medium hover:text-orange-600 w-full text-left"
                    >
                      <User className="w-5 h-5" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        navigateToOrders();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 py-2 text-gray-700 font-medium hover:text-orange-600 w-full text-left"
                    >
                      <Package className="w-5 h-5" />
                      <span>My Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 py-2 text-red-600 font-medium hover:text-red-700 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      router.push("/sign-in");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 py-2 text-gray-700 font-medium hover:text-orange-600 w-full text-left"
                  >
                    <User className="w-5 h-5" />
                    <span>Sign In</span>
                    {loading && !initialized && (
                      <div className="w-3 h-3 border border-orange-300 border-t-orange-600 rounded-full animate-spin ml-auto"></div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavBar;
