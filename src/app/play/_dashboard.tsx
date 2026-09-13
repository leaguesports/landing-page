import { PlayHubChrome } from "@/components/play/PlayHubChrome";
import { PlaySportDashboard } from "@/components/play/PlaySportDashboard";
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

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

async function loadPlayDashboardClubs(sportSlug: string) {
  if (!isSanityConfigured()) return [];
  const [{ searchVenues }, { venuePhotoUrl }] = await Promise.all([
    import("@/services/venues"),
    import("@/lib/venues/photo"),
  ]);
  const venues = await searchVenues({
    intent: "play",
    sportSlug,
    limit: PLAY_DASHBOARD_CLUBS_FETCH_LIMIT,
  }).catch(() => []);
  return pickPlayDashboardClubs(venues).map((venue) =>
    toPlayDashboardClub(
      venue,
      venuePhotoUrl(venue, { width: 800, height: 480 }),
    ),
  );
}

async function loadPlayDashboardGuides(sportSlug: string) {
  if (!isSanityConfigured()) return [];
  const { getTopGuides } = await import("@/app/guides/[[...route]]/actions");
  const guides = await getTopGuides(8).catch(() => []);
  return playDashboardGuides(guides, sportSlug);
}

export async function PlayDashboardPage({ slug }: { slug: string }) {
  if (!isHubPlayDashboardSport(slug)) notFound();
  const sport = SPORT_CATALOG.find((item) => item.slug === slug);
  if (!sport) notFound();

  const cookiePromise = cookies().then((store) => store.toString());
  const [clubs, guides, organised] = await Promise.all([
    loadPlayDashboardClubs(sport.slug).catch(() => []),
    loadPlayDashboardGuides(sport.slug).catch(() => []),
    cookiePromise
      .then((cookie) => listMyOrganisedGames({ cookie }))
      .catch(() => emptyOrganisedGamesSnapshot()),
  ]);
  const sportOrganised = filterOrganisedGamesForSport(organised, sport.slug);

  return (
    <PlayHubChrome>
      <PlaySportDashboard
        sport={sport}
        clubs={clubs}
        clubsExploreHref={playDashboardClubsExploreHref(sport.slug)}
        guides={guides}
        organisedGames={sportOrganised}
        nowIso={new Date().toISOString()}
      />
    </PlayHubChrome>
  );
}
