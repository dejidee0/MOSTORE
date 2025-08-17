import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const footerSections = [
    {
      title: "NEED HELP?",
      links: [
        { name: "Chat with us", href: "/chat" },
        { name: "Help Center & FAQ", href: "/help" },
        { name: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "USEFUL LINKS",
      links: [
        { name: "About MOSTORE", href: "/about" },
        { name: "How to shop", href: "/how-to-shop" },
        { name: "Returns", href: "/returns" },
        { name: "Terms & Conditions", href: "/terms" },
      ],
    },
    {
      title: "MAKE MONEY",
      links: [
        { name: "Sell on MOSTORE", href: "/sell" },
        { name: "Vendor hub", href: "/vendor" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-300 max-h-[40vh] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Logo, Contact & Social - Compact */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-gray-800">
                MO<span className="text-orange-500">STORE</span>
              </span>
            </div>

            <p className="text-orange-500 text-xs leading-relaxed mb-2">
              Welcome to our Store, where we pride ourselves on excellent
              customer service.
            </p>

            {/* Contact Info Integrated */}
            <div className="space-y-1 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-orange-500" />
                <span className="text-gray-700">+39 0541 857848</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-orange-500" />
                <span className="text-gray-700">support@ourstore.com</span>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <Link
                href="#"
                className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600"
              >
                <Facebook className="w-3 h-3 text-white" />
              </Link>
              <Link
                href="#"
                className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600"
              >
                <Twitter className="w-3 h-3 text-white" />
              </Link>
              <Link
                href="#"
                className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600"
              >
                <Instagram className="w-3 h-3 text-white" />
              </Link>
            </div>

            <div className="text-xs text-orange-500 font-medium">
              Mon-Fri: 9am-6pm | Sat: 10am-3pm
            </div>
          </div>

          {/* Footer Links - Compact */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-gray-800 mb-2 text-xs uppercase">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter & App Download - Compact */}
          <div>
            <h4 className="font-semibold text-orange-500 mb-2 text-xs uppercase underline">
              NEWSLETTER
            </h4>
            <p className="text-gray-700 text-xs mb-2">
              Get updates on latest offers.
            </p>
            <div className="flex mb-3">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-l bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button className="bg-orange-500 px-2 py-1 text-white rounded-r hover:bg-orange-600 flex items-center justify-center">
                <Send className="w-3 h-3" />
              </button>
            </div>

            {/* App Download */}
            <div className="mb-2">
              <h5 className="font-semibold text-gray-800 mb-1 text-xs uppercase">
                GET OUR APP
              </h5>
              <p className="text-gray-600 text-xs mb-2">Coming Soon!</p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 bg-gray-400 text-gray-600 px-2 py-1 rounded text-xs cursor-not-allowed">
                  <div className="w-4 h-4 bg-gray-500 rounded flex items-center justify-center">
                    <span className="text-white text-[8px]">🍎</span>
                  </div>
                  <span className="text-[10px]">App Store</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-400 text-gray-600 px-2 py-1 rounded text-xs cursor-not-allowed">
                  <div className="w-4 h-4 bg-gray-500 rounded flex items-center justify-center">
                    <span className="text-white text-[8px]">▶</span>
                  </div>
                  <span className="text-[10px]">Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Compact */}
        <div className="mt-3 pt-2 border-t border-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
            <div className="text-gray-600">
              © 2025{" "}
              <span className="text-orange-500 font-semibold">MOSTORE</span>.
              All Rights Reserved
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">PAYMENT METHODS</span>
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-white border border-gray-300 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-orange-600">
                    MC
                  </span>
                </div>
                <div className="w-10 h-5 bg-white border border-gray-300 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-600">
                    PayPal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
