import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/lib/stores/useUserStore";
import { getAllCategories } from "@/lib/data/products";
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
  Home,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useCart } from "@/lib/cart";

const NavBar = ({ onWishListClick }) => {
  const router = useRouter();

  // User store
  const { user, loading, isAuthenticated, signOut, getUserEmail, initialized } =
    useUserStore();
  // Cart hook - Get real cart data
  const { totalItems: cartItemCount, getCartItemsCount } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const role = user?.user_metadata.role;

  // Mock data - replace with actual data
  const wishList = [];
  console.log(user);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Helper function to get appropriate icon for category
  const getIconForCategory = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("vehicles") && name.includes("mobility"))
      return <Car className="w-5 h-5" />;
    if (name.includes("bike") || name.includes("motorcycle"))
      return <Bike className="w-5 h-5" />;
    if (name.includes("electric") || name.includes("battery"))
      return <Battery className="w-5 h-5" />;
    if (name.includes("electronics")) return <Smartphone className="w-5 h-5" />;
    if (name.includes("home") || name.includes("appliances"))
      return <Monitor className="w-5 h-5" />;
    if (name.includes("parts") || name.includes("accessories"))
      return <Wrench className="w-5 h-5" />;
    return <Package className="w-5 h-5" />; // Default icon
  };

  // Format category description into items
  const formatCategoryItems = (description) => {
    if (!description) return [];
    return description
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 4); // Show max 4 items in dropdown
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
      if (!event.target.closest(".category-dropdown")) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Event handlers
  const handleProfileClick = () => {
    if (!isAuthenticated()) {
      router.push("/sign-in");
    } else {
      console.log("[DEBUG] Logged in user:", user); // ✅ Log user
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    }
  };

  const navigateToDashboard = (role) => {
    setIsProfileDropdownOpen(false);
    router.push(`/${role}/dashboard`);
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

  const handleCategoryClick = (categoryId, categoryName) => {
    router.push(`/products?category=${categoryId}`);
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  const closeAllDropdowns = () => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  if (!isClient) return null;

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-orange-500  text-white text-xs py-2.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center gap-2 hover:text-orange-300 transition-colors cursor-pointer">
                <Phone className="w-3.5 h-3.5" />
                <span className="font-medium">+234 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2 hover:text-orange-300 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-medium">Lagos, Nigeria</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-white font-semibold bg-gray-400/10 px-3 py-1 rounded-full">
                🚚 Free shipping on orders over ₦50,000
              </div>
              {user && (
                <div className="text-gray-300 text-xs bg-gray-700/50 px-3 py-1 rounded-full">
                  Welcome back,{" "}
                  <span className="text-orange-300 font-medium">
                    {getUserEmail()?.split("@")[0] || "User"}
                  </span>
                  !
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white backdrop-blur-md border-b border-gray-200/80 shadow-sm py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group"
              onClick={() => router.push("/")}
            >
              <div className="">
                <img
                  src="/logo.png"
                  alt="MOSTORE"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>

            {/* Desktop Navigation */}

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md ml-8">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border-0 rounded-md text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="absolute inset-y-0 right-4 flex items-center"></div>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-1 ml-6">
              {/* Wishlist */}
              <button
                onClick={onWishListClick}
                className="relative p-3 text-white hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 hover:scale-105 group"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {wishList.length}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Wishlist
                </span>
              </button>

              {/* Account */}
              <div className="relative profile-dropdown">
                <button
                  onClick={handleProfileClick}
                  disabled={loading && !initialized}
                  className="relative p-3 text-white hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title={isAuthenticated() ? "Account Menu" : "Sign In"}
                >
                  <User className="w-5 h-5" />
                  {isAuthenticated() && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                  )}
                  {loading && !initialized && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 border border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                  )}
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {isAuthenticated() ? "Account" : "Sign In"}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && isAuthenticated() && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                          {getUserEmail()?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">
                            {getUserEmail()}
                          </p>

                          {role !== "customer" && (
                            <p className="text-xs text-gray-500">
                              {role} Account
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={navigateToProfile}
                        className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <User className="w-5 h-5 mr-3" />
                        <span className="font-medium">My Profile</span>
                      </button>

                      <button
                        onClick={navigateToOrders}
                        className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Package className="w-5 h-5 mr-3" />
                        <span className="font-medium">My Orders</span>
                      </button>

                      <button
                        onClick={navigateToSettings}
                        className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        <span className="font-medium">Settings</span>
                      </button>

                      {/* ✅ Show dashboard if supplier */}
                      {(role === "supplier" || role === "admin") && (
                        <button
                          onClick={() => navigateToDashboard(role)}
                          className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <Home className="w-5 h-5 mr-3" />
                          <span className="font-medium">My Dashboard</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => router.push("/cart")}
                className="relative p-3 text-white hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 hover:scale-105 group"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Cart
                </span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-1">
              {/* Mobile Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-white hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Wishlist */}
              <button
                onClick={onWishListClick}
                className="relative p-2.5 text-white hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
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
                className="relative p-2.5 text-white hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 text-white hover:text-orange-600 rounded-full hover:scale-105 transition-all duration-200"
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
          <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Navigation Links */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push("/");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 text-gray-700 font-semibold hover:text-orange-600 transition-colors w-full text-left"
                >
                  <Home className="w-5 h-5" />
                  Home
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 mb-3 px-2">
                  Categories
                </h3>
                {categoriesLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-200 rounded-xl animate-pulse"
                      />
                    ))
                  : categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          handleCategoryClick(category.id, category.name)
                        }
                        className="flex items-center gap-4 py-3 px-2 text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all w-full text-left"
                      >
                        <div className="text-gray-500">
                          {getIconForCategory(category.name)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{category.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCategoryItems(category.description)
                              .slice(0, 2)
                              .join(", ")}
                          </div>
                        </div>
                      </button>
                    ))}

                <button
                  onClick={() => {
                    router.push("/products");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 py-3 px-2 text-orange-600 font-semibold hover:bg-orange-50 rounded-xl transition-all w-full text-left"
                >
                  <Package className="w-5 h-5" />
                  <span>All Products</span>
                </button>
              </div>

              {/* Mobile Account Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {isAuthenticated() ? (
                  <>
                    <div className="px-2 py-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">
                        Signed in as:
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getUserEmail()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigateToProfile();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-4 py-3 px-2 text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all w-full text-left"
                    >
                      <User className="w-5 h-5" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        navigateToOrders();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-4 py-3 px-2 text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all w-full text-left"
                    >
                      <Package className="w-5 h-5" />
                      <span>My Orders</span>
                    </button>
                    {(role === "supplier" || role === "admin") && (
                      <button
                        onClick={() => navigateToDashboard(role)}
                        className="flex items-center w-full px-2 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Home className="w-5 h-5 mr-3" />
                        <span className="font-medium">My Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-4 py-3 px-2 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-all w-full text-left"
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
                    className="flex items-center gap-4 py-3 px-2 text-gray-700 font-medium hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all w-full text-left"
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
      <div className="bg-white border-b-2 border-black text-gray-900 text-sm hidden md:flex items-center justify-between shadow-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Left Side - Category Dropdown */}
        <div className="relative category-dropdown">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-700 transition-all duration-200 focus:outline-none "
          >
            <Package className="w-4 h-4" />
            All Categories
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isCategoryDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isCategoryDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-3 z-50 transition-all duration-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  Shop by Category
                </h3>
              </div>

              {categoriesLoading ? (
                <div className="px-4 py-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        handleCategoryClick(category.id, category.name)
                      }
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                    >
                      <div className="mt-0.5 text-gray-500 group-hover:text-orange-600">
                        {getIconForCategory(category.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 mb-1">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                          {formatCategoryItems(category.description)
                            .slice(0, 2)
                            .join(", ")}
                          {formatCategoryItems(category.description).length >
                            2 && "..."}
                        </div>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        router.push("/products");
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-orange-600 font-semibold"
                    >
                      <Package className="w-5 h-5" />
                      <span>View All Products</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Navigation Links */}
        <nav className="flex gap-6 ml-8">
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/about-us" },
            { label: "Products", href: "/products" },
            { label: "Blog", href: "/blog" },
            { label: "Help", href: "/help" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-black font-semibold text-base hover:text-orange-600 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default NavBar;
