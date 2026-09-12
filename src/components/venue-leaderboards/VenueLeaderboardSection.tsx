"use client";

import { useAuth } from "@/hooks/useAuth";
import { parseBoardQuery, parseWindowQuery } from "@/lib/venue-leaderboards/boards";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { VenueLeaderboard } from "./VenueLeaderboard";

export function VenueLeaderboardSection({
  venueId,
  venueName,
  playHref,
  sport,
  initialBoard,
  initialWindow,
}: {
  venueId: string;
  venueName: string;
  playHref: string;
  sport?: string | null;
  initialBoard?: string | null;
  initialWindow?: string | null;
}) {
  const pathname = usePathname();
  const { promptSoftWall } = useAuth();
  const board = parseBoardQuery(initialBoard);
  const windowParam = parseWindowQuery(initialWindow);

  return (
    <section
      id="leaderboards"
      className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Boards
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            Leaderboards
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Locked padel, golf, and darts at {venueName}.
          </p>
        </header>

        <div className="max-w-3xl">
          <Suspense
            fallback={
              <p className="text-sm text-zinc-500">Loading leaderboards…</p>
            }
          >
            <VenueLeaderboard
              venueId={venueId}
              venueName={venueName}
              initialBoard={board}
              initialWindow={windowParam}
              playHref={playHref}
              sport={sport}
              unsignedSlot={
                <div className="space-y-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 sm:px-6 sm:py-7">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Sign in to see records, player of the month, grinders, and
                    streaks at this venue.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      promptSoftWall({
                        reason: "venue_leaderboards",
                        returnTo: pathname || "/",
                        pageType: "venue",
                      })
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
                  >
                    Save to your account
                  </button>
                </div>
              }
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
