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
              <div className="flex gap-2 flex-wrap">
                {/* PayPal */}
                <div className="bg-white px-3 py-1 rounded flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#003087"
                  >
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.79A.859.859 0 0 1 5.79 2h8.263c.734 0 1.43.155 2.043.428 1.226.546 1.9 1.677 1.9 3.188 0 2.718-2.198 4.637-5.462 4.637H9.67l-.978 6.084z" />
                    <path
                      d="M19.81 7.598c-.235 1.524-1.417 2.472-3.25 2.472h-2.65l-.726 4.524h2.425c.696 0 1.29-.047 1.78-.14.49-.094.926-.234 1.307-.42.38-.186.713-.42 1-.7.287-.28.527-.607.72-.98.193-.373.34-.793.44-1.26.1-.467.15-.987.15-1.56 0-.573-.083-1.133-.25-1.68-.167-.547-.417-1.04-.75-1.48-.333-.44-.75-.813-1.25-1.12-.5-.307-1.083-.467-1.75-.48z"
                      fill="#0070BA"
                    />
                  </svg>
                  <span className="text-xs font-bold text-blue-800">
                    PayPal
                  </span>
                </div>

                {/* Skrill */}
                <div className="bg-white px-3 py-1 rounded flex items-center gap-1">
                  <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <span className="text-xs font-bold text-purple-600">
                    Skrill
                  </span>
                </div>

                {/* SEPA */}
                <div className="bg-white px-3 py-1 rounded flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">€</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600">SEPA</span>
                </div>

                {/* Visa */}
                <div className="bg-white px-3 py-1 rounded flex items-center gap-1">
                  <div className="w-4 h-3 bg-gradient-to-r from-blue-600 to-yellow-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">V</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600">Visa</span>
                </div>

                {/* Mastercard */}
                <div className="bg-white px-3 py-1 rounded flex items-center gap-1">
                  <div className="relative w-4 h-4">
                    <div className="absolute w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="absolute w-2 h-2 bg-yellow-500 rounded-full left-1"></div>
                  </div>
                  <span className="text-xs font-bold text-red-600">Master</span>
                </div>

                {/* Apple Pay */}
                <div className="bg-white px-3 py-1 rounded flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-800">
                    Apple Pay
                  </span>
                </div>

                {/* Cash */}
                <div className="bg-white px-3 py-1 rounded flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#10B981"
                  >
                    <path
                      d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      stroke="#10B981"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="12" cy="12" r="3" fill="#10B981" />
                    <path
                      d="M7 10h.01M17 10h.01M7 14h.01M17 14h.01"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xs font-bold text-green-600">Cash</span>
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
