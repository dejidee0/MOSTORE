import "../globals.css";
import { ToastProvider } from "@/lib/toast";

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-raleway antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
