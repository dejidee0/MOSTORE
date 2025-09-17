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
                supplier: ["/supplier/dashboard", "/supplier/dashboard/"],
                customer: ["/"],
              };
              const isValidPath = validPaths[role].some((path) =>
                currentPath.startsWith(path)
              );
              if (!isValidPath) {
                const redirectTo = {
                  admin: "/admin/dashboard",
                  supplier: "/supplier/dashboard",
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

      // Rest of the actions (signIn, signUp, signOut, etc.) remain unchanged...

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
