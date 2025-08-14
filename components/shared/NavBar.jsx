"use client";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  Star,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/cart";

const NavBar = ({ onWishListClick }) => {
  const router = useRouter();

  // User store
  const { user, loading, isAuthenticated, signOut, getUserEmail, initialized } =
    useUserStore();
  // Cart hook - Get real cart data
  const { totalItems: cartItemCount } = useCart();

  // State management
  const [isClient, setIsClient] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const role = user?.user_metadata?.role;
  const wishList = []; // Mock data

  // Memoized user info
  const userInfo = useMemo(() => {
    if (!user) return null;
    const email = getUserEmail();
    return {
      email,
      initial: email?.charAt(0).toUpperCase() || "U",
      displayName: email?.split("@")[0] || "User",
    };
  }, [user, getUserEmail]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Memoized category icons
  const getIconForCategory = useCallback((categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("vehicles") && name.includes("mobility"))
      return <Car className="w-4 h-4" />;
    if (name.includes("bike") || name.includes("motorcycle"))
      return <Bike className="w-4 h-4" />;
    if (name.includes("electric") || name.includes("battery"))
      return <Battery className="w-4 h-4" />;
    if (name.includes("electronics")) return <Smartphone className="w-4 h-4" />;
    if (name.includes("home") || name.includes("appliances"))
      return <Monitor className="w-4 h-4" />;
    if (name.includes("parts") || name.includes("accessories"))
      return <Wrench className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  }, []);

  // Memoized category description formatting
  const formatCategoryItems = useCallback((description) => {
    if (!description) return [];
    return description
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 4);
  }, []);

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

  // Optimized event handlers
  const handleProfileClick = useCallback(() => {
    if (!isAuthenticated()) {
      router.push("/sign-in");
    } else {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    }
  }, [isAuthenticated, isProfileDropdownOpen, router]);

  const navigateToDashboard = useCallback(
    (role) => {
      setIsProfileDropdownOpen(false);
      router.push(`/${role}/dashboard`);
    },
    [router]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [signOut, router]);

  const navigateToProfile = useCallback(() => {
    setIsProfileDropdownOpen(false);
    router.push("/my-account");
  }, [router]);

  const navigateToOrders = useCallback(() => {
    setIsProfileDropdownOpen(false);
    router.push("/orders");
  }, [router]);

  const navigateToSettings = useCallback(() => {
    setIsProfileDropdownOpen(false);
    router.push("/settings");
  }, [router]);

  const handleCategoryClick = useCallback(
    (categoryId, categoryName) => {
      router.push(`/products?category=${categoryId}`);
      setIsMobileMenuOpen(false);
      setIsCategoryDropdownOpen(false);
    },
    [router]
  );

  const handleSearch = useCallback(
    (query) => {
      if (query.trim()) {
        router.push(`/products?q=${encodeURIComponent(query.trim())}`);
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    },
    [router]
  );

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch(searchQuery);
      }
      if (e.key === "Escape") {
        setSearchQuery("");
        setSearchFocused(false);
      }
    },
    [handleSearch, searchQuery]
  );

  const closeAllDropdowns = useCallback(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
  }, []);

  // Navigation links
  const navigationLinks = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "About", href: "/about-us" },
      { label: "Products", href: "/products" },
      { label: "Blog", href: "/blog" },
      { label: "Help", href: "/help" },
    ],
    []
  );

  if (!isClient) return null;

  return (
    <>
      {/* Top Info Bar - Enhanced */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs py-2 hidden lg:block shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center gap-2 hover:text-orange-100 transition-colors cursor-pointer group">
                <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">+234 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2 hover:text-orange-100 transition-colors group">
                <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Lagos, Nigeria</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-white font-semibold bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                <Truck className="w-3.5 h-3.5" />
                Free shipping on orders over ₦50,000
              </div>
              {userInfo && (
                <div className="text-orange-100 text-xs bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                  <Star className="w-3 h-3 fill-current" />
                  Welcome back,{" "}
                  <span className="text-white font-medium">
                    {userInfo.displayName}
                  </span>
                  !
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Enhanced */}
      <nav className="sticky top-0 z-50 bg-gray-900 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo - Enhanced */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group"
              onClick={() => router.push("/")}
            >
              <div className="transform group-hover:scale-105 transition-transform duration-200">
                <img
                  src="/logo.png"
                  alt="MOSTORE"
                  className="h-10 lg:h-12 w-auto object-contain"
                />
              </div>
            </div>

            {/* Enhanced Desktop Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-2xl ml-8">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search
                    className={`h-5 w-5 transition-colors ${
                      searchFocused ? "text-orange-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl text-sm placeholder-gray-500 focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md hover:bg-white"
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

            {/* Enhanced Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-1 ml-6">
              {/* Wishlist */}
              <button
                onClick={onWishListClick}
                className="relative p-3 text-white hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {wishList.length}
                  </span>
                )}
                <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                  Wishlist
                </span>
              </button>

              {/* Account */}
              <div className="relative profile-dropdown">
                <button
                  onClick={handleProfileClick}
                  disabled={loading && !initialized}
                  className="relative p-3 text-white hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title={isAuthenticated() ? "Account Menu" : "Sign In"}
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {isAuthenticated() && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  )}
                  {loading && !initialized && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                  )}
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    {isAuthenticated() ? "Account" : "Sign In"}
                  </span>
                </button>

                {/* Enhanced Profile Dropdown */}
                {isProfileDropdownOpen && isAuthenticated() && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {userInfo?.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {userInfo?.email}
                          </p>
                          {role !== "customer" && (
                            <p className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full inline-block mt-1">
                              {role} Account
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <MenuButton
                        onClick={navigateToProfile}
                        icon={<User className="w-5 h-5" />}
                        label="My Profile"
                      />
                      <MenuButton
                        onClick={navigateToOrders}
                        icon={<Package className="w-5 h-5" />}
                        label="My Orders"
                      />
                      <MenuButton
                        onClick={navigateToSettings}
                        icon={<Settings className="w-5 h-5" />}
                        label="Settings"
                      />
                      {(role === "supplier" || role === "admin") && (
                        <MenuButton
                          onClick={() => navigateToDashboard(role)}
                          icon={<Home className="w-5 h-5" />}
                          label="My Dashboard"
                        />
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <MenuButton
                        onClick={handleSignOut}
                        icon={<LogOut className="w-5 h-5" />}
                        label="Sign Out"
                        className="text-red-600 hover:bg-red-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => router.push("/cart")}
                className="relative p-3 text-white hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {cartItemCount}
                  </span>
                )}
                <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                  Cart
                </span>
              </button>
            </div>

            {/* Enhanced Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-1">
              {/* Mobile Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Wishlist */}
              <button
                onClick={onWishListClick}
                className="relative p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
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
                className="relative p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
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
                className="p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
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

        {/* Enhanced Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200 shadow-lg">
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-sm placeholder-gray-500 focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all duration-200"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <MobileMenu
            categories={categories}
            categoriesLoading={categoriesLoading}
            navigationLinks={navigationLinks}
            userInfo={userInfo}
            isAuthenticated={isAuthenticated}
            role={role}
            router={router}
            handleCategoryClick={handleCategoryClick}
            navigateToProfile={navigateToProfile}
            navigateToOrders={navigateToOrders}
            navigateToDashboard={navigateToDashboard}
            handleSignOut={handleSignOut}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            getIconForCategory={getIconForCategory}
            formatCategoryItems={formatCategoryItems}
            loading={loading}
            initialized={initialized}
            showAllCategories={showAllCategories}
            setShowAllCategories={setShowAllCategories}
          />
        )}
      </nav>

      {/* Enhanced Secondary Navigation */}
      <div className="bg-white border-b border-gray-200 text-gray-900 text-sm hidden lg:flex items-center justify-between shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between py-3">
            {/* Enhanced Category Dropdown */}
            <div className="relative category-dropdown">
              <button
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Package className="w-5 h-5" />
                <span>All Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isCategoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Enhanced Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-6 py-3 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-500" />
                      Shop by Category
                    </h3>
                  </div>

                  {categoriesLoading ? (
                    <CategorySkeleton />
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {categories.map((category) => (
                        <CategoryItem
                          key={category.id}
                          category={category}
                          onClick={() =>
                            handleCategoryClick(category.id, category.name)
                          }
                          getIcon={getIconForCategory}
                          formatItems={formatCategoryItems}
                        />
                      ))}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            router.push("/products");
                            setIsCategoryDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200 text-orange-600 font-semibold rounded-xl mx-2"
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

            {/* Enhanced Navigation Links */}
            <nav className="flex items-center gap-8 ml-8">
              {navigationLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-700 font-semibold text-base hover:text-orange-600 transition-all duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full"></span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

// Memoized Components for Performance
const MenuButton = memo(({ onClick, icon, label, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-6 py-3 text-sm font-medium hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 rounded-lg mx-2 ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
));

const CategoryItem = memo(({ category, onClick, getIcon, formatItems }) => (
  <button
    onClick={onClick}
    className="w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200 group rounded-xl mx-2"
  >
    <div className="mt-1 text-gray-500 group-hover:text-orange-600 transition-colors">
      {getIcon(category.name)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 mb-1 transition-colors">
        {category.name}
      </div>
      <div className="text-xs text-gray-500 leading-relaxed">
        {formatItems(category.description).slice(0, 2).join(", ")}
        {formatItems(category.description).length > 2 && "..."}
      </div>
    </div>
  </button>
));

const CategorySkeleton = memo(() => (
  <div className="px-6 py-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-3">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
));

const MobileMenu = memo(
  ({
    categories,
    categoriesLoading,
    navigationLinks,
    userInfo,
    isAuthenticated,
    role,
    router,
    handleCategoryClick,
    navigateToProfile,
    navigateToOrders,
    navigateToDashboard,
    handleSignOut,
    setIsMobileMenuOpen,
    getIconForCategory,
    formatCategoryItems,
    loading,
    initialized,
    showAllCategories,
    setShowAllCategories,
  }) => {
    // Show only first 4 categories initially
    const displayedCategories = showAllCategories
      ? categories
      : categories.slice(0, 4);
    const hasMoreCategories = categories.length > 4;

    return (
      <div className="lg:hidden fixed inset-0 z-50 bg-white animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-6 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto bg-white">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <nav className="space-y-2">
              {navigationLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    router.push(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                >
                  {link.label === "Home" && (
                    <Home className="w-5 h-5 text-gray-500" />
                  )}
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {categoriesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))
                : categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        handleCategoryClick(category.id, category.name)
                      }
                      className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 group"
                    >
                      <span className="text-gray-500 group-hover:text-orange-600 transition-colors">
                        {getIconForCategory(category.name)}
                      </span>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{category.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {formatCategoryItems(category.description)
                            .slice(0, 2)
                            .join(", ")}
                        </p>
                      </div>
                    </button>
                  ))}
              <button
                onClick={() => {
                  router.push("/products");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-orange-600 font-semibold hover:bg-orange-50 transition-all duration-200"
              >
                <Package className="w-5 h-5" />
                <span>All Products</span>
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Account
            </h3>
            <div className="space-y-2">
              {isAuthenticated() ? (
                <>
                  <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {userInfo?.initial}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {userInfo?.email}
                        </p>
                        {role !== "customer" && (
                          <p className="text-xs text-orange-600 font-medium">
                            {role} Account
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigateToProfile();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateToOrders();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                  >
                    <Package className="w-5 h-5" />
                    <span>My Orders</span>
                  </button>

                  {(role === "supplier" || role === "admin") && (
                    <button
                      onClick={() => {
                        navigateToDashboard(role);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                    >
                      <Home className="w-5 h-5" />
                      <span>My Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-all duration-200"
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
                  className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                  {loading && !initialized && (
                    <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin ml-auto"></div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Add display names for better debugging
MenuButton.displayName = "MenuButton";
CategoryItem.displayName = "CategoryItem";
CategorySkeleton.displayName = "CategorySkeleton";
MobileMenu.displayName = "MobileMenu";

export default NavBar;
