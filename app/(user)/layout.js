// app/(user)/layout.jsx
import { Raleway } from "next/font/google";
import "../globals.css";

import { ToastProvider } from "@/lib/toast";
import Footer from "@/components/shared/Footer";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/lib/cart";
import NavBar from "@/components/shared/NavBar";
import ChristmasPopup from "@/components/pop-up";
import QueryProvider from "@/components/QueryProvider";
import MessageNotificationProvider from "@/components/MessageNotificationProvider";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title:
    "MOSTORE | Online Shopping Store built for Automobiles, Autoparts, Electronics, Home Appliances and More…",
  description: `Mostore is an Online Shopping Store that gives your more value More choice and varieties for less. Shop more out of every products from Automobiles, Autoparts, Electronics to Home Appliances and so much more…. Start Shopping Now…`,

  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    android: [
      {
        url: "/icons/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/icons/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title:
      "MOSTORE | Online Shopping Store built for Automobiles, Autoparts, Electronics, Home Appliances and More…",
    description: `Mostore is an Online Shopping Store that gives your more value More choice and varieties for less. Shop more out of every products from Automobiles, Autoparts, Electronics to Home Appliances and so much more…. Start Shopping Now…`,
    images: [
      {
        url: "/favicon.jpg",
        width: 1200,
        height: 630,
        alt: "MOSTORE Logo",
      },
    ],
    url: "https://mostoreon.com",
    type: "website",
    siteName: "MOStore",
  },
};

export default function UserLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${raleway.variable} font-raleway antialiased bg-white min-h-[calc(100vh-4rem)] flex flex-col`}
      >
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <MessageNotificationProvider>
                  <NavBar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <ChristmasPopup />
                </MessageNotificationProvider>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
