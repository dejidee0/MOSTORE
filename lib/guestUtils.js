// Guest User Identification Utility
// Manages guest users for blog interactions when not logged in

const GUEST_ID_KEY = "blog_guest_id";
const GUEST_NAME_KEY = "blog_guest_name";
const GUEST_EMAIL_KEY = "blog_guest_email";

/**
 * Get or create a guest ID for anonymous users
 */
export const getGuestId = () => {
  if (typeof window === "undefined") return null;

  let guestId = localStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    // Generate a UUID v4
    guestId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    localStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
};

/**
 * Save guest user information
 */
export const saveGuestInfo = (name, email) => {
  if (typeof window === "undefined") return;

  if (name) localStorage.setItem(GUEST_NAME_KEY, name);
  if (email) localStorage.setItem(GUEST_EMAIL_KEY, email);
};

/**
 * Get saved guest information
 */
export const getGuestInfo = () => {
  if (typeof window === "undefined") return { name: "", email: "" };

  return {
    name: localStorage.getItem(GUEST_NAME_KEY) || "",
    email: localStorage.getItem(GUEST_EMAIL_KEY) || "",
  };
};

/**
 * Clear guest information (useful for logout or privacy)
 */
export const clearGuestInfo = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(GUEST_NAME_KEY);
  localStorage.removeItem(GUEST_EMAIL_KEY);
  // Keep guest_id for consistency across sessions
};

/**
 * Check if user is authenticated via Supabase
 */
export const isAuthenticated = async (supabase) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
};

/**
 * Get current user or guest identification
 */
export const getCurrentUserOrGuest = async (supabase) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      isGuest: false,
      userId: user.id,
      guestId: null,
      email: user.email,
      name:
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    };
  }

  const guestInfo = getGuestInfo();
  return {
    isGuest: true,
    userId: null,
    guestId: getGuestId(),
    email: guestInfo.email,
    name: guestInfo.name || "Guest",
  };
};
