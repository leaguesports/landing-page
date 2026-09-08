import { TeamMatchJoin } from "@/components/team-matches/TeamMatchJoin";
import { TEAM_MATCHES_HREF } from "@/lib/team-matches/team-matches";
import { listTeams } from "@/lib/teams/teams";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type JoinTeamMatchPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Join team match | LeagueSports",
  description: "Join a team vs team challenge from a captain link.",
  robots: { index: false, follow: false },
};

export default async function JoinTeamMatchPage({
  params,
}: JoinTeamMatchPageProps) {
  const { token } = await params;
  const cookie = (await cookies()).toString();
  const snapshot = await listTeams({ cookie });

  return (
    <main className="min-h-dvh bg-[#0c0f0c] text-white">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={TEAM_MATCHES_HREF}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Team matches
          </Link>
        </div>
      </div>
      <TeamMatchJoin token={token} teams={snapshot.teams} />
    </main>
  );
}
