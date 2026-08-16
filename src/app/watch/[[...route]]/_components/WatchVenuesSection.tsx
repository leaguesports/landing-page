import { ArrowUpRight, MapPin, Tv } from "lucide-react";
import Link from "next/link";
import type { WatchVenue } from "../watch-types";

type WatchVenuesSectionProps = {
  venues: WatchVenue[];
  locationTitle: string;
  sportName: string;
};

export function WatchVenuesSection({
  venues,
  locationTitle,
  sportName,
}: WatchVenuesSectionProps) {
  return (
    <section
      id="venues"
      className="scroll-mt-28 border-t border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Venues
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            Watch at a venue
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Restaurants, bars &amp; fan zones screening live sport
          </p>
        </header>

        {venues.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {venues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.slug}`}
                className="group block overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-sky-400/30"
              >
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Tv className="h-4 w-4 shrink-0 text-sky-400" />
                    <span className="text-xs font-medium text-sky-300">
                      Watch {sportName}
                    </span>
                  </div>
                  <h3 className="text-base font-medium leading-snug text-white transition-colors group-hover:text-sky-300 sm:text-lg">
                    {venue.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{locationTitle}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-end border-t border-white/6 pt-4">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition-colors group-hover:text-sky-300">
                      View venue
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-12 text-center">
            <Tv className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
            <p className="text-sm text-zinc-400">
              No watch venues for {sportName} in our directory yet.
            </p>
            <Link
              href="/venues"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300"
            >
              Browse venues
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
