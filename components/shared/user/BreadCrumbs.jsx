import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Breadcrumbs = ({ activeTab }) => {
  const pathname = usePathname();
  const router = useRouter();
  const tabDisplayNames = {
    welcome: "Dashboard",
    account: "Profile",
    orders: "Orders",
  };

  const tabs = Object.keys(tabDisplayNames);

  const handleTabClick = (tab) => {
    router.push(`/my-account?tab=${tab}`);
  };

  return (
    <nav className="flex mb-6 px-4 md:px-0" aria-label="Navigation">
      <ol className="inline-flex items-center space-x-2 text-sm">
        {tabs.map((tab, index) => (
          <li key={tab} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            )}
            <Link
              href={`/my-account?tab=${tab}`}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(tab);
              }}
              className={`font-medium ${
                activeTab === tab
                  ? "text-orange-500 font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tabDisplayNames[tab]}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
