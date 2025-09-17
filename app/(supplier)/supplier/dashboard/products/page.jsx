import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import ProductDashboardClient from "./ProductDashboardClient";

export default async function ProductDashboard() {
  // Initialize Supabase server client
  const supabase = createServerSupabaseClient({ req: {} });

  let isApproved = false;
  let initialError = null;

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      initialError = "User not authenticated";
    } else {
      // Check approval status
      const { data, error } = await supabase
        .from("profiles")
        .select("is_approved, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking approval status:", error);
        initialError = "Failed to verify approval status: " + error.message;
      } else {
        // Admins are always approved; suppliers need is_approved = true
        isApproved = data.role === "admin" || data.is_approved === true;
      }
    }
  } catch (error) {
    console.error("Server-side error:", error);
    initialError = "Server error: " + error.message;
  }

  return (
    <ProductDashboardClient
      isApproved={isApproved}
      initialError={initialError}
    />
  );
}
