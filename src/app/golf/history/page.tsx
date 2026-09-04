import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { GolfHistoryClient } from "@/components/golf/GolfHistoryClient";
import { GolfHistoryList } from "@/components/golf/GolfHistoryList";
import { lookupPlayerGolfHistory } from "@/lib/golf/lookup-history";

export const metadata: Metadata = {
  title: "Golf round history | LeagueSports",
  description:
    "Locked golf rounds. Live and abandoned rounds are not history.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ playerUserId?: string | string[] }>;
};

export default async function GolfHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.playerUserId;
  const sharedId = (Array.isArray(raw) ? raw[0] : raw)?.trim() || "";
  const shared = sharedId
    ? await lookupPlayerGolfHistory(sharedId, {
        cookie: (await cookies()).toString(),
      })
    : null;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/golf/new"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← New round
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
          Locked golf rounds
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Date, course, players, and score. Only locked rounds appear here —
          if the result was not locked, it did not happen.
        </p>
        {shared ? (
          shared.error ? (
            <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {shared.error}
            </p>
          ) : shared.items.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No locked rounds yet for this player. Finish a live scorecard to
              write the first result.
            </p>
          ) : (
            <GolfHistoryList items={shared.items} />
          )
        ) : (
          <Suspense
            fallback={
              <p className="text-sm text-zinc-500">Loading locked rounds…</p>
            }
          >
            <GolfHistoryClient />
          </Suspense>
        )}
        <Link
          href="/golf/new"
          className="inline-flex min-h-12 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Play a round
        </Link>
      </div>
    </main>
  );
}
