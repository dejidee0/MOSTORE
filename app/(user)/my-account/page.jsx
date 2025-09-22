import { Suspense } from "react";
import MyProfileClient from "./MyProfileClient"; // Adjust path as needed
import { LoadingSpinner } from "./MyProfileClient"; // Adjust path as needed

export default function MyAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      }
    >
      <MyProfileClient />
    </Suspense>
  );
}
