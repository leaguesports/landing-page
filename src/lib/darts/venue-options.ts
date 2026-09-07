import type { Venue } from "@/services/venues";
import type { VenueOption } from "../padel/venue-options.ts";
import type { DartsMatchVenue } from "../../types/darts-match.ts";

export type DartsVenueOption = VenueOption;

function sportLabels(venue: Venue): string[] {
  const labels = (venue.sports ?? []).flatMap((sport) => [
    sport.name,
    sport.slug ?? "",
  ]);
  return [...new Set(labels.map((s) => s.trim().toLowerCase()).filter(Boolean))];
}

export function isDartsSportLabel(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    v === "darts" ||
    v === "dart" ||
    v === "autodarts" ||
    v === "ar-darts" ||
    v === "ar darts"
  );
}

export function toDartsVenueOption(venue: Venue): DartsVenueOption {
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

export function toDartsMatchVenue(
  option: DartsVenueOption | null,
): DartsMatchVenue | null {
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

export function isDartsVenue(option: Pick<DartsVenueOption, "sports">): boolean {
  return option.sports.some(isDartsSportLabel);
}
