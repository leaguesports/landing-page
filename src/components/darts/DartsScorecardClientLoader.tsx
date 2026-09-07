"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#050705] px-6 text-center">
        <p className="max-w-sm text-sm text-zinc-400">
          This game was not found. It may not have been created on the darts
          API, or the share link is stale.
        </p>
        <Link
          href="/darts/new"
          className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950"
        >
          New darts game
        </Link>
      </div>
    );
  }

  return <DartsScorecard key={load.match.id} initialMatch={load.match} />;
}
