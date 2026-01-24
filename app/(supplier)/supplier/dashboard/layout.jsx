import Layout from "@/components/supplierDashboard/Layout";
import "../../../globals.css";
import { ToastProvider } from "@/lib/toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import QueryProvider from "@/components/QueryProvider";

export default function SupplierLayout({ children }) {
  return (
    <ToastProvider>
      <QueryProvider>
        <ProtectedRoute allowedRoles={["supplier"]}>
          <Layout>{children}</Layout>
        </ProtectedRoute>
      </QueryProvider>
    </ToastProvider>
  );
}
