import { TeamProfile } from "@/components/teams/TeamProfile";
import { listFriends } from "@/lib/friends/friends";
import { listTeamMatches } from "@/lib/team-matches/team-matches";
import {
  formatMemberCount,
  formatTeamSport,
  getTeam,
} from "@/lib/teams/teams";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type TeamPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const team = await getTeam(id, { cookie });
  if (!team) {
    return {
      title: "Team",
      description: "Team on LeagueSports.",
    };
  }
  return {
    title: team.name,
    description: `${team.name} · ${formatTeamSport(team.sport)} — ${formatMemberCount(team.memberCount)}.`,
  };
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const [team, friends, matches] = await Promise.all([
    getTeam(id, { cookie }),
    listFriends({ cookie }),
    listTeamMatches(id, { cookie }),
  ]);

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Teams
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Team not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This squad may have been removed, or you need to be a member to
            view it.
          </p>
          <Link
            href="/teams"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Back to teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/teams"
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Teams
        </Link>

        <header className="mt-6 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {formatTeamSport(team.sport)}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
            {team.name}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {formatMemberCount(team.memberCount)} · {team.myRole}
          </p>
        </header>

        <div className="mt-8">
          <TeamProfile
            team={team}
            friends={friends.friends}
            matches={matches}
          />
        </div>
      </div>
    </div>
  );
}
