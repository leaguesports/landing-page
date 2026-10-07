import { FeaturedVenueCard } from "@/components/venues/FeaturedVenueCard";
import type { FeaturedHomeVenue } from "@/lib/venues/featured-home";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function HomeFeaturedVenues({ venues }: { venues: FeaturedHomeVenue[] }) {
  if (venues.length === 0) return null;

  return (
    <section className="relative border-t border-white/5 bg-[#0c0f0c] py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Places
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
              Featured venues
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Courts, clubs, and bars worth the trip. Open one to see the
              sports and how to get there.
            </p>
          </div>
          <Link
            href="/venues"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            All venues
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {venues.map((venue) => (
            <li
              key={venue.slug}
              className="w-[82%] shrink-0 snap-start sm:w-[20rem] lg:w-[calc((100%-2rem)/3.15)]"
            >
              <FeaturedVenueCard venue={venue} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
