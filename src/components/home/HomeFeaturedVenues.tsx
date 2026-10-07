import { hasSportIcon, SportIcon } from "@/components/icons/sports";
import type { FeaturedHomeVenue } from "@/lib/venues/featured-home";
import { isRemoteVenuePhoto } from "@/lib/venues/photo";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
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
              <Link
                href={`/venues/${venue.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141814] transition-colors hover:border-white/30"
              >
                <span className="relative block aspect-[16/10] bg-zinc-900">
                  {isRemoteVenuePhoto(venue.imageUrl) ? (
                    <Image
                      src={venue.imageUrl}
                      alt={venue.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 82vw, 20rem"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={venue.imageUrl}
                      alt={venue.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-3xl leading-none tracking-wide text-white">
                    {venue.name}
                  </span>
                  {venue.place ? (
                    <span className="mt-2 text-sm text-zinc-400">{venue.place}</span>
                  ) : null}
                  {venue.sports.length > 0 ? (
                    <span className="mt-auto flex flex-wrap gap-1.5 pt-4">
                      {venue.sports.map((sport) => (
                        <span
                          key={sport.slug}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300"
                        >
                          {hasSportIcon(sport.slug) ? (
                            <SportIcon
                              sportSlug={sport.slug}
                              size={14}
                              color="currentColor"
                            />
                          ) : null}
                          {sport.name}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
