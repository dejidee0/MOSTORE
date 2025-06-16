"use client";

import { useState, useRef } from "react";
import {
  HiBell,
  HiOutlinePencilAlt,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import { FaAngleDown, FaPen, FaRegQuestionCircle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import editIcon from "../../public/assets/Edit Icon.png";
import notificationIcon from "../../public/assets/Notification Icon.png";

import Image from "next/image";

export default function Header({ toggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  return (
    <header className="flex flex-wrap items-center justify-between bg-white shadow px-8 py-3 h-auto lg:h-16 relative z-20">
      {/* Hamburger */}
      <button
        className="lg:hidden text-gray-700 focus:outline-none mr-2"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Search bar */}
      <div className="flex-grow max-w-md w-full mx-auto hidden md:flex items-center bg-gray-200 rounded-6xl px-4 py-3 shadow-sm">
        <FiSearch className="text-gray-400 w-5 h-5 mr-2" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6 px-2 md:px-0 mt-3 lg:mt-0 flex-shrink-0 relative">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <img
              src="/logo.png"
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-black-700 group-hover:text-primary truncate">
              Salisu Oluwaseun
            </span>
            <FaAngleDown className="text-black" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md py-2 z-50">
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
                Settings
              </button>
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
        <button className="relative text-black hover:text-primary">
          <Image
            src={notificationIcon}
            width={20}
            height={20}
            alt="Edit Icon"
          />

          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full w-3 h-3 flex items-center justify-center shadow">
            3
          </span>
        </button>
        <button
          className="text-gray-black flex hover:text-primary "
          title="Edit"
        >
          <Image src={editIcon} width={20} height={20} alt="Edit Icon" />
        </button>
        {/* Help */}
        <button className="text-black flex hover:text-primary" title="Help">
          {/* <Image src={helpIcon} width={20} height={20} alt="Edit Icon" /> */}
          <FaRegQuestionCircle />

          <h1>Help</h1>
        </button>

        {/* Edit */}

        {/* Notifications */}

        {/* User Dropdown */}
      </div>
    </header>
  );
}
