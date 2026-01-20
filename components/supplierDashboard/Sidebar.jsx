"use client";

import Link from "next/link";
import { LogOut, Package, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../public/assets/Mostore logo 2.png";
import { Mail } from "lucide-react";

const navLinks = [
  { label: "Dashboard", icon: Package, route: "/supplier/dashboard" },
  { label: "Products", icon: Package, route: "/supplier/dashboard/products" },

  {
    label: "Charity Products",
    icon: Package,
    route: "/supplier/dashboard/charity-products",
  },
  { label: "Messages", icon: Mail, route: "/supplier/dashboard/messages" },
  { label: "Orders", icon: Package, route: "/supplier/dashboard/orders" },
  { label: "My Profile", icon: User, route: "/supplier/dashboard/my-account" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    if (toggleSidebar) toggleSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 bg-white w-64 h-screen
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none
          shadow-lg border-r border-gray-100
        `}
        aria-label="Sidebar Navigation"
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center px-4 py-6 border-b border-gray-200">
          <Link href="/">
            <Image
              src={logo}
              width={160}
              height={40}
              alt="Mostore Logo"
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navLinks.map(({ label, icon: Icon, route }) => {
            const isActive = pathname === route;
            return (
              <Link
                key={label}
                href={route}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-orange-100 text-orange-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-orange-500"
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 1024 && toggleSidebar)
                    toggleSidebar();
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-3 px-4 py-3 m-4 mt-auto rounded-lg text-sm font-medium
            text-red-600 hover:bg-red-50 hover:text-red-700
            transition-all duration-200 ease-in-out
          "
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
