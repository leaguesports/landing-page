import { Search } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  listVenueFilterOptions,
  searchVenues,
} from "@/services/venues";
import {
  hasActiveVenueFilters,
  parseVenueSearchParams,
  venueDirectoryHref,
  venueResultCountLabel,
  venueSearchSummary,
} from "@/lib/search/venueSearch";
import { VenueDirectoryCard } from "./_components/VenueDirectoryCard";
import { VenueDirectoryFilters } from "./_components/VenueDirectoryFilters";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    sport?: string | string[];
    location?: string | string[];
  }>;
}): Promise<Metadata> {
  const filters = parseVenueSearchParams(await searchParams);
  const filtered = hasActiveVenueFilters(filters);
  const title = filtered ? venueSearchSummary(filters) : "Venues";
  const description = filtered
    ? `${title} — bars, courts, and clubs on LeagueSports.`
    : "Find bars, fan zones, courts, and clubs to watch and play sport across South Africa.";
  return { title, description };
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    sport?: string | string[];
    location?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const filters = parseVenueSearchParams(params);
  const [{ sports, locations }, venues] = await Promise.all([
    listVenueFilterOptions(),
    searchVenues({
      intent: filters.intent,
      sportSlug: filters.sportSlug,
      locationSlug: filters.locationSlug,
    }),
  ]);

  const filtered = hasActiveVenueFilters(filters);
  const heading = filtered ? venueSearchSummary(filters) : "Venues";
  const countLabel = venueResultCountLabel(venues.length);

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <header className="mx-auto max-w-7xl px-4 pt-5 pb-3 sm:px-6 sm:pt-6 lg:px-8">
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
          {heading}
        </h1>
      </header>

      <VenueDirectoryFilters
        intent={filters.intent}
        sport={filters.sportSlug}
        location={filters.locationSlug}
        sports={sports}
        locations={locations}
        resultCountLabel={countLabel}
        filtered={filtered}
        sportLabel={filters.sportName}
        locationLabel={filters.locationLabel}
      />

      <section id="venues" className="scroll-mt-40 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {venues.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {venues.map((venue) => (
                <VenueDirectoryCard
                  key={venue._id}
                  venue={venue}
                  intent={filters.intent}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-14 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-base font-medium text-white">
                No venues match this search
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Try another sport or area, or browse the full directory.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {filters.intent === "play" ? (
                  <Link
                    href={venueDirectoryHref({
                      intent: "watch",
                      sport: filters.sportSlug,
                      location: filters.locationSlug,
                    })}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                  >
                    Try Watch instead
                  </Link>
                ) : null}
                {filters.intent === "watch" ? (
                  <Link
                    href={venueDirectoryHref({
                      intent: "play",
                      sport: filters.sportSlug,
                      location: filters.locationSlug,
                    })}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                  >
                    Try Play instead
                  </Link>
                ) : null}
                <Link
                  href="/venues"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
                >
                  Clear filters
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
