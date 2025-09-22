import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase-client";
import debounce from "lodash.debounce";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      initialized: false,

      setUser: (user) => {
        console.log("Setting user in store:", user);
        set({ user });
      },

      setSession: (session) => set({ session, user: session?.user || null }),

      setLoading: (loading) => set({ loading }),

      initialize: async () => {
        try {
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

          const debouncedHandleAuthChange = debounce((event, session) => {
            console.log("Auth state changed:", event, session);
            set({
              session,
              user: session?.user || null,
              loading: false,
            });

            if (event === "SIGNED_IN" && typeof window !== "undefined") {
              const role = session?.user?.user_metadata?.role || "customer";
              const currentPath = window.location.pathname;
              const validPaths = {
                admin: ["/admin/dashboard", "/admin/dashboard/"],
                supplier: [
                  "/supplier/dashboard/products",
                  "/supplier/dashboard/products",
                ],
                customer: ["/"],
              };
              const isValidPath = validPaths[role].some((path) =>
                currentPath.startsWith(path)
              );
              if (!isValidPath) {
                const redirectTo = {
                  admin: "/admin/dashboard/products",
                  supplier: "/supplier/dashboard/products",
                  customer: "/",
                }[role];
                window.location.href = redirectTo;
              }
            }
          }, 300);

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(debouncedHandleAuthChange);

          set({ authSubscription: subscription });
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ loading: false, initialized: true });
        }
      },

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
          return { data, error: null };
        } catch (error) {
          console.error("Sign in error:", error);
          set({ loading: false });
          return { data: null, error };
        }
      },

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

      cleanup: () => {
        const { authSubscription } = get();
        if (authSubscription) {
          authSubscription.unsubscribe();
        }
      },

      isAuthenticated: () => !!get().user,
      isLoading: () => get().loading,
      getUserEmail: () => get().user?.email || null,
      getUserId: () => get().user?.id || null,
      getUserMetadata: () => get().user?.user_metadata || {},
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

export default useUserStore;
