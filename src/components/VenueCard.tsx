import { Clock, MapPin, Star } from "lucide-react";
import Link from "next/link";
import {
  VenueContactActions,
  VenueUtilityBadges,
  type VenueUtilityFlags,
} from "@/components/VenueUtilityBadges";

export type VenueCardProps = {
  name: string;
  type: string;
  address: string;
  hours?: string;
  rating?: number;
  amenities?: string[];
  image: string;
  href?: string;
} & VenueUtilityFlags;

export function VenueCard({
  name,
  type,
  address,
  hours,
  rating,
  amenities = [],
  image,
  href,
  has_generator_backup,
  has_big_screens,
  has_live_audio,
  has_craft_drafts,
  phone,
  website,
}: VenueCardProps) {
  const utility: VenueUtilityFlags = {
    has_generator_backup,
    has_big_screens,
    has_live_audio,
    has_craft_drafts,
    phone,
    website,
  };

  const body = (
    <>
      <div className="relative h-48 overflow-hidden bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-cover" />
        {typeof rating === "number" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-sm text-white backdrop-blur-sm">
            <Star className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} />
            <span>{rating}</span>
          </div>
        )}
        {has_generator_backup && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-sm">
            ⚡ Backup Power
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
            {type}
          </span>
        </div>
        <h3 className="mb-3 font-black italic uppercase text-white">{name}</h3>
        <div className="mb-3 space-y-2 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{address}</span>
          </div>
          {hours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{hours}</span>
            </div>
          )}
        </div>

        <VenueUtilityBadges venue={utility} className="mb-3" />

        {amenities.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-300"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <VenueContactActions venue={utility} />
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition-colors hover:border-zinc-600"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      {body}
    </div>
  );
}
