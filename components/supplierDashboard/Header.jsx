"use client";

import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import {
  FaAngleDown,
  FaRegQuestionCircle,
  FaBell,
  FaEdit,
} from "react-icons/fa";
import Image from "next/image";

export default function Header({ toggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <h1 className="hidden md:block font-semibold">
            Welcome to your Supplier Dashboard
          </h1>
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded-md text-gray-700 hover:text-primary focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Right controls */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Help button - icon only on mobile */}
            <button
              className="p-1.5 rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
              title="Help"
            >
              <span className="sr-only">Help</span>
              <FaRegQuestionCircle className="h-5 w-5" />
              <span className="hidden md:inline ml-2 text-sm font-medium">
                Help
              </span>
            </button>

            {/* Edit button */}
            <button
              className="p-1.5 rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <span className="sr-only">Edit</span>
              <FaEdit className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="p-1.5 relative rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors">
              <span className="sr-only">Notifications</span>
              <FaBell className="h-5 w-5" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 max-w-xs rounded-full focus:outline-none group"
              >
                <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                  <Image
                    src="/about.jpg"
                    alt="Profile"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700 group-hover:text-primary truncate max-w-[120px]">
                  Salisu Oluwaseun
                </span>
                <FaAngleDown
                  className={`text-gray-500 transition-transform ${
                    dropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
