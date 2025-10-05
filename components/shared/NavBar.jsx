"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
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
import { Gift, HeartPulse, Laptop, Ship, Baby } from "lucide-react";
import { FaChildDress, FaOilCan } from "react-icons/fa6";
import { BsGear } from "react-icons/bs";
import { ArrowRight } from "lucide-react";

const MenuButton = ({ onClick, icon, label, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-orange-50 transition-all duration-200 text-gray-700 ${className}`}
    >
      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
};

const NavBar = () => {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut, getUserEmail, initialized } =
    useUserStore();
  const { totalItems: cartItemCount } = useCart();
  const [isClient, setIsClient] = useState(false);
  const { totalItems: wishlistCount } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const role = user?.user_metadata?.role;
  const realUser = user?.user_metadata;

  const userInfo = useMemo(() => {
    if (!user) return null;
    const email = getUserEmail();
    return {
      email,
      initial: email?.charAt(0).toUpperCase() || "U",
      displayName: email?.split("@")[0] || "User",
    };
  }, [user, getUserEmail]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setIsDrawerOpen(false);
    };
    router.events?.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events?.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

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
    if (name.includes("kids")) return <Baby className="w-4 h-4" />;
    return <BsGear className="w-4 h-4" />;
  }, []);

  const formatCategoryItems = useCallback((description) => {
    if (!description) return [];
    return description
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 4);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown"))
        setIsProfileDropdownOpen(false);
      if (!event.target.closest(".category-dropdown"))
        setIsCategoryDropdownOpen(false);
      if (!event.target.closest(".help-dropdown")) setIsHelpDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      router.push(
        `/${role}/dashboard${role === "supplier" ? "/products" : ""}`
      );
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
    router.push("/my-account?tab=orders");
  }, [router]);

  const navigateToSettings = useCallback(() => {
    setIsProfileDropdownOpen(false);
    router.push("/settings");
  }, [router]);

  const handleCategoryClick = useCallback(
    (categoryId, categoryName) => {
      router.push(`/products?category=${categoryId}`);
      setIsCategoryDropdownOpen(false);
      setIsDrawerOpen(false);
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
        setIsSearchOpen(false);
      }
    },
    [handleSearch, searchQuery]
  );

  const CategoryItem = ({ category, onClick, getIcon, formatItems }) => {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-50 transition-all duration-200 text-gray-700"
      >
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          {getIcon(category.name)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">{category.name}</p>
          {formatItems(category.description).map((item, index) => (
            <p key={index} className="text-xs text-gray-500">
              {item}
            </p>
          ))}
        </div>
      </button>
    );
  };

  const navigationLinks = useMemo(
    () =>
      [
        !user && { label: "Sign in", href: "/sign-in" },
        { label: "My Account", href: "/my-account?tab=profile" },
        user &&
          role !== "customer" && {
            label: "My Dashboard",
            href: `/${role}/dashboard${role === "supplier" ? "/products" : ""}`,
          },
        { label: "My Orders", href: "/my-account?tab=orders" },
        { label: "Wishlist", href: "/wishlist" },
      ].filter(Boolean),
    [user]
  );

  if (!isClient) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs py-2 hidden lg:block shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center ml-10">
              <h1 className="font-semibold text-sm text-white tracking-wide">
                <span className="hidden sm:inline">
                  Sell Faster, Buy Smarter
                </span>
                <span className="sm:hidden">Fast & Smart Shopping</span>
              </h1>
            </div>
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
              <div className="relative group">
                <button className="flex items-center gap-2 text-xs hover:text-orange-100 transition-colors">
                  <span>Language: English</span>
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs hover:text-orange-100 transition-colors">
                  <span>Currency: EUR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav className="sticky top-0 z-50 bg-gray-900 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
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
            <div className="flex-1 flex items-center justify-center lg:justify-between ml-4 lg:ml-8">
              <div className="relative category-dropdown hidden lg:block">
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none shadow-sm hover:shadow-md"
                >
                  <Package className="w-5 h-5" />
                  <span>All Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-3 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-500" />
                        Shop by Category
                      </h3>
                    </div>
                    {categoriesLoading ? (
                      <div>Loading...</div>
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
                    className="absolute right-0 inset-y-0 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-r-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              {!user && role !== "supplier" && role !== "admin" && (
                <Link href="/supplier-sign">
                  <button className="hidden lg:flex items-center text-white font-medium hover:text-orange-300 transition-colors duration-200 ml-2">
                    Sell
                  </button>
                </Link>
              )}

              <Link href="/products">
                <button className="hidden lg:flex items-center text-white font-medium hover:text-orange-300 transition-colors duration-200 ml-2">
                  Shop
                </button>
              </Link>
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
                {isHelpDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <LifeBuoy className="w-4 h-4 text-orange-500" />
                        How can we help you?
                      </h3>
                    </div>
                    <div className="py-2">
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
                          support@mostoreon.com
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden lg:flex items-center space-x-1 ml-4">
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
                  {isProfileDropdownOpen && isAuthenticated() && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {userInfo?.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {realUser?.full_name}
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
                        {role !== "admin" && role !== "supplier" && (
                          <MenuButton
                            onClick={navigateToOrders}
                            icon={<Package className="w-5 h-5" />}
                            label="My Orders"
                          />
                        )}
                        {(role === "supplier" || role === "admin") && (
                          <MenuButton
                            onClick={() => navigateToDashboard(role)}
                            icon={<Home className="w-5 h-5" />}
                            label="My Account"
                          />
                        )}
                        {role !== "supplier" && role !== "admin" && (
                          <MenuButton
                            onClick={() => router.push("/my-account")}
                            icon={<Home className="w-5 h-5" />}
                            label="My Account"
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
                <Drawer
                  direction="left"
                  open={isDrawerOpen}
                  onOpenChange={setIsDrawerOpen}
                >
                  <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
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
                    <nav className="flex-1 flex flex-col gap-2 px-4 py-0 overflow-y-auto text-gray-700">
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        {navigationLinks.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsDrawerOpen(false)}
                            className="block py-2 pl-2 hover:text-blue-600"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        {" "}
                        {!user && role !== "supplier" && role !== "admin" && (
                          <Link
                            href="/supplier-sign"
                            className="flex justify-between items-center"
                            prefetch
                          >
                            <span className=" text-black">
                              Sell on{" "}
                              <span className="font-bold text-orange-500">
                                Mostore
                              </span>
                            </span>

                            <span className="text-orange-500 text-xs">
                              <ArrowRight />
                            </span>
                          </Link>
                        )}
                      </div>

                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm uppercase text-black">
                            Our Categories
                          </span>
                          <Link
                            href="/products"
                            prefetch
                            onClick={() => setIsDrawerOpen(false)}
                          >
                            <span className="text-orange-500">See all</span>
                          </Link>
                        </div>
                        <div className="pl-2 flex flex-col gap-1">
                          {categoriesLoading ? (
                            <span className="text-gray-400 text-sm py-1">
                              Loading...
                            </span>
                          ) : (
                            categories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => {
                                  handleCategoryClick(
                                    category.id,
                                    category.name
                                  );
                                  setIsDrawerOpen(false);
                                }}
                                className="py-1 text-left text-gray-600 hover:text-orange-600 w-full"
                              >
                                {category.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <span className="font-bold text-sm uppercase text-black">
                          Help Center
                        </span>
                        <ul className="mt-2 pl-2 space-y-2">
                          <li className="py-1">
                            <a
                              href="/help"
                              onClick={() => setIsDrawerOpen(false)}
                              className="hover:text-orange-600"
                            >
                              Need Help?
                            </a>
                          </li>
                          <li className="py-1">
                            <a
                              href="/contact"
                              onClick={() => setIsDrawerOpen(false)}
                              className="hover:text-orange-600"
                            >
                              Contact Us
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="mb-2">
                        <a
                          href="/blog"
                          onClick={() => setIsDrawerOpen(false)}
                          className="block text-black font-bold hover:text-orange-600"
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
          {isSearchOpen && (
            <div className="lg:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200 shadow-sm">
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
        </div>
      </nav>
    </>
  );
};

export default NavBar;
