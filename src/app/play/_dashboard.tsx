import { PlayHubChrome } from "@/components/play/PlayHubChrome";
import { PlaySportDashboard } from "@/components/play/PlaySportDashboard";
import { getTopGuides } from "@/app/guides/[[...route]]/actions";
import {
  emptyOrganisedGamesSnapshot,
  listMyOrganisedGames,
} from "@/lib/organised-games/organised-games";
import {
  PLAY_DASHBOARD_CLUBS_FETCH_LIMIT,
  filterOrganisedGamesForSport,
  pickPlayDashboardClubs,
  playDashboardClubsExploreHref,
  playDashboardGuides,
  toPlayDashboardClub,
} from "@/lib/play/play-dashboard";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import { isHubPlayDashboardSport } from "@/lib/sports/hub-ia";
import { venuePhotoUrl } from "@/lib/venues/photo";
import { searchVenues } from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export function playDashboardMetadata(slug: string): Metadata {
  const sport = SPORT_CATALOG.find((item) => item.slug === slug);
  const noun = sport?.noun ?? "court";
  return {
    title: sport ? `Play ${sport.name}` : "Play",
    description: sport
      ? `Book a ${noun}, find a match, compete, and browse ${sport.name.toLowerCase()} clubs.`
      : "Pick a sport to play.",
    robots: { index: false, follow: false },
  };
}

export async function PlayDashboardPage({ slug }: { slug: string }) {
  if (!isHubPlayDashboardSport(slug)) notFound();
  const sport = SPORT_CATALOG.find((item) => item.slug === slug);
  if (!sport) notFound();

  const cookiePromise = cookies().then((store) => store.toString());
  const [venues, guides, organised] = await Promise.all([
    searchVenues({
      intent: "play",
      sportSlug: sport.slug,
      limit: PLAY_DASHBOARD_CLUBS_FETCH_LIMIT,
    }).catch(() => []),
    getTopGuides(8).catch(() => []),
    cookiePromise
      .then((cookie) => listMyOrganisedGames({ cookie }))
      .catch(() => emptyOrganisedGamesSnapshot()),
  ]);

  const clubs = pickPlayDashboardClubs(venues).map((venue) =>
    toPlayDashboardClub(venue, venuePhotoUrl(venue, { width: 800, height: 480 })),
  );
  const sportOrganised = filterOrganisedGamesForSport(organised, sport.slug);

  return (
    <PlayHubChrome>
      <PlaySportDashboard
        sport={sport}
        clubs={clubs}
        clubsExploreHref={playDashboardClubsExploreHref(sport.slug)}
        guides={playDashboardGuides(guides, sport.slug)}
        organisedGames={sportOrganised}
        nowIso={new Date().toISOString()}
      />
    </PlayHubChrome>
  );
}
