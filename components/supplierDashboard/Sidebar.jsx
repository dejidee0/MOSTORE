"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../public/assets/Mostore logo 2.png";

const navLinks = ["Products", "My Profile"];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 bg-white shadow-lg w-64 h-full
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
        aria-label="Sidebar Navigation"
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2 px-4 py-6 border-b border-gray-200">
          <Image src={logo} width={200} height={200} alt="OnePoint Logo" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4 flex-1">
          {navLinks.map((label) => {
            let route;
            if (label === "My Profile") {
              route = "/supplier/dashboard/my-profile";
            } else {
              route = `/supplier/dashboard/${label
                .toLowerCase()
                .replace(/ & | /g, "-")}`;
            }
            const isActive = pathname === route;
            return (
              <Link
                key={label}
                href={route}
                className={`px-3 py-2 rounded-md text-base font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-3 m-4 mt-auto rounded-md text-base font-bold text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>
    </>
  );
}
