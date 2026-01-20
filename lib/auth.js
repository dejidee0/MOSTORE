import { getCurrentUserOrGuest } from "./guestUtils";
import { supabase } from "./supabase-client";

export const sendPasswordResetEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, message: error.message };
  }
};
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
};
export const getCurrentCustomer = async ({ userId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .eq("role", "customer")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
export const getCurrentVendor = async ({ userId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .eq("role", "supplier")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
export const getCurrentAdmin = async ({ userId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .eq("role", "admin")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
