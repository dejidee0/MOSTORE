"use client";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerHeader,
} from "@/components/ui/drawer";
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
  HelpCircle,
  Headphones,
  LifeBuoy,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { Gift } from "lucide-react";
import { HeartPulse } from "lucide-react";
import { FaChildDress } from "react-icons/fa6";
import { Laptop } from "lucide-react";
import { BsGear } from "react-icons/bs";
import { FaOilCan } from "react-icons/fa";
import { Ship } from "lucide-react";

const NavBar = ({ onWishListClick }) => {
  const router = useRouter();

  // User store
  const { user, loading, isAuthenticated, signOut, getUserEmail, initialized } =
    useUserStore();
  // Cart hook - Get real cart data
  const { totalItems: cartItemCount } = useCart();

  // State management
  const [isClient, setIsClient] = useState(false);
  const { totalItems: wishlistCount } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Removed sidebarOpen state; Drawer will manage its own open state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false); // New help dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const role = user?.user_metadata?.role;

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
    if (name.includes("automobiles")) return <Car className="w-4 h-4" />;
    if (name.includes("electric") || name.includes("motorcycle"))
      return <Bike className="w-4 h-4" />;
    if (name.includes("fitters")) return <FaOilCan className="w-4 h-4" />;
    if (name.includes("tech")) return <Smartphone className="w-4 h-4" />;
    if (name.includes("used")) return <Monitor className="w-4 h-4" />;
    if (name.includes("autopart") || name.includes("accessories"))
      return <Wrench className="w-4 h-4" />;
    if (name.includes("boating")) return <Ship className="w-4 h-4" />;
    return <BsGear className="w-4 h-4" />;
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
      if (!event.target.closest(".help-dropdown")) {
        setIsHelpDropdownOpen(false);
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
    setIsHelpDropdownOpen(false);
  }, []);

  // Navigation links
  const navigationLinks = useMemo(
    () => [
      !user && { label: "Sign in", href: "/sign-in" },
      !user && { label: "Order", href: "#" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Sell on Mostore", href: "/sign-up" },
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
            {/* Brand Slogan */}
            <div className="flex items-center ml-10">
              <h1 className="font-semibold text-sm text-white tracking-wide">
                <span className="hidden sm:inline">
                  Sell Faster, Buy Smarter
                </span>
                <span className="sm:hidden">Fast & Smart Shopping</span>
              </h1>
            </div>

            {/* Contact & Location */}
            <div className="flex items-end space-x-6 ml-10"></div>

            {/* User Welcome & Settings */}
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center gap-2 hover:text-orange-100 transition-colors cursor-pointer group"
                onClick={() => (window.location.href = "tel:+33753602218")}
              >
                <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="font-medium hidden md:inline">
                  Need help? Call us: (+33753602218)
                </span>
                <span className="font-medium md:hidden">
                  Call: +33753602218
                </span>
              </div>

              {/* Language Selector */}
              <div className="relative group ml-3">
                <button className="flex items-center gap-2 text-xs hover:text-orange-100 transition-colors">
                  <span className="flex items-center justify-center">
                    Language:
                  </span>
                  <span>English</span>
                </button>
              </div>

              {/* Currency Selector */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs hover:text-orange-100 transition-colors">
                  <span>Currency: EUR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Enhanced */}
      <nav className="sticky top-0 z-50 bg-gray-900 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18  px-4 lg:px-6 shadow-lg">
            {/* Logo Section */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group transition-all duration-300"
              onClick={() => router.push("/")}
            >
              <div className="transform group-hover:scale-105 transition-transform duration-200 group-active:scale-95">
                <img
                  src="/logo.png"
                  alt="MOSTORE"
                  className="h-10 lg:h-12 w-auto object-contain drop-shadow-md"
                />
              </div>
            </div>

            {/* Main Navigation Section */}
            <div className="flex-1 flex items-center justify-center lg:justify-between ml-4 lg:ml-8">
              {/* Categories Dropdown */}
              <div className="relative category-dropdown hidden lg:block">
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none shadow-lg hover:shadow-xl active:scale-[0.98]"
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
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
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

              {/* Search Bar - Desktop */}
              <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
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
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-l-xl rounded-r-xl text-sm placeholder-gray-500 focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md hover:bg-white"
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-24 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="absolute right-0 inset-y-0 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-r-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Supplier Button */}
              <Link href="/sign-up">
                <button className="hidden lg:flex items-center text-white font-medium hover:text-orange-300 transition-colors duration-200 ml-2">
                  Sell
                </button>
              </Link>

              {/* Shop Link */}
              <Link href="/products">
                <button className="hidden lg:flex items-center text-white font-medium hover:text-orange-300 transition-colors duration-200 ml-2">
                  Shop
                </button>
              </Link>

              {/* Help Dropdown */}
              <div className="relative help-dropdown hidden lg:block">
                <button
                  onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                  className="flex items-center gap-1 text-white font-medium hover:text-orange-300 transition-colors duration-200 ml-2 py-2 px-3 rounded-lg hover:bg-gray-800"
                >
                  Help
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isHelpDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Help Dropdown Menu */}
                {isHelpDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <LifeBuoy className="w-4 h-4 text-orange-500" />
                        How can we help you?
                      </h3>
                    </div>

                    <div className="py-2">
                      {/* Help Center */}
                      <Link href="/help">
                        <button
                          onClick={() => setIsHelpDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-all duration-200 text-gray-700 hover:text-orange-600 group"
                        >
                          <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors">
                            <HelpCircle className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900 group-hover:text-orange-600">
                              Help Center
                            </p>
                            <p className="text-xs text-gray-500">
                              Browse FAQs and get instant answers
                            </p>
                          </div>
                        </button>
                      </Link>

                      {/* Need to Order */}
                      <div className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 cursor-default">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">
                            Need to Order?
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            Call our sales team for assistance
                          </p>
                          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            <p className="text-blue-700 font-bold text-sm">
                              +33 753 602 218
                            </p>
                            <p className="text-blue-600 text-xs">
                              Mon-Fri: 9AM-6PM CET
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Track Package */}
                      <div
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 cursor-not-allowed relative group"
                        title="Coming Soon"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-400">
                            Track Your Package
                          </p>
                          <p className="text-xs text-gray-400">
                            Real-time order tracking
                          </p>
                          <div className="inline-flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-orange-600 font-medium">
                              Coming Soon
                            </span>
                          </div>
                        </div>

                        {/* Hover tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Coming Soon
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <p className="text-xs text-gray-500 text-center">
                        Need immediate help? Email us at{" "}
                        <a
                          href="mailto:support@mostore.com"
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          support@mostore.com
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Action Icons */}
              <div className="hidden lg:flex items-center space-x-1 ml-4">
                {/* Wishlist */}
                <Link href="/wishlist">
                  <button
                    className="relative p-3 text-white hover:text-orange-300 hover:bg-gray-700 rounded-xl transition-all duration-200 group"
                    title="Wishlist"
                  >
                    <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                        {wishlistCount}
                      </span>
                    )}
                    <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      Wishlist
                    </span>
                  </button>
                </Link>

                {/* Account */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={handleProfileClick}
                    disabled={loading && !initialized}
                    className="relative p-3 text-white hover:text-orange-300 hover:bg-gray-700 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAuthenticated() ? "Account Menu" : "Sign In"}
                  >
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {isAuthenticated() && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full shadow-sm"></div>
                    )}
                    {loading && !initialized && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                    )}
                    <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      {isAuthenticated() ? "Account" : "Sign In"}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && isAuthenticated() && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {userInfo?.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
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
                  className="relative p-3 text-white hover:text-orange-300 hover:bg-gray-700 rounded-xl transition-all duration-200 group"
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

              {/* Mobile Action Icons */}
              <div className="flex lg:hidden items-center space-x-2">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push("/wishlist")}
                  className="relative p-3 text-white hover:text-orange-300 hover:bg-gray-700 rounded-xl transition-all duration-200 group"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push("/cart")}
                  className="relative p-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
                {/* Sidebar Drawer is now rendered here for mobile */}
                <Drawer direction="left">
                  <DrawerTitle className="sr-only"></DrawerTitle>
                  <DrawerTrigger asChild>
                    <button className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                      <Menu className="w-5 h-5" />
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="w-64 bg-white shadow-lg h-full flex flex-col transform transition-all duration-300 ease-in-out scale-0 opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <span className="font-bold text-lg text-gray-800">
                        Menu
                      </span>
                      <DrawerClose asChild>
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <X className="w-6 h-6" />
                        </button>
                      </DrawerClose>
                    </div>
                    <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto text-gray-700">
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <span className="font-bold text-sm uppercase text-black">
                          Account
                        </span>
                        {navigationLinks.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block py-2 hover:text-blue-600"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <button
                          className="flex items-center justify-between w-full py-2 font-bold focus:outline-none text-black"
                          onClick={() =>
                            setMobileCategoriesOpen(!mobileCategoriesOpen)
                          }
                        >
                          <span>Our Categories</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              mobileCategoriesOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {mobileCategoriesOpen && (
                          <div className="pl-4 flex flex-col gap-1 mt-2">
                            {categoriesLoading ? (
                              <span className="text-gray-400 text-sm py-1">
                                Loading...
                              </span>
                            ) : (
                              categories.map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/products?category=${category.id}`}
                                  className="py-1 text-gray-600 hover:text-orange-600"
                                >
                                  {category.name}
                                </Link>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <span className="font-bold text-sm uppercase text-black">
                          Help Center
                        </span>
                        <ul className="mt-2 space-y-2">
                          <li className="py-1">
                            <span>
                              <a href="/help" className="hover:text-orange-600">
                                Need Help?
                              </a>
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <a
                          href="/blog"
                          className="block py-2 text-black font-bold hover:text-orange-600"
                        >
                          Blog
                        </a>
                      </div>
                    </nav>
                  </DrawerContent>
                </Drawer>
              </div>
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

        {/* Sleek Mobile Sidebar Drawer (DrawerTrigger and DrawerContent must be siblings inside Drawer) */}
      </nav>
    </>
  );
};

export default NavBar;
