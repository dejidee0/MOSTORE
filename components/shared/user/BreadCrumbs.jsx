import React from "react";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Breadcrumbs = ({ activeTab }) => {
  const pathname = usePathname();
  const tabDisplayNames = {
    account: "My Account",
    orders: "My Orders",
    wishlist: "Wishlist",
  };

  return (
    <nav className="flex mb-6 px-4 md:px-0" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2 text-sm text-gray-600">
        <li className="flex items-center">
          <Link
            href="/"
            className="hover:text-orange-500 transition-colors flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          <Link
            href="/my-account"
            className="hover:text-orange-500 transition-colors"
          >
            My Account
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          <span className="text-orange-500 font-medium">
            {tabDisplayNames[activeTab] || "My Account"}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
