"use client";

import dynamic from "next/dynamic";

export const RaceReplay = dynamic(
  () => import("./RaceReplayApp").then((mod) => mod.RaceReplayApp),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[min(78vh,46rem)] min-h-[28rem] w-full animate-pulse rounded-2xl bg-white/5"
        aria-hidden
      />
    ),
  },
);
