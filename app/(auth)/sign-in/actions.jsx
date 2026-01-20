"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Server action for user sign in
 * @param {FormData} formData - The form data containing email and password
 * @returns {Promise<{success: boolean, error?: string, redirectTo?: string}>}
 */
export async function signInAction(formData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");
    const rememberMe = formData.get("rememberMe") === "true";

    // Validation
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required.",
      };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    // Password length validation
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long.",
      };
    }

    const supabase = await createClient();

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return {
          success: false,
          error: "Invalid email or password. Please try again.",
        };
      }

      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          error: "Please verify your email address before signing in.",
        };
      }

      if (error.message.includes("too many requests")) {
        return {
          success: false,
          error: "Too many login attempts. Please try again later.",
        };
      }

      return {
        success: false,
        error: error.message || "Sign-in failed. Please try again.",
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Sign-in failed. Please try again.",
      };
    }

    // Set session duration based on rememberMe
    if (rememberMe) {
      // Set a longer session (30 days)
      const cookieStore = await cookies();
      cookieStore.set("remember_me", "true", {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // Get user role to determine redirect
    const role = data.user.user_metadata?.role;
    let redirectTo = "/";

    if (role === "admin") {
      redirectTo = "/";
    } else if (role === "supplier" || role === "vendor") {
      redirectTo = "/";
    } else if (role === "customer") {
      redirectTo = "/";
    }

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server action for OAuth sign in
 * @param {string} provider - The OAuth provider (google, github, etc.)
 * @returns {Promise<{success: boolean, error?: string, url?: string}>}
 */
export async function signInWithOAuthAction(provider) {
  try {
    if (!provider) {
      return {
        success: false,
        error: "Provider is required.",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("OAuth sign in error:", error);
      return {
        success: false,
        error: error.message || "OAuth sign-in failed. Please try again.",
      };
    }

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    console.error("Unexpected OAuth sign in error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server action to check if user is authenticated
 * @returns {Promise<{isAuthenticated: boolean, user: object | null, role: string | null}>}
 */
export async function checkAuthStatus() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        isAuthenticated: false,
        user: null,
        role: null,
      };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      },
      role: user.user_metadata?.role || null,
    };
  } catch (error) {
    console.error("Auth status check error:", error);
    return {
      isAuthenticated: false,
      user: null,
      role: null,
    };
  }
}

/**
 * Server action to sign out user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOutAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return {
        success: false,
        error: error.message || "Sign-out failed. Please try again.",
      };
    }

    // Clear remember me cookie
    const cookieStore = await cookies();
    cookieStore.delete("remember_me");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server action to resend verification email
 * @param {string} email - The user's email address
 * @returns {Promise<{success: boolean, error?: string, message?: string}>}
 */
export async function resendVerificationEmail(email) {
  try {
    if (!email) {
      return {
        success: false,
        error: "Email is required.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        error: error.message || "Failed to resend verification email.",
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    };
  } catch (error) {
    console.error("Unexpected resend verification error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server action to initiate password reset
 * @param {string} email - The user's email address
 * @returns {Promise<{success: boolean, error?: string, message?: string}>}
 */
export async function requestPasswordReset(email) {
  try {
    if (!email) {
      return {
        success: false,
        error: "Email is required.",
      };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error("Password reset request error:", error);
      return {
        success: false,
        error: error.message || "Failed to send password reset email.",
      };
    }

    return {
      success: true,
      message:
        "Password reset email sent successfully. Please check your inbox.",
    };
  } catch (error) {
    console.error("Unexpected password reset error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Rate limiting helper (basic implementation)
 * In production, use a proper rate limiting solution like Redis
 */
const loginAttempts = new Map();

export async function checkRateLimit(email) {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];

  // Remove attempts older than 15 minutes
  const recentAttempts = attempts.filter(
    (timestamp) => now - timestamp < 15 * 60 * 1000,
  );

  if (recentAttempts.length >= 5) {
    return {
      allowed: false,
      error: "Too many login attempts. Please try again in 15 minutes.",
    };
  }

  recentAttempts.push(now);
  loginAttempts.set(email, recentAttempts);

  return { allowed: true };
}
