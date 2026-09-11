import { TournamentsMine } from "@/components/tournaments/TournamentsMine";
import { HUB_PLAY_HREF } from "@/lib/sports/hub-ia";
import {
  TOURNAMENTS_NEW_HREF,
  listMyTournaments,
} from "@/lib/tournaments/tournaments";
import { Medal } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tournaments",
  description:
    "Single-elimination team tournaments. Organise a 4, 8, or 16 draw and start fixtures as team matches.",
};

export default async function TournamentsPage() {
  const cookie = (await cookies()).toString();
  const snapshot = await listMyTournaments({ cookie });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href={HUB_PLAY_HREF}
            className="mb-5 block w-fit text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Play
          </Link>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Medal className="h-3.5 w-3.5" aria-hidden />
            Tournaments
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl">
            One draw. One winner.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Single-elimination for 4, 8, or 16 teams in one sport. Captains
            register, you generate the bracket, and each tie is a team match.
          </p>
          <Link
            href={TOURNAMENTS_NEW_HREF}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            New tournament
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <TournamentsMine snapshot={snapshot} />
      </section>
    </div>
  );
}
