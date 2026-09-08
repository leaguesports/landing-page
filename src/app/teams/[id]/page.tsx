import { TeamProfile } from "@/components/teams/TeamProfile";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { missingObjectOgTitle } from "@/lib/conversion/deep-links";
import { listFriends } from "@/lib/friends/friends";
import { listTeamMatches } from "@/lib/team-matches/team-matches";
import { listTeamTournaments } from "@/lib/tournaments/tournaments";
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
      title: missingObjectOgTitle("team", id),
      robots: { index: false, follow: false },
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
  const [team, friends, matches, tournaments] = await Promise.all([
    getTeam(id, { cookie }),
    listFriends({ cookie }),
    listTeamMatches(id, { cookie }),
    listTeamTournaments(id, { cookie }),
  ]);

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <DeepLinkRecovery kind="team" objectName={id} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <DeepLinkLand pageType="team" slug={team.id} />
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
            tournaments={tournaments}
          />
        </div>
      </div>
    </div>
  );
}
