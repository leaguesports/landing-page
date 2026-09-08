import { ChallengeForm } from "@/components/team-matches/ChallengeForm";
import { TEAM_MATCHES_HREF } from "@/lib/team-matches/team-matches";
import { listTeams } from "@/lib/teams/teams";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New team challenge",
  description:
    "Challenge another same-sport team, or share a captain link they can join.",
  robots: { index: false, follow: false },
};

export default async function NewTeamMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.teamId;
  const initialTeamId = Array.isArray(raw) ? raw[0] : raw;
  const cookie = (await cookies()).toString();
  const snapshot = await listTeams({ cookie });

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={TEAM_MATCHES_HREF}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Team matches
        </Link>
        <header className="mt-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Challenge
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
            New team match
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            Pick an opponent of the same sport, or create a captain link for
            them to join.
          </p>
        </header>
        <ChallengeForm
          teams={snapshot.teams}
          initialTeamId={initialTeamId}
        />
      </div>
    </div>
  );
}
