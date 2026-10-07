import { hasSportIcon, SportIcon } from "@/components/icons/sports";
import type { FeaturedHomeVenue } from "@/lib/venues/featured-home";
import { isRemoteVenuePhoto } from "@/lib/venues/photo";
import Image from "next/image";
import Link from "next/link";

/** Photo card shared with the home featured-venues row. */
export function FeaturedVenueCard({ venue }: { venue: FeaturedHomeVenue }) {
  const photo = venue.imageUrl.trim();

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141814] transition-colors hover:border-white/30"
      data-featured-venue-card={venue.slug}
    >
      <span className="relative block aspect-[16/10] bg-zinc-900">
        {photo && isRemoteVenuePhoto(photo) ? (
          <Image
            src={photo}
            alt={venue.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 82vw, 20rem"
          />
        ) : photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={venue.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
      </span>
      <span className="flex flex-1 flex-col p-5">
        <span className="font-display text-3xl leading-none tracking-wide text-white">{venue.name}</span>
        {venue.place ? <span className="mt-2 text-sm text-zinc-400">{venue.place}</span> : null}
        {venue.sports.length > 0 ? (
          <span className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {venue.sports.map((sport) => (
              <span
                key={sport.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300"
              >
                {hasSportIcon(sport.slug) ? (
                  <SportIcon sportSlug={sport.slug} size={14} color="currentColor" />
                ) : null}
                {sport.name}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
