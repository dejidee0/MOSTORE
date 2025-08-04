import Layout from "@/components/Dashboard/Layout";
import { AuthInitializer } from "@/components/AuthInitializer";
import { AdminProtectionWrapper } from "@/components/ProtectionWrapper";
import "../globals.css";
import { ToastProvider } from "@/lib/toast";

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-raleway antialiased">
        <ToastProvider>
          <AuthInitializer>
            <AdminProtectionWrapper>
              <Layout>{children}</Layout>
            </AdminProtectionWrapper>
          </AuthInitializer>
        </ToastProvider>
      </body>
    </html>
  );
}
