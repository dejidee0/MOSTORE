import { ChevronDown } from "lucide-react"
import Link from "next/link"

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
        <div className="flex items-center space-x-2 bg-orange-500 px-4 py-2 rounded cursor-pointer hover:bg-orange-600 transition-colors">
          <span className="font-medium">All Categories</span>
          <ChevronDown className="w-4 h-4" />
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
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
