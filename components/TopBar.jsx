import { Phone, Mail, Facebook, Twitter, Instagram, Globe, DollarSign } from "lucide-react"

export default function TopBar() {
  return (
    <div className="bg-gray-800 text-white py-2 px-4">
      <div className="container mx-auto flex justify-between items-center text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>support@mostore.com</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Facebook className="w-4 h-4 hover:text-orange-500 cursor-pointer transition-colors" />
            <Twitter className="w-4 h-4 hover:text-orange-500 cursor-pointer transition-colors" />
            <Instagram className="w-4 h-4 hover:text-orange-500 cursor-pointer transition-colors" />
          </div>

          <div className="flex items-center space-x-4 border-l border-gray-600 pl-4">
            <div className="flex items-center space-x-1 cursor-pointer hover:text-orange-500">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-orange-500">
              <DollarSign className="w-4 h-4" />
              <span>USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
