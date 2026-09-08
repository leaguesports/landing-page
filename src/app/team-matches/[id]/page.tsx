import { TeamMatchDetail } from "@/components/team-matches/TeamMatchDetail";
import { isDartsSportLabel } from "@/lib/darts/venue-options";
import { hasPlayableGolfCourse } from "@/lib/golf/course";
import { isPadelSportLabel } from "@/lib/padel/venue-options";
import {
  TEAM_MATCH_VENUE_LIMIT,
  TEAM_MATCHES_HREF,
  getTeamMatch,
  type PublicUser,
} from "@/lib/team-matches/team-matches";
import { getTeam, type PublicTeam } from "@/lib/teams/teams";
import { searchVenues, type Venue } from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type TeamMatchPageProps = {
  params: Promise<{ id: string }>;
};

function venueSportLabels(venue: Venue): string[] {
  const labels = (venue.sports ?? []).flatMap((sport) => [
    sport.name,
    sport.slug ?? "",
  ]);
  return [...new Set(labels.map((s) => s.trim().toLowerCase()).filter(Boolean))];
}

function activeMembers(team: PublicTeam | null): PublicUser[] {
  if (!team) return [];
  return team.members
    .filter((member) => member.status === "active")
    .map((member) => ({
      id: member.id,
      displayName: member.displayName,
      handle: member.handle,
      avatarUrl: member.avatarUrl,
    }));
}

async function venuesForSport(
  sport: string,
): Promise<Array<{ id: string; name: string }>> {
  const venues = await searchVenues({ intent: "play", sportSlug: sport }).catch(
    () => [],
  );
  const filtered = venues.filter((venue) => {
    if (sport === "golf") return hasPlayableGolfCourse(venue.golfCourse);
    const labels = venueSportLabels(venue);
    if (sport === "darts") return labels.some(isDartsSportLabel);
    return labels.some(isPadelSportLabel);
  });
  return filtered.slice(0, TEAM_MATCH_VENUE_LIMIT).map((venue) => ({
    id: venue._id,
    name: venue.name,
  }));
}

export async function generateMetadata({
  params,
}: TeamMatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const match = await getTeamMatch(id, { cookie });
  return {
    title: match
      ? `${match.homeTeam.name} vs ${match.awayTeam?.name ?? "opponent"}`
      : "Team match",
    robots: { index: false, follow: false },
  };
}

export default async function TeamMatchPage({ params }: TeamMatchPageProps) {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const match = await getTeamMatch(id, { cookie });

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Team matches
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
            Match not found
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            This fixture may have been removed, or you need to be on one of the
            teams to view it.
          </p>
          <Link
            href={TEAM_MATCHES_HREF}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            Back to team matches
          </Link>
        </div>
      </div>
    );
  }

  const [homeTeam, awayTeam, venues] = await Promise.all([
    getTeam(match.homeTeam.id, { cookie }),
    match.awayTeam
      ? getTeam(match.awayTeam.id, { cookie })
      : Promise.resolve(null),
    venuesForSport(match.sport),
  ]);

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={TEAM_MATCHES_HREF}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Team matches
        </Link>
        <div className="mt-6">
          <TeamMatchDetail
            match={match}
            homeMembers={activeMembers(homeTeam)}
            awayMembers={activeMembers(awayTeam)}
            venues={venues}
          />
        </div>
      </div>
    </div>
  );
}
