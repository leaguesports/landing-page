import { CreateTeamForm } from "@/components/teams/CreateTeamForm";
import { TeamList } from "@/components/teams/TeamList";
import { listTeams } from "@/lib/teams/teams";
import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teams",
  description:
    "Create a competitive squad, invite friends, and share a join link. Team matches come later.",
};

export default async function TeamsPage() {
  const cookie = (await cookies()).toString();
  const snapshot = await listTeams({ cookie });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            Teams
          </p>
          <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            Your squad.{" "}
            <span className="text-emerald-400">One sport.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Competitive teams with a roster, captains, and invite links.
            Matches and tournaments come later.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Your teams
                </p>
                <h2 className="mt-1 font-display text-3xl tracking-wide text-white">
                  Roster
                </h2>
              </div>
              <Link
                href="/teams/new"
                className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                Create
              </Link>
            </div>
            <TeamList
              teams={snapshot.teams}
              pendingInvites={snapshot.pendingInvites}
            />
          </div>

          <div className="lg:col-span-5">
            <CreateTeamForm />
          </div>
        </div>
      </section>
    </div>
  );
}
