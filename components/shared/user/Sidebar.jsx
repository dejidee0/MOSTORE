import React from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  Heart,
  UserCircle,
  LogOut,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";

const Sidebar = ({
  activeTab,
  handleTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
  fullName,
  email,
  handleLogout,
}) => {
  return (
    <Tooltip.Provider>
      <aside className="lg:fixed lg:top-[4.5rem] lg:left-0 lg:h-[calc(100vh-4.5rem)] lg:w-64 bg-white shadow-sm p-4 space-y-4 z-60">
        <DropdownMenu.Root
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        >
          <DropdownMenu.Trigger asChild className="lg:hidden">
            <button className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-xl shadow-sm mb-4">
              <span className="font-medium text-gray-800">Menu</span>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="lg:hidden bg-white rounded-xl shadow-lg p-4 w-full max-w-[90vw] mx-auto mt-2 z-60"
              sideOffset={5}
            >
              <div className="flex items-center gap-3 mb-4">
                <UserCircle className="w-8 h-8 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-gray-800">{fullName}</h3>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>
              <DropdownMenu.Item
                onSelect={() => handleTabChange("account")}
                className={`flex items-center p-3 rounded-lg cursor-pointer ${
                  activeTab === "account"
                    ? "bg-orange-50 text-orange-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                My Account
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => handleTabChange("orders")}
                className={`flex items-center p-3 rounded-lg cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-orange-50 text-orange-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                My Orders
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => handleTabChange("wishlist")}
                className={`flex items-center p-3 rounded-lg cursor-pointer ${
                  activeTab === "wishlist"
                    ? "bg-orange-50 text-orange-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <Heart className="w-5 h-5 mr-3" />
                Wishlist
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-2 border-t border-gray-200" />
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 text-red-500"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Log Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <nav className="hidden lg:block space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <UserCircle className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="font-semibold text-gray-800">{fullName}</h3>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2 text-gray-800">
              Manage Account
            </h3>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={() => handleTabChange("account")}
                  className={`w-full flex items-center p-2 rounded-lg transition ${
                    activeTab === "account"
                      ? "bg-orange-50 text-orange-500"
                      : "hover:bg-gray-50"
                  }`}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <User className="w-5 h-5 mr-3" />
                  My Account
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                  sideOffset={5}
                >
                  View and edit your account details
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2 text-gray-800">
              Shopping
            </h3>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={() => handleTabChange("orders")}
                  className={`w-full flex items-center p-2 rounded-lg transition ${
                    activeTab === "orders"
                      ? "bg-orange-50 text-orange-500"
                      : "hover:bg-gray-50"
                  }`}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  My Orders
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                  sideOffset={5}
                >
                  View your order history
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={() => handleTabChange("wishlist")}
                  className={`w-full flex items-center p-2 rounded-lg transition ${
                    activeTab === "wishlist"
                      ? "bg-orange-50 text-orange-500"
                      : "hover:bg-gray-50"
                  }`}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart className="w-5 h-5 mr-3" />
                  Wishlist
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                  sideOffset={5}
                >
                  Manage your saved items
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
          <div>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center p-2 rounded-lg transition hover:bg-gray-50 text-red-500"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Log Out
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 shadow-lg"
                  sideOffset={5}
                >
                  Sign out of your account
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </nav>
      </aside>
    </Tooltip.Provider>
  );
};

export default Sidebar;
