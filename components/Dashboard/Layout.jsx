"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { useMediaQuery } from "@/lib/utils";
export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Mobile Hamburger Button - moved to avoid covering title */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-full bg-white shadow-md border border-gray-200 focus:outline-none transition-all"
        style={{ top: "1rem", left: "1rem" }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 w-full max-w-8xl mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-0 overflow-auto">
          {/* Responsive page title wrapper to avoid hamburger overlap */}
          <div className="relative">
            <div className="lg:hidden h-12"></div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
