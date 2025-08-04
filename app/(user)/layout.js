import { Raleway } from "next/font/google";

import "../globals.css";

import NavbarWrapper from "@/components/NavbarWrapper";
import { ToastProvider } from "@/lib/toast";
import Footer from "@/components/shared/Footer";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/lib/cart";
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["400", "500", "600", "700"], // add weights as needed
});

export const metadata = {
  title: "MOSTORE",
  description: "Undergoing construction...",
};

export default function UserLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} font-raleway } antialiased`}>
        <AuthProvider>
          <CartProvider>
            {" "}
            <NavbarWrapper showWishlist={true} />
            <ToastProvider>{children}</ToastProvider>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
