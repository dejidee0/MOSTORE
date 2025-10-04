"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Mail, Phone, Home, CheckCircle2, FileText } from "lucide-react";

import useUserStore from "@/lib/stores/useUserStore";

export default function VendorPendingApproval() {
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
    window.location.href =
      "mailto:support@mostoreon.com?subject=Vendor%20Application%20Status%20Inquiry";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        {/* Clock Icon with animation */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
          <Clock className="h-8 w-8 text-orange-600 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Application Under Review
        </h1>

        {/* Message */}
        <div className="text-gray-600 mb-8 space-y-3">
          <p className="font-medium text-gray-900">
            Thank you for registering as a vendor!
          </p>
          <p className="text-sm">
            Your application is currently being reviewed by our team. This
            process typically takes 1-3 business days.
          </p>
          <p className="text-sm">
            You'll receive an email notification once your account has been
            approved and you can start listing your products.
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 mb-6 text-left border border-orange-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileText size={16} className="text-orange-600" />
            Your Application Details
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Account Type:</strong> Supplier
          </p>
          <p className="text-sm text-gray-600">
            <strong>Application ID:</strong> {user.id.slice(0, 8)}...
          </p>
          <div className="mt-3 pt-3 border-t border-orange-200">
            <p className="text-xs text-orange-600 font-medium">
              Status: Pending Approval
            </p>
          </div>
        </div>

        {/* What's Next */}
        <div className="text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-orange-600" />
            What happens next?
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Our admin team will review your application and verify your
              details
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You'll receive an email notification about your approval status
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Once approved, you can immediately start managing your products
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Check back in 1-3 business days or wait for our email
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <Mail size={18} />
            Contact Support
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home size={18} />
            Sign Out
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Have questions?</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-gray-400">
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
      <div className="mt-8 text-center text-sm text-gray-600 max-w-md space-y-2">
        <p className="font-medium">
          We're excited to have you join our marketplace!
        </p>
        <p className="text-gray-500">
          Our team reviews all vendor applications carefully to ensure quality
          and security for all our users.
        </p>
      </div>
    </div>
  );
}
