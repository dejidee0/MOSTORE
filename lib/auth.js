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
