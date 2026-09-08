"use client";

import { useEffect, useState } from "react";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { DartsScorecard } from "@/components/darts/DartsScorecard";
import { fetchDartsMatch } from "@/lib/darts/api-match";
import type { DartsMatch } from "@/types/darts-match";

type LoadState =
  | { status: "ready"; match: DartsMatch }
  | { status: "loading" }
  | { status: "missing" };

export function DartsScorecardClientLoader({
  matchId,
  initialMatch,
}: {
  matchId: string;
  initialMatch: DartsMatch | null;
}) {
  const [load, setLoad] = useState<LoadState>(() =>
    initialMatch
      ? { status: "ready", match: initialMatch }
      : { status: "loading" },
  );

  useEffect(() => {
    if (load.status === "ready") return;

    let cancelled = false;

    fetchDartsMatch(matchId)
      .then((match) => {
        if (cancelled) return;
        setLoad({ status: "ready", match });
      })
      .catch(() => {
        if (cancelled) return;
        setLoad({ status: "missing" });
      });

    return () => {
      cancelled = true;
    };
  }, [matchId, load.status]);

  if (load.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050705] px-6 text-center text-sm text-zinc-400">
        Loading game…
      </div>
    );
  }

  if (load.status === "missing") {
    return (
      <div className="min-h-dvh bg-[#050705] text-white">
        <DeepLinkRecovery
          kind="scorecard"
          objectName="Darts game"
          startHref="/darts/new"
        />
      </div>
    );
  }

  return (
    <>
      <DeepLinkLand pageType="scorecard" sport="darts" slug={matchId} />
      <DartsScorecard key={load.match.id} initialMatch={load.match} />
    </>
  );
}
