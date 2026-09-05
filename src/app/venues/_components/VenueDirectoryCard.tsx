import { VenueUtilityBadges } from "@/components/VenueUtilityBadges";
import { isRemoteVenuePhoto, venuePhotoUrl } from "@/lib/venues/photo";
import type { Venue } from "@/services/venues";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function venuePlaceLine(venue: Venue): string {
  return [venue.address.suburb, venue.address.city]
    .filter(Boolean)
    .join(", ");
}

function venueSportLabels(
  venue: Venue,
  intent: string | null,
): string[] {
  const play = venue.sports.map((item) => item.name).filter(Boolean);
  const watch = venue.broadcasts.map((item) => item.name).filter(Boolean);
  const names =
    intent === "play" ? play : intent === "watch" ? watch : [...watch, ...play];
  return [...new Set(names)].slice(0, 4);
}

export function VenueDirectoryCard({
  venue,
  intent,
}: {
  venue: Venue;
  intent: string | null;
}) {
  const imageSrc = venuePhotoUrl(venue, { width: 800, height: 480 });
  const place = venuePlaceLine(venue);
  const sports = venueSportLabels(venue, intent);

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#141814] transition-colors hover:border-white/16"
    >
      <div>
        {isRemoteVenuePhoto(imageSrc) ? (
          <Image
            src={imageSrc}
            alt=""
            width={800}
            height={480}
            className="h-44 w-full object-cover sm:h-48"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          // Same-origin SVG placeholder — next/image does not optimize SVG.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-44 w-full object-cover sm:h-48"
            src={imageSrc}
            alt=""
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-base font-medium leading-snug text-white transition-colors group-hover:text-[var(--color-brand)] sm:text-lg">
          {venue.name}
        </h2>
        {place ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{place}</span>
          </p>
        ) : null}
        {typeof venue.rating === "number" ? (
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-300">
            <Star className="h-3.5 w-3.5 fill-amber-300" aria-hidden />
            {venue.rating.toFixed(1)}
          </p>
        ) : null}
        {sports.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Sports">
            {sports.map((name) => (
              <li
                key={name}
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300"
              >
                {name}
              </li>
            ))}
          </ul>
        ) : null}
        <VenueUtilityBadges venue={venue} compact className="mt-3" />
      </div>
    </Link>
  );
}
