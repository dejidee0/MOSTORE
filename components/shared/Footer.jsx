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

      <div className="relative max-w-7xl mx-auto px-6 py-3">
        {/* Main Content - Single Row with Multiple Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-3">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <div className="mb-1">
              <span className="text-lg font-bold text-white">
                MO<span className="text-orange-500">STORE</span>
              </span>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">
                NEED HELP?
              </h4>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/help"
                    className="text-gray-300 hover:text-orange-400 transition-colors text-xs"
                  >
                    Help & FAQ
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

          {/* Useful Links - Compact Grid */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">
              USEFUL LINKS
            </h4>
            <div className="grid grid-cols-1 gap-0.5 text-xs">
              <Link
                href="/about"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/how-to-shop"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                How to shop
              </Link>
              <Link
                href="/delivery"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Delivery
              </Link>
              <Link
                href="/returns"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Returns
              </Link>
              <Link
                href="/payments"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Payments
              </Link>
              <Link
                href="/terms"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>

          {/* More Links */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">
              MORE
            </h4>
            <div className="grid grid-cols-1 gap-0.5 text-xs">
              <Link
                href="/privacy"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/news"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                News
              </Link>
              <Link
                href="/supplier-sign"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Sell on MOSTORE
              </Link>
              <Link
                href="/vendor"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Vendor hub
              </Link>
              <Link
                href="/affiliate"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Affiliate
              </Link>
            </div>
          </div>

          {/* Newsletter Section - Compact */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Newsletter Form */}
              <div>
                <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">
                  STAY UPDATED
                </h4>
                <p className="text-orange-400 text-xs mb-1 font-medium">
                  Newsletter Subscription
                </p>

                <div className="flex flex-col md:flex-row mb-1">
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="flex-1 px-2 py-1 text-xs border-0 bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400 rounded-l"
                  />
                  <button className="bg-orange-500 hover:bg-orange-600 px-3 py-1 text-white transition-colors text-xs font-medium rounded-r">
                    Subscribe
                  </button>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreement"
                    className="mr-1.5 mt-0.5 accent-orange-500 scale-75 flex-shrink-0"
                  />
                  <label
                    htmlFor="agreement"
                    className="text-xs text-gray-400 leading-tight"
                  >
                    I agree to{" "}
                    <span className="text-orange-400">Privacy Policy</span> and{" "}
                    <span className="text-orange-400">Terms</span>
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="font-bold text-white mb-1 text-xs uppercase tracking-wide">
                  PAYMENT METHODS
                </h4>
                <div className="grid grid-cols-4 gap-1">
                  {/* PayPal */}
                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center">
                    <svg
                      width="16"
                      height="10"
                      viewBox="0 0 24 14"
                      fill="#003087"
                    >
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.79A.859.859 0 0 1 5.79 2h8.263c.734 0 1.43.155 2.043.428 1.226.546 1.9 1.677 1.9 3.188 0 2.718-2.198 4.637-5.462 4.637H9.67l-.978 6.084z" />
                    </svg>
                  </div>

                  {/* Visa */}
                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center">
                    <div className="w-4 h-2 bg-gradient-to-r from-blue-600 to-yellow-400 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                  </div>

                  {/* Mastercard */}
                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center">
                    <div className="relative w-4 h-3">
                      <div className="absolute w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="absolute w-2 h-2 bg-yellow-500 rounded-full left-1"></div>
                    </div>
                  </div>

                  {/* Apple Pay */}
                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center">
                    <svg width="14" height="10" viewBox="0 0 24 14" fill="#000">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </div>

                  {/* More payment methods in second row */}
                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                  </div>

                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">€</span>
                    </div>
                  </div>

                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center">
                    <svg
                      width="12"
                      height="10"
                      viewBox="0 0 24 14"
                      fill="#10B981"
                    >
                      <path
                        d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        stroke="#10B981"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle cx="12" cy="12" r="3" fill="#10B981" />
                    </svg>
                  </div>

                  <div className="bg-white px-1 py-0.5 rounded flex items-center justify-center text-xs font-bold text-gray-700">
                    +3
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Copyright */}
        <div className="pt-2 border-t border-gray-600">
          <div className="text-center">
            <div className="text-gray-400 text-xs leading-tight">
              © 2025{" "}
              <span className="text-orange-400 font-semibold">MOSTORE</span>.
              All Rights Reserved | Terms & Conditions Apply | Local Store
              Prices May Vary | Inventory Levels Not Guaranteed
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
