"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Home, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex mb-4 py-4 px-4 md:mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center flex-wrap gap-y-1 space-x-2">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-orange-500 transition-colors text-base md:text-sm"
          >
            <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Home
          </Link>
        </li>

        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;

          return (
            <li key={path} className="inline-flex items-center">
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mx-1" />
              {isLast ? (
                <span className="text-orange-500 font-medium text-xs md:text-sm capitalize">
                  {path.replace(/-/g, " ")}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-gray-500 hover:text-orange-500 transition-colors text-xs md:text-sm capitalize"
                >
                  {path.replace(/-/g, " ")}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const MyProfile = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <div className="min-h-screen bg-white w-full overflow-hidden font-raleway flex flex-col">
        {/* Functional Breadcrumb */}
        <TopBar />
        <NavBar />
        <Breadcrumbs />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-between w-full py-3 px-4 bg-white rounded-lg shadow-xs mb-4"
            aria-expanded={mobileMenuOpen}
          >
            <span className="font-medium text-gray-800">Account Menu</span>
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-500" />
            ) : (
              <Menu className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* Sidebar - Hidden on mobile when menu is closed */}
          <aside
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } lg:block w-full lg:w-1/4 space-y-6 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg shadow-lg lg:shadow-none`}
          >
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 text-gray-800">
                Manage My Account
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/my-profile"
                    className="flex items-center py-2 px-3 text-orange-500 font-medium bg-orange-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-1 h-6 bg-orange-500 mr-3 rounded-full"></span>
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/address-book"
                    className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-1 h-6 bg-transparent mr-3 rounded-full"></span>
                    Address Book
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment-options"
                    className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-1 h-6 bg-transparent mr-3 rounded-full"></span>
                    My Payment Options
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 text-gray-800">
                My Orders
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/my-returns"
                    className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-1 h-6 bg-transparent mr-3 rounded-full"></span>
                    My Returns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-cancellations"
                    className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-1 h-6 bg-transparent mr-3 rounded-full"></span>
                    My Cancellations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 text-gray-800">
                My WishList
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/wishlist"
                    className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-1 h-6 bg-transparent mr-3 rounded-full"></span>
                    View Wishlist
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 bg-white shadow-sm rounded-xl p-5 sm:p-6 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
              Edit Your Profile
            </h2>
            <p className="text-gray-500 text-sm md:text-base mb-6">
              Update your personal information
            </p>

            <form className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5 md:pt-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
                  Password Changes
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 md:pt-6">
                <button
                  type="button"
                  className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyProfile;
