import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { DartsHistoryClient } from "@/components/darts/DartsHistoryClient";
import { DartsHistoryList } from "@/components/darts/DartsHistoryList";
import { lookupPlayerDartsHistory } from "@/lib/darts/lookup-history";

export const metadata: Metadata = {
  title: "Darts game history | LeagueSports",
  description:
    "Locked 501 darts games. Live and abandoned games are not history.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ playerUserId?: string | string[] }>;
};

export default async function DartsHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.playerUserId;
  const sharedId = (Array.isArray(raw) ? raw[0] : raw)?.trim() || "";
  const shared = sharedId
    ? await lookupPlayerDartsHistory(sharedId, {
        cookie: (await cookies()).toString(),
      })
    : null;

  return (
    <main className="min-h-dvh bg-[#0c0f0c]">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center">
          <Link
            href="/darts/new"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← New game
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          History
        </p>
        <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Locked darts games
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Remainings, players, and checkout. Only locked 501 games appear
          here — if the result was not checked out, it did not happen.
        </p>
        {shared ? (
          shared.error ? (
            <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {shared.error}
            </p>
          ) : shared.items.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No locked games yet for this player. Finish a live scorecard to
              write the first result.
            </p>
          ) : (
            <DartsHistoryList
              items={shared.items}
              playerUserId={sharedId}
            />
          )
        ) : (
          <Suspense
            fallback={
              <p className="text-sm text-zinc-500">Loading locked games…</p>
            }
          >
            <DartsHistoryClient />
          </Suspense>
        )}
        <Link
          href="/darts/new"
          className="inline-flex min-h-12 items-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Play a game
        </Link>
      </div>
    </main>
  );
}
