"use client";

import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { PadelScorecard } from "@/components/padel/PadelScorecard";
import { fetchPadelMatch, readCachedMatch } from "@/lib/match-api";
import type { PadelMatch } from "@/types/padel-match";
import { useEffect, useState } from "react";

type LoadState =
  | { status: "ready"; match: PadelMatch }
  | { status: "loading" }
  | { status: "missing" };

/**
 * Resolve match from: SSR prop → localStorage → league-sports-api
 * (same-origin `/api/matches/:id` via the Railway proxy).
 * Live scoring then attaches to Ably on the existing scorecard.
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
      <div className="flex min-h-dvh items-center justify-center bg-[#0c0f0c] px-6 text-center text-sm text-zinc-400">
        Loading match…
      </div>
    );
  }

  if (load.status === "missing") {
    return (
      <div className="min-h-dvh bg-[#0c0f0c] text-white">
        <DeepLinkRecovery
          kind="scorecard"
          objectName="Padel match"
          startHref="/padel/new"
        />
      </div>
    );
  }

  return (
    <>
      <DeepLinkLand pageType="scorecard" sport="padel" slug={matchId} />
      <PadelScorecard key={load.match.id} initialMatch={load.match} />
    </>
  );
}
