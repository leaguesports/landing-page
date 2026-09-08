import { TournamentJoin } from "@/components/tournaments/TournamentJoin";
import { listTeams } from "@/lib/teams/teams";
import { TOURNAMENTS_HREF } from "@/lib/tournaments/tournaments";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type JoinTournamentPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Join tournament | LeagueSports",
  description: "Register a team for a single-elimination tournament from an invite link.",
  robots: { index: false, follow: false },
};

export default async function JoinTournamentPage({
  params,
}: JoinTournamentPageProps) {
  const { token } = await params;
  const cookie = (await cookies()).toString();
  const snapshot = await listTeams({ cookie });

  return (
    <main className="min-h-dvh bg-[#0c0f0c] text-white">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link
            href={TOURNAMENTS_HREF}
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Tournaments
          </Link>
        </div>
      </div>
      <TournamentJoin token={token} teams={snapshot.teams} />
    </main>
  );
}
