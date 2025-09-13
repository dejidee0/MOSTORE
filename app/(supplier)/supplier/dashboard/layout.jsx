import Layout from "@/components/supplierDashboard/Layout";
import { AuthInitializer } from "@/components/AuthInitializer";
import "../../../globals.css";
import { ToastProvider } from "@/lib/toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SupplierLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-raleway antialiased">
        <ToastProvider>
          <AuthInitializer>
            <ProtectedRoute allowedRoles={["supplier"]}>
              <Layout>{children}</Layout>
            </ProtectedRoute>
          </AuthInitializer>
        </ToastProvider>
      </body>
    </html>
  );
}
