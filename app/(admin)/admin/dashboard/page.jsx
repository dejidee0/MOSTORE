"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard/products");
  }, [router]);

  // Optional: loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
    </div>
  );
};

export default Dashboard;
