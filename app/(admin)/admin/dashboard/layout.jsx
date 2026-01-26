import Layout from "@/components/Dashboard/Layout";
import { AuthInitializer } from "@/components/AuthInitializer";
import "../../../globals.css";
import { ToastProvider } from "@/lib/toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import QueryProvider from "@/components/QueryProvider";

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-raleway antialiased">
        <ToastProvider>
          <QueryProvider>
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>{children}</Layout>
            </ProtectedRoute>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
