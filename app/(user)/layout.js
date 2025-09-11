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
  title: "MOSTORE",
  description: "Undergoing construction...",
  openGraph: {
    title: "MOSTORE",
    description: "Undergoing construction...",
    images: [
      {
        url: "/logo.png", // Path to your logo in the public folder or an external URL
        width: 1200, // Recommended width for OG images
        height: 630, // Recommended height for OG images
        alt: "MOSTORE Logo",
      },
    ],
    url: "https://mostoreon.com", // Replace with your actual website URL
    type: "website",
  },
};

export default function UserLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} font-raleway antialiased`}>
        <AuthProvider>
          <CartProvider>
            <NavBar />
            <ToastProvider>{children}</ToastProvider>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
