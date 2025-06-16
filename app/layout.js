import { Raleway } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${raleway.variable} font-raleway } antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
