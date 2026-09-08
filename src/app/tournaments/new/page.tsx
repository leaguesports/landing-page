import { CreateTournamentForm } from "@/components/tournaments/CreateTournamentForm";
import { TOURNAMENTS_HREF } from "@/lib/tournaments/tournaments";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New tournament",
  description:
    "Create a single-elimination draft for 4, 8, or 16 teams in padel, golf, or darts.",
  robots: { index: false, follow: false },
};

export default function NewTournamentPage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={TOURNAMENTS_HREF}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Tournaments
        </Link>
        <header className="mt-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Organise
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
            New tournament
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            Draft the event, then open registration and invite captains. You do
            not need to be on a team.
          </p>
        </header>
        <CreateTournamentForm />
      </div>
    </div>
  );
}
