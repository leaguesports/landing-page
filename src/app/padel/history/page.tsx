import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PadelHistoryClient } from "@/components/padel/PadelHistoryClient";

export const metadata: Metadata = {
  title: "Padel match history | LeagueSports",
  description:
    "Locked padel results. Live and abandoned matches are not history.",
  robots: { index: false, follow: false },
};

export default function PadelHistoryPage() {
  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/padel/new"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← New match
          </Link>
          <span className="font-display text-lg tracking-wide text-white">
            LEAGUE<span className="text-[var(--color-brand)]">SPORTS</span>
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          History
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Locked padel matches
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Date, venue, opponents, and score. Only ended matches appear here —
          if the result was not locked, it did not happen.
        </p>
        <Suspense
          fallback={
            <p className="text-sm text-zinc-500">Loading locked matches…</p>
          }
        >
          <PadelHistoryClient />
        </Suspense>
        <Link
          href="/padel/new"
          className="inline-flex min-h-12 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Play a match
        </Link>
      </div>
    </main>
  );
}
