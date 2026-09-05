"use client";

/**
 * Shared session hook — backed by AppSessionProvider in the root layout so
 * Navigation (NotificationCenter + UserMenu) and page islands share one
 * /api/auth/me round-trip.
 */
export {
  useAuth,
  type AuthContextValue,
} from "@/components/providers/AppSessionProvider";
