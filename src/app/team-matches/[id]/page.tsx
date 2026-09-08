import { TeamMatchDetail } from "@/components/team-matches/TeamMatchDetail";
import { TEAM_MATCHES_HREF, getTeamMatch } from "@/lib/team-matches/team-matches";
import { getTeam } from "@/lib/teams/teams";
import { isDartsVenue, toDartsVenueOption } from "@/lib/darts/venue-options";
import { isGolfVenue, toGolfVenueOption } from "@/lib/golf/venue-options";
import { isPadelVenue, toVenueOption } from "@/lib/padel/venue-options";
import { searchVenues } from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type TeamMatchPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TeamMatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookie = (await cookies()).toString();
  const match = await getTeamMatch(id, { cookie });
  if (!match) {
    return { title: "Team match" };
  }
  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam?.name ?? "opponent"}`,
    robots: { index: false, follow: false },
  };
}

async function venuesForSport(sport: string): Promise<Array<{ id: string; name: string }>> {
  const venues = await searchVenues({ intent: "play", sportSlug: sport }).catch(
    () => [],
  );
  if (sport === "golf") {
    return venues
      .map(toGolfVenueOption)
      .filter(isGolfVenue)
      .map((venue) => ({ id: venue.id, name: venue.name }));
  }
  if (sport === "darts") {
    return venues
      .map(toDartsVenueOption)
      .filter(isDartsVenue)
      .map((venue) => ({ id: venue.id, name: venue.name }));
  }
  return venues
    .map(toVenueOption)
    .filter(isPadelVenue)
    .map((venue) => ({ id: venue.id, name: venue.name }));
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
    match.awayTeam ? getTeam(match.awayTeam.id, { cookie }) : Promise.resolve(null),
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
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            venues={venues}
          />
        </div>
      </div>
    </div>
  );
}
