"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function VenueHistorySignIn() {
  const pathname = usePathname();
  const { promptSoftWall } = useAuth();
  const returnTo = pathname || "/";

  return (
    <div className="space-y-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 sm:px-6 sm:py-7">
      <p className="text-sm leading-relaxed text-zinc-400">
        Save match history at this venue to your account, or keep browsing as a
        guest.
      </p>
      <button
        type="button"
        onClick={() =>
          promptSoftWall({
            reason: "save_history",
            returnTo,
            pageType: "venue",
          })
        }
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
      >
        Save to your account
      </button>
    </div>
  );
}
