"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function VenueHistorySignIn() {
  const pathname = usePathname();
  const { signIn } = useAuth();
  const returnTo = pathname || "/";

  return (
    <div className="space-y-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 sm:px-6 sm:py-7">
      <p className="text-sm leading-relaxed text-zinc-400">
        Sign up or log in to see match history at this venue.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => signIn(returnTo)}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
        >
          Sign up
        </button>
        <button
          type="button"
          onClick={() => signIn(returnTo)}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
