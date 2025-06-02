import { Search, User, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NavBar() {
  return (
    <nav className="bg-white shadow-sm border-b py-4 px-4 w-full">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-orange-500">MOSTORE</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <Button size="sm" className="absolute right-1 top-1 bg-orange-500 hover:bg-orange-600 text-white px-3">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Account & Cart */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 cursor-pointer hover:text-orange-500 transition-colors">
            <User className="w-5 h-5" />
            <span className="hidden md:block">Account</span>
          </div>

          <div className="relative cursor-pointer hover:text-orange-500 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </div>

          <div className="relative cursor-pointer hover:text-orange-500 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
