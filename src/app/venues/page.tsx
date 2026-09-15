import type { Metadata } from "next";
import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";
import { CITY_DIRECTORY } from "@/data/cities";
import {
  resolveVenuesLanding,
  venuesLandingMetadata,
} from "@/lib/search/venueSearch";
import {
  VENUE_HUB_FIXTURE_FETCH_LIMIT,
  buildOnNowCards,
  filterHubEventTiles,
  resolveRecommendedCity,
  venueHubDirectoryLinks,
} from "@/lib/venues/hub";
import { getUpcomingFixtures } from "@/services/events";
import { getRecommendedVenues } from "@/services/venueHub";
import { VenueHubFavouritesSlot } from "./_components/VenueHubFavouritesSlot";
import { VenueNameSearch } from "./_components/VenueNameSearch";
import {
  VenueHubDirectories,
  VenueHubEventTiles,
  VenueHubOnNow,
  VenueHubRecommended,
} from "./_components/VenueHubSections";

type VenuesSearchParams = {
  intent?: string | string[];
  sport?: string | string[];
  location?: string | string[];
  q?: string | string[];
};

function cityDisplayName(slug: string | null): string | null {
  if (!slug) return null;
  const city = CITY_DIRECTORY.find((item) => item.slug === slug);
  if (city) return city.name;
  for (const item of CITY_DIRECTORY) {
    const suburb = item.suburbs.find((row) => row.slug === slug);
    if (suburb) return suburb.name;
  }
  return slug.replace(/-/g, " ");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<VenuesSearchParams>;
}): Promise<Metadata> {
  const landing = resolveVenuesLanding(await searchParams);
  if (landing.redirectTo) permanentRedirect(landing.redirectTo);
  const seo = venuesLandingMetadata(landing);
  return {
    title: seo.title,
    description: seo.description,
    ...(seo.canonical
      ? {
          alternates: { canonical: seo.canonical },
          robots: { index: false },
        }
      : {}),
  };
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<VenuesSearchParams>;
}) {
  const landing = resolveVenuesLanding(await searchParams);
  if (landing.redirectTo) permanentRedirect(landing.redirectTo);

  const filters = landing.filters;
  const citySlug = resolveRecommendedCity({
    locationSlug: filters.locationSlug,
    citySlug: filters.citySlug,
  });

  const [fixtures, recommended] = await Promise.all([
    getUpcomingFixtures({ limit: VENUE_HUB_FIXTURE_FETCH_LIMIT }).catch(
      () => [],
    ),
    getRecommendedVenues({ locationSlug: citySlug }),
  ]);

  const onNow = buildOnNowCards(fixtures);
  const eventTiles = filterHubEventTiles(fixtures, filters.sportSlug);
  const directories = venueHubDirectoryLinks();

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="border-b border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Find a venue
          </p>
          <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
            Search, then browse
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Type a venue name to jump straight there. What’s on and short
            recommended lists stay capped — the full catalog lives on Watch,
            Play, and city landings.
          </p>
          <div className="mt-8">
            <VenueNameSearch initialQuery={landing.nameQuery ?? ""} />
          </div>
        </div>
      </section>

      <VenueHubOnNow cards={onNow} />
      <VenueHubEventTiles fixtures={eventTiles} sportSlug={filters.sportSlug} />
      <VenueHubRecommended
        venues={recommended}
        cityLabel={filters.locationLabel ?? cityDisplayName(citySlug)}
      />
      <Suspense fallback={null}>
        <VenueHubFavouritesSlot />
      </Suspense>
      <VenueHubDirectories links={directories} />
    </div>
  );
}
