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
  return (
    <footer className="bg-gray-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Logo Section with NEED HELP */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <span className="text-2xl font-bold text-white">
                MO<span className="text-orange-500">STORE</span>
              </span>
            </div>

            {/* NEED HELP Section */}
            <div className="mb-4">
              <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wide">
                NEED HELP?
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/help"
                    className="text-gray-300 hover:text-orange-400 transition-colors text-xs"
                  >
                    Help Center & FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-orange-400 transition-colors text-xs"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* USEFUL LINKS Section - Own Column */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wide">
              USEFUL LINKS
            </h4>
            <div className="space-y-1">
              <Link
                href="/about"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                About MOSTORE
              </Link>
              <Link
                href="/how-to-shop"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                How to shop
              </Link>
              <Link
                href="/delivery"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                Delivery options
              </Link>
              <Link
                href="/returns"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                Returns
              </Link>
              <Link
                href="/payments"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                Payments
              </Link>
              <Link
                href="/terms"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                Terms & Condition
              </Link>
              <Link
                href="/privacy"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                Privacy Policy
              </Link>
              <Link
                href="/news"
                className="block text-gray-300 hover:text-orange-400 transition-colors text-xs"
              >
                News
              </Link>
            </div>
          </div>

          {/* MAKE MONEY ON MOSTORE Section */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wide">
              MAKE MONEY ON MOSTORE
            </h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/sell"
                  className="text-gray-300 hover:text-orange-400 transition-colors text-xs"
                >
                  Sell on MOSTORE
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor"
                  className="text-gray-300 hover:text-orange-400 transition-colors text-xs"
                >
                  Vendor hub
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate"
                  className="text-gray-300 hover:text-orange-400 transition-colors text-xs"
                >
                  Affiliate & Influencer
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section - Far Right */}
          <div className="lg:col-span-5">
            <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wide">
              NEW TO MOSTORE ?
            </h4>
            <p className="text-orange-400 text-xs mb-2 font-medium">
              Stay Updated with MOSTORE
            </p>
            <p className="text-gray-300 text-xs mb-3 leading-relaxed">
              Subscribe to our newsletter to get updates on our latest offers,
              exclusive deals, new arrivals and expert insights delivered to
              your inbox
            </p>

            <div className="flex mb-3">
              <input
                type="email"
                placeholder="Enter E-mail Address"
                className="flex-1 px-3 py-2 text-xs border-0 bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <button className="bg-gray-700 border border-gray-600 px-4 py-2 text-white hover:bg-gray-600 transition-colors text-xs font-medium">
                Subscribe
              </button>
            </div>

            <div className="flex items-start mb-3">
              <input
                type="checkbox"
                id="agreement"
                className="mr-2 mt-0.5 accent-orange-500 scale-75"
              />
              <label
                htmlFor="agreement"
                className="text-xs text-gray-400 leading-tight"
              >
                I agree <span className="text-orange-400">mostore</span> Privacy
                and Cookie Policy. You can unsubscribe newsletters at any time.
                I accept the{" "}
                <span className="text-orange-400">Legal Terms</span>
              </label>
            </div>

            {/* Payment Methods - Above Border */}
            <div className="flex items-center gap-4 justify-end mt-6">
              <span className="text-gray-300 font-medium text-xs">
                PAYMENT METHODS
              </span>
              <div className="flex gap-2">
                <div className="bg-white px-3 py-1 rounded">
                  <span className="text-xs font-bold text-blue-600">
                    Stripe
                  </span>
                </div>
                <div className="bg-white px-3 py-1 rounded">
                  <span className="text-xs font-bold text-orange-600">
                    Skrill
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright Only */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-xs leading-tight">
                © 2025{" "}
                <span className="text-orange-400 font-semibold">MOSTORE</span>.
                All Rights Reserved - The Use Of This Site Is Subject To Certain
                Terms And Conditions, Local Store Prices May Vary From Those
                Displayed. Products Shown As Available Are Normally Stocked But
                Inventory Levels Cannot Be Guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
