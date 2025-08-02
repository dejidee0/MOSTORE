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
     <footer className="bg-gray-300  mt-10">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold">MOSTORE</span>
              </div>
              <p className="text-orange-500 text-sm leading-relaxed">
                Welcome to our Store, where we pride ourselves on excellent customer service and our drive strive and grow business.
              </p>
              <div className="flex gap-2 mt-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">in</span>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">ig</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-orange-500">QUICK LINKS</h4>
              <div className="space-y-2 text-sm text-black">
                <div>Got Questions?</div>
                <div>Monday - Friday: 9am-6pm</div>
                <div>Saturday: 10am - 3pm</div>
                <div>support@ourstore.com</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-orange-500 underline">JOIN OUR NEWSLETTER</h4>
              <p className="text-black text-sm mb-4">
                Get Email updates about our latest shop and special offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email here"
                  className="flex-1 px-4 py-2 rounded-l text-black bg-white"
                />
                <button className="bg-orange-500 px-4 py-2 text-white rounded-r">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}
