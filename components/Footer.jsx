import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const footerSections = [
    {
      title: "About MOSTORE",
      links: [
        { name: "Our Story", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Sustainability", href: "/sustainability" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "FAQ", href: "/help" },
        { name: "Shipping Info", href: "/shipping" },
        { name: "Returns", href: "/returns" },
      ],
    },
    {
      title: "Quick Links",
      links: [
        { name: "New Arrivals", href: "/shop?filter=new" },
        { name: "Best Sellers", href: "/shop?filter=bestsellers" },
        { name: "Sale", href: "/shop?filter=sale" },
        { name: "Gift Cards", href: "/gift-cards" },
      ],
    },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-orange-500 mb-4">MOSTORE</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner for premium home appliances. We bring you the latest technology and innovative
              solutions to make your life more comfortable and efficient.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="text-gray-300">123 Commerce Street, City, State 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <span className="text-gray-300">support@mostore.com</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-orange-500 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 MOSTORE. All rights reserved.</p>

            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" />
                <Youtube className="w-5 h-5 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" />
              </div>

              <div className="flex space-x-4 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
