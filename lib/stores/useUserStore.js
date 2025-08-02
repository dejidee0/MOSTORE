import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase-client";

const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      loading: true,
      initialized: false,

      // Actions
      setUser: (user) => set({ user }),

      setSession: (session) => set({ session, user: session?.user || null }),

      setLoading: (loading) => set({ loading }),

      // Initialize auth state and set up listener
      initialize: async () => {
        try {
          // Get initial session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
          }

          set({
            session,
            user: session?.user || null,
            loading: false,
            initialized: true,
          });

          // Set up auth state change listener
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);

            set({
              session,
              user: session?.user || null,
              loading: false, // Always set loading to false when auth state changes
            });

            // Handle different auth events
            switch (event) {
              case "SIGNED_IN":
                console.log("User signed in:", session?.user?.email);
                // Force a slight delay to ensure state is updated
                setTimeout(() => {
                  const currentState = get();
                  console.log("Current state after sign in:", {
                    user: !!currentState.user,
                    loading: currentState.loading,
                    isAuthenticated: currentState.isAuthenticated(),
                  });
                }, 100);
                break;
              case "SIGNED_OUT":
                console.log("User signed out");
                break;
              case "TOKEN_REFRESHED":
                console.log("Token refreshed");
                break;
              case "PASSWORD_RECOVERY":
                console.log("Password recovery initiated");
                break;
            }
          });

          // Store subscription for cleanup
          set({ authSubscription: subscription });
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ loading: false, initialized: true });
        }
      },

      // Sign in with email/password
      signIn: async (email, password) => {
        console.log("Starting sign in process...");
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          console.log("Sign in response:", {
            data: !!data,
            error: error?.message,
          });

          if (error) throw error;

          // Don't set loading to false here - let the auth state change handle it
          return { data, error: null };
        } catch (error) {
          console.error("Sign in error:", error);
          set({ loading: false }); // Only set loading false on error
          return { data: null, error };
        }
      },

      // Sign in with OAuth (Google, etc.)
      signInWithOAuth: async (provider, options = {}) => {
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              ...options,
            },
          });

          if (error) throw error;

          return { data, error: null };
        } catch (error) {
          console.error("OAuth sign in error:", error);
          return { data: null, error };
        } finally {
          set({ loading: false });
        }
      },

      // Sign up with email/password
      signUp: async (email, password, userData = {}) => {
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData,
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) throw error;

          return { data, error: null };
        } catch (error) {
          console.error("Sign up error:", error);
          return { data: null, error };
        } finally {
          set({ loading: false });
        }
      },

      // Sign out
      signOut: async () => {
        set({ loading: true });

        try {
          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({ user: null, session: null });
          return { error: null };
        } catch (error) {
          console.error("Sign out error:", error);
          return { error };
        } finally {
          set({ loading: false });
        }
      },

      // Reset password
      resetPassword: async (email) => {
        set({ loading: true });

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) throw error;

          return { error: null };
        } catch (error) {
          console.error("Password reset error:", error);
          return { error };
        } finally {
          set({ loading: false });
        }
      },

      // Update password
      updatePassword: async (password) => {
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.updateUser({
            password: password,
          });

          if (error) throw error;

          return { data, error: null };
        } catch (error) {
          console.error("Update password error:", error);
          return { data: null, error };
        } finally {
          set({ loading: false });
        }
      },

      // Update user profile
      updateProfile: async (updates) => {
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.updateUser({
            data: updates,
          });

          if (error) throw error;

          return { data, error: null };
        } catch (error) {
          console.error("Update profile error:", error);
          return { data: null, error };
        } finally {
          set({ loading: false });
        }
      },

      // Cleanup function
      cleanup: () => {
        const { authSubscription } = get();
        if (authSubscription) {
          authSubscription.unsubscribe();
        }
      },

      // Computed values
      isAuthenticated: () => {
        const { user } = get();
        return !!user;
      },

      isLoading: () => {
        const { loading } = get();
        return loading;
      },

      getUserEmail: () => {
        const { user } = get();
        return user?.email || null;
      },

      getUserId: () => {
        const { user } = get();
        return user?.id || null;
      },

      getUserMetadata: () => {
        const { user } = get();
        return user?.user_metadata || {};
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        // Only persist user and session, not loading states
        user: state.user,
        session: state.session,
      }),
    }
  )
);

export default useUserStore;
