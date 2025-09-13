import Layout from "@/components/Dashboard/Layout";
import { AuthInitializer } from "@/components/AuthInitializer";
import "../../../globals.css";
import { ToastProvider } from "@/lib/toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-raleway antialiased">
        <ToastProvider>
          <AuthInitializer>
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>{children}</Layout>
            </ProtectedRoute>
          </AuthInitializer>
        </ToastProvider>
      </body>
    </html>
  );
}
