import { Raleway } from "next/font/google";
import "../globals.css";

import { ToastProvider } from "@/lib/toast";
import Footer from "@/components/shared/Footer";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/lib/cart";
import NavBar from "@/components/shared/NavBar";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title:
    "MOStore | Online Shopping Store That is More Than a Store, That Gives You More Value, More Quality, More Choice, More Varieties, Get More Out of Every Store",
  description: `Online Shopping Store Built For Used and New Household Appliances, Autoparts, Electronics, Phones, Computers, Automobiles And More..`,

  icons: {
    icon: [
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" }, // Combined ICO fallback
    ],

    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],

    shortcut: "/favicon.ico", // Or use mstile-150x150.png if generated
  },
  openGraph: {
    title:
      "MOStore | Online Shopping Store That is More Than a Store, That Gives You More Value, More Quality, More Choice, More Varieties, Get More Out of Every Store",
    description: `Online Shopping Store Built For Used and New Household Appliances, Autoparts, Electronics, Phones, Computers, Automobiles And More..`,
    // Note: /favicon.png may not be ideal for OG (social previews expect 1200x630 images).
    // Replace with a proper OG banner image (e.g., /og-image.jpg) for better previews on Facebook/Twitter.
    // Keep dimensions as-is for validity.
    images: [
      {
        url: "favicon.png", // Recommended: Upload a dedicated 1200x630 PNG/JPG to /public
        width: 1200,
        height: 630,
        alt: "MOSTORE Logo",
      },
    ],
    url: "https://mostoreon.com",
    type: "website",
    siteName: "MOStore", // Improves OG rendering
  },

  // Optional: Verify site ownership for search engines (e.g., Google Search Console)
  // Add verification: { google: "your-verification-code.html-file-in-public" }
  // This helps with favicon indexing in search results.
};

export default function UserLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${raleway.variable} font-raleway antialiased bg-white min-h-[calc(100vh-4rem)] flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <NavBar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
