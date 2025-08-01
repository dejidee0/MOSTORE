import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  MapPin,
  Phone,
} from "lucide-react";

const NavBar = ({ onWishListClick }) => {
  const [isClient, setIsClient] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with your actual stores
  const wishList = [];
  const itemCount = 3;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Navigation categories matching your products
  const categories = [
    {
      name: "Automobiles",
      icon: <Car className="w-4 h-4" />,
      subcategories: [
        "Engines & Parts",
        "Tires & Wheels",
        "Headlights & Lighting",
        "Interior Accessories",
        "Oils & Fluids",
        "Auto Safety & Security",
        "Bumpers & Body Parts",
        "Tools & Equipment",
      ],
    },
    {
      name: "Motorcycles & Gear",
      icon: <Bike className="w-4 h-4" />,
      subcategories: [
        "Motorcycle Parts",
        "Safety Gear",
        "Helmets",
        "Protective Clothing",
        "Motorcycle Tools",
        "Accessories",
      ],
    },
    {
      name: "Electric Bikes",
      icon: <Battery className="w-4 h-4" />,
      subcategories: [
        "Urban E-Bikes",
        "Mountain E-Bikes",
        "E-Bike Batteries",
        "Charging Accessories",
        "E-Bike Parts",
      ],
    },
    {
      name: "Tech & Gadgets",
      icon: <Smartphone className="w-4 h-4" />,
      subcategories: [
        "Smartphones",
        "Tablets",
        "Smartwear",
        "Computers & Gaming",
        "CCTV & Security",
        "General Accessories",
      ],
    },
    {
      name: "Appliances",
      icon: <Monitor className="w-4 h-4" />,
      subcategories: [
        "TV & Monitors",
        "Audio & HiFi",
        "Cameras",
        "Kitchen Appliances",
        "Home Electronics",
      ],
    },
    {
      name: "Parts & Tools",
      icon: <Wrench className="w-4 h-4" />,
      subcategories: [
        "Hardware",
        "Adhesives",
        "Maintenance Tools",
        "Repair Kits",
        "Professional Equipment",
      ],
    },
  ];

  const handleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
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
            <div className="text-orange-400 font-medium">
              Free shipping on orders over ₦50,000
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center bg-gradient-to-r from-gray-900 to-black px-6 py-3 rounded-lg shadow-lg">
                <img
                  src="/logo.png"
                  alt="MOSTORE"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center ml-8">
              {categories.map((category, index) => (
                <div key={category.name} className="relative group">
                  <motion.button
                    onMouseEnter={() => setActiveDropdown(index)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-colors duration-200 rounded-lg hover:bg-gray-50"
                    whileHover={{ scale: 1.02 }}
                  >
                    {category.icon}
                    {category.name}
                    <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {activeDropdown === index && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setActiveDropdown(index)}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-4 z-50"
                      >
                        <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {category.icon}
                            {category.name}
                          </h3>
                        </div>
                        {category.subcategories.map((subcategory, subIndex) => (
                          <motion.a
                            key={subcategory}
                            href="#"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subIndex * 0.05 }}
                            className="block px-4 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-150"
                          >
                            {subcategory}
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-full text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 ml-6">
              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onWishListClick}
                className="relative p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
                <AnimatePresence>
                  {wishList.length > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {wishList.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Account */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
              >
                <User className="w-5 h-5" />
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-1">
              {/* Mobile Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-700 hover:text-orange-600 rounded-full"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Mobile Wishlist */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onWishListClick}
                className="relative p-2 text-gray-700 hover:text-orange-600 rounded-full"
              >
                <Heart className="w-5 h-5" />
                {wishList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishList.length}
                  </span>
                )}
              </motion.button>

              {/* Mobile Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-700 hover:text-orange-600 rounded-full"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </motion.button>

              {/* Mobile Menu */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-orange-600 rounded-full"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white"
            >
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
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-full text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleDropdown(index)}
                      className="flex items-center justify-between w-full text-left py-2 text-gray-700 font-medium"
                    >
                      <div className="flex items-center gap-3">
                        {category.icon}
                        {category.name}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 mt-2 space-y-2"
                        >
                          {category.subcategories.map((subcategory) => (
                            <a
                              key={subcategory}
                              href="#"
                              className="block py-1 text-sm text-gray-600 hover:text-orange-600"
                            >
                              {subcategory}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Mobile Account Link */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4 border-t border-gray-100"
                >
                  <a
                    href="#"
                    className="flex items-center space-x-3 py-2 text-gray-700 font-medium hover:text-orange-600"
                  >
                    <User className="w-5 h-5" />
                    <span>My Account</span>
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default NavBar;
