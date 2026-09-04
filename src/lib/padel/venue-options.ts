import type { Venue } from "@/services/venues";
import type { PadelMatchVenue } from "@/types/padel-match";

export type VenueOption = {
  id: string;
  slug: string;
  name: string;
  suburb: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  /** Play-sport names and slugs from Sanity `sports` (not `broadcasts`). */
  sports: string[];
};

function sportLabels(venue: Venue): string[] {
  const labels = (venue.sports ?? []).flatMap((sport) => [
    sport.name,
    sport.slug ?? "",
  ]);
  return [...new Set(labels.map((s) => s.trim().toLowerCase()).filter(Boolean))];
}

export function toVenueOption(venue: Venue): VenueOption {
  return {
    id: venue._id,
    slug: venue.slug,
    name: venue.name,
    suburb: venue.address?.suburb ?? "",
    city: venue.address?.city ?? "",
    latitude: venue.latitude ?? null,
    longitude: venue.longitude ?? null,
    sports: sportLabels(venue),
  };
}

export function toMatchVenue(option: VenueOption | null): PadelMatchVenue | null {
  if (!option) return null;
  return {
    id: option.id,
    slug: option.slug,
    name: option.name,
    suburb: option.suburb || null,
    city: option.city || null,
    latitude: option.latitude,
    longitude: option.longitude,
  };
}

/** Play sport padel only — tennis/racket/watch broadcasts are not padel courts. */
export function isPadelSportLabel(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "padel" || v === "paddle";
}

export function isPadelVenue(option: Pick<VenueOption, "sports">): boolean {
  return option.sports.some(isPadelSportLabel);
}
