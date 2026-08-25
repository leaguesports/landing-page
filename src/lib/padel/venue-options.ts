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
  sports: string[];
};

export function toVenueOption(venue: Venue): VenueOption {
  return {
    id: venue._id,
    slug: venue.slug,
    name: venue.name,
    suburb: venue.address?.suburb ?? "",
    city: venue.address?.city ?? "",
    latitude: venue.latitude ?? null,
    longitude: venue.longitude ?? null,
    sports: (venue.sports ?? []).map((s) => s.name.toLowerCase()),
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

export function isPadelVenue(option: VenueOption): boolean {
  return option.sports.some(
    (s) => s.includes("padel") || s.includes("racket") || s.includes("tennis"),
  );
}
