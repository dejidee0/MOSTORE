"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, Phone, Home } from "lucide-react";

import useUserStore from "@/lib/stores/useUserStore";

export default function AccountDisabled() {
  const router = useRouter();
  const { user, signOut } = useUserStore();

  useEffect(() => {
    // If no user is logged in, redirect to sign in
    if (!user) {
      router.push("/sign-in");
    }
  }, [user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleContactSupport = () => {
    // You can customize this based on your support system
    window.location.href =
      "mailto:support@yourcompany.com?subject=Account%20Disabled%20-%20Please%20Help";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Account Disabled
        </h1>

        {/* Message */}
        <div className="text-gray-600 mb-8 space-y-3">
          <p>
            Your account has been temporarily disabled by our administrators.
          </p>
          <p className="text-sm">
            This may be due to a violation of our terms of service, suspicious
            activity, or other policy concerns.
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Account Details:</h3>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Role:</strong> {user.user_metadata?.role || "Customer"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Account ID:</strong> {user.id.slice(0, 8)}...
          </p>
        </div>

        {/* Next Steps */}
        <div className="text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">What can you do?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Contact our support team to understand why your account was
              disabled
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Provide any additional information that might help resolve the
              issue
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Wait for the review process to complete
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Mail size={18} />
            Contact Support
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home size={18} />
            Sign Out & Go Home
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Need immediate help?</p>
          <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Mail size={12} />
              support@yourcompany.com
            </div>
            <div className="flex items-center gap-1">
              <Phone size={12} />
              +1 (555) 123-4567
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500 max-w-md">
        This action was taken to protect our platform and community. We
        appreciate your understanding and cooperation.
      </p>
    </div>
  );
}
