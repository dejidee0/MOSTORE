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
    "MOStore |  Online Shopping Store That Gives You More Value, More Quality, More Choice, More Variety And More More Than a Store, Get more out of every store",
  description: `Online Shopping Built For Used and New For Household Equipments, Electronics, Phones, Computers, Autoparts And Accessories, Automobiles And More..`,
  openGraph: {
    title:
      "MOStore |  Online Shopping Store That Gives You More Value, More Quality, More Choice, More Variety And More More Than a Store, Get more out of every store",
    description: `Online Shopping Built For Used and New For Household Equipments, Electronics, Phones, Computers, Autoparts And Accessories, Automobiles And More..`,
    images: [
      {
        url: "/logo-black.png",
        width: 1200,
        height: 630,
        alt: "MOSTORE Logo",
      },
    ],
    url: "https://mostoreon.com",
    type: "website",
  },
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
