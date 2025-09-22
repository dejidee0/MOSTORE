import Layout from "@/components/supplierDashboard/Layout";
import { AuthInitializer } from "@/components/AuthInitializer";
import "../../../globals.css";
import { ToastProvider } from "@/lib/toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SupplierLayout({ children }) {
  return (
    <ToastProvider>
      <AuthInitializer>
        <ProtectedRoute allowedRoles={["supplier"]}>
          <Layout>{children}</Layout>
        </ProtectedRoute>
      </AuthInitializer>
    </ToastProvider>
  );
}
