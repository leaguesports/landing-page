"use client";

import { PadelScorecard } from "@/components/padel/PadelScorecard";
import { readCachedMatch } from "@/lib/match-api";
import type { PadelMatch } from "@/types/padel-match";
import { useState } from "react";
import Link from "next/link";

/**
 * Client fallback when server store misses (e.g. multi-instance deploys
 * before the main DB API is wired). Uses localStorage cache from Start Match.
 */
export function PadelScorecardClientLoader({
  matchId,
  initialMatch,
}: {
  matchId: string;
  initialMatch: PadelMatch | null;
}) {
  const [match] = useState<PadelMatch | null>(
    () => initialMatch ?? readCachedMatch(matchId),
  );

  if (!match) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#050705] px-6 text-center">
        <p className="text-sm text-zinc-400">
          Match not found. Start a new one from Quick-Start.
        </p>
        <Link
          href="/padel/new"
          className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950"
        >
          New padel match
        </Link>
      </div>
    );
  }

  return <PadelScorecard key={match.id} initialMatch={match} />;
}
