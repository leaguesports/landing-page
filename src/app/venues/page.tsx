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
  const subtitle = filtered
    ? countLabel
    : "Filter by watch, play, sport, or area";

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <header className="mx-auto max-w-7xl px-4 pt-8 pb-5 sm:px-6 sm:pt-10 lg:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
          Directory
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
            {heading}
          </h1>
          <p className="text-sm text-zinc-500 sm:text-base">{subtitle}</p>
        </div>
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

      <section id="venues" className="scroll-mt-40 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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
              <Link
                href="/venues"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[var(--color-brand-dim)]"
              >
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
