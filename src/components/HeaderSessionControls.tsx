"use client";

import NotificationCenter from "@/components/NotificationCenter";
import UserMenu from "@/components/UserMenu";

/**
 * Header auth/session controls. Kept as one client island so the root
 * Navigation shell stays a Server Component and does not itself call
 * useAuth or fetch the friends graph.
 */
export default function HeaderSessionControls() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <NotificationCenter />
      <UserMenu />
    </div>
  );
}
