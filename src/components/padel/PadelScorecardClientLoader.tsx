"use client";

import { PadelScorecard } from "@/components/padel/PadelScorecard";
import { fetchPadelMatch, readCachedMatch } from "@/lib/match-api";
import type { PadelMatch } from "@/types/padel-match";
import Link from "next/link";
import { useEffect, useState } from "react";

type LoadState =
  | { status: "ready"; match: PadelMatch }
  | { status: "loading" }
  | { status: "missing" };

/**
 * Resolve match from: SSR prop → localStorage → league-sports-api
 * (same-origin `/api/matches/:id`, with Ably live state when present).
 */
export function PadelScorecardClientLoader({
  matchId,
  initialMatch,
}: {
  matchId: string;
  initialMatch: PadelMatch | null;
}) {
  const [load, setLoad] = useState<LoadState>(() => {
    const local = initialMatch ?? readCachedMatch(matchId);
    return local ? { status: "ready", match: local } : { status: "loading" };
  });

  useEffect(() => {
    if (load.status === "ready") return;

    let cancelled = false;

    fetchPadelMatch(matchId)
      .then((match) => {
        if (cancelled) return;
        setLoad({ status: "ready", match });
      })
      .catch(() => {
        if (cancelled) return;
        const cached = readCachedMatch(matchId);
        setLoad(
          cached
            ? { status: "ready", match: cached }
            : { status: "missing" },
        );
      });

    return () => {
      cancelled = true;
    };
  }, [matchId, load.status]);

  if (load.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050705] px-6 text-center text-sm text-zinc-400">
        Loading match…
      </div>
    );
  }

  if (load.status === "missing") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#050705] px-6 text-center">
        <p className="max-w-sm text-sm text-zinc-400">
          This match was not found. It may not have been created on the match
          API, or the share link is stale.
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

  return <PadelScorecard key={load.match.id} initialMatch={load.match} />;
}
