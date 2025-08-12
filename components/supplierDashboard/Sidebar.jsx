"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../public/assets/Mostore logo 2.png";

const navLinks = ["Dashboard", "Products"];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();

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
        <nav className="flex flex-col gap-2 p-4">
          {navLinks.map((label) => {
            const route = `/supplier/dashboard/${label.toLowerCase().replace(/ & | /g, "-")}`;
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
      </aside>
    </>
  );
}
