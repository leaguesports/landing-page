"use client";

import { GolfScorecard } from "@/components/golf/GolfScorecard";
import {
  fetchGolfRound,
  parseApiGolfRound,
} from "@/lib/golf/api-round";
import { readCachedGolfRoundSnapshot } from "@/lib/golf/round-store";
import type { GolfRound } from "@/types/golf-round";
import Link from "next/link";
import { useEffect, useState } from "react";

type LoadState =
  | { status: "ready"; round: GolfRound }
  | { status: "loading" }
  | { status: "missing" };

export function GolfScorecardClientLoader({
  roundId,
  initialRound,
}: {
  roundId: string;
  initialRound: GolfRound | null;
}) {
  const [load, setLoad] = useState<LoadState>(() => {
    if (initialRound) return { status: "ready", round: initialRound };
    const cached = readCachedGolfRoundSnapshot(roundId);
    const parsed = parseApiGolfRound(cached);
    return parsed
      ? { status: "ready", round: parsed }
      : { status: "loading" };
  });

  useEffect(() => {
    if (load.status === "ready") return;

    let cancelled = false;

    fetchGolfRound(roundId)
      .then((round) => {
        if (cancelled) return;
        setLoad({ status: "ready", round });
      })
      .catch(() => {
        if (cancelled) return;
        const cached = parseApiGolfRound(
          readCachedGolfRoundSnapshot(roundId),
        );
        setLoad(
          cached
            ? { status: "ready", round: cached }
            : { status: "missing" },
        );
      });

    return () => {
      cancelled = true;
    };
  }, [roundId, load.status]);

  if (load.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050705] px-6 text-center text-sm text-zinc-400">
        Loading round…
      </div>
    );
  }

  if (load.status === "missing") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#050705] px-6 text-center">
        <p className="max-w-sm text-sm text-zinc-400">
          This round was not found. It may not have been created on the golf
          API, or the share link is stale.
        </p>
        <Link
          href="/golf/new"
          className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950"
        >
          New golf round
        </Link>
      </div>
    );
  }

  return <GolfScorecard key={load.round.id} initialRound={load.round} />;
}
