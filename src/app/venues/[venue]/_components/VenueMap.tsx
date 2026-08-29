"use client";

import dynamic from "next/dynamic";

export const VenueMap = dynamic(
  () => import("./VenueMapCanvas").then((mod) => mod.VenueMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-56 w-full animate-pulse rounded-2xl bg-white/5 sm:h-64"
        aria-hidden
      />
    ),
  },
);
