import { ChevronDown } from "lucide-react"
import Link from "next/link"
import CategoryDropdown from "./categories/CategoryDropDown"

export default function CategoryMenu() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blog" },
    { name: "Help", href: "/help" },
  ]

  return (
    <div className="bg-white text-black py-3 px-4">
      <div className="container mx-auto flex items-center  space-x-8">
        {/* All Categories Dropdown */}
        <div >
          
        <CategoryDropdown/>
        </div>


        {/* Navigation Links */}
        <nav className="flex items-center md:space-x-6 space-x-2 ">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-orange-500 transition-colors font-medium">
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
