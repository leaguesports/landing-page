import { TeamMatchesMine } from "@/components/team-matches/TeamMatchesMine";
import { HUB_ORGANISE_HUB_HREF } from "@/lib/sports/hub-ia";
import {
  listMyTeamMatches,
  TEAM_MATCHES_NEW_HREF,
} from "@/lib/team-matches/team-matches";
import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Team matches",
  description:
    "Upcoming and recent team vs team fixtures. Challenge a squad and start a live scorecard.",
};

export default async function TeamMatchesPage() {
  const cookie = (await cookies()).toString();
  const snapshot = await listMyTeamMatches({ cookie });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href={HUB_ORGANISE_HUB_HREF}
            className="mb-5 inline-block text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Organise
          </Link>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            Team matches
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl">
            Squad vs squad.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Challenge another team in the same sport, set lineups, and start the
            existing padel, golf, or darts scorecard.
          </p>
          <Link
            href={TEAM_MATCHES_NEW_HREF}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            New challenge
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <TeamMatchesMine snapshot={snapshot} />
      </section>
    </div>
  );
}
