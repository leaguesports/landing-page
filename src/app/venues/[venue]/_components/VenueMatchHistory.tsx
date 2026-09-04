"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function VenueMatchHistory({ venueName }: { venueName: string }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const returnTo = pathname || "/";

  return (
    <section
      id="match-history"
      className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Results
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            Match history
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Locked results at {venueName}.
          </p>
        </header>

        <div className="max-w-3xl">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Checking your account…</p>
          ) : !isAuthenticated ? (
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
          ) : (
            <div className="rounded-3xl border border-dashed border-white/12 bg-[#141814] px-5 py-6 text-sm leading-relaxed text-zinc-400">
              No matches at this venue yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
