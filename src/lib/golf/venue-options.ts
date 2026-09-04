import type { Venue } from "@/services/venues";
import type { GolfCourseCms, GolfRoundVenue } from "@/types/golf-round";
import { hasPlayableGolfCourse } from "./course.ts";
import type { VenueOption } from "../padel/venue-options.ts";

export type GolfVenueOption = VenueOption & {
  golfCourse?: GolfCourseCms | null;
};

function sportLabels(venue: Venue): string[] {
  const labels = (venue.sports ?? []).flatMap((sport) => [
    sport.name,
    sport.slug ?? "",
  ]);
  return [...new Set(labels.map((s) => s.trim().toLowerCase()).filter(Boolean))];
}

export function isGolfSportLabel(value: string): boolean {
  return value.trim().toLowerCase() === "golf";
}

export function toGolfVenueOption(venue: Venue): GolfVenueOption {
  return {
    id: venue._id,
    slug: venue.slug,
    name: venue.name,
    suburb: venue.address?.suburb ?? "",
    city: venue.address?.city ?? "",
    latitude: venue.latitude ?? null,
    longitude: venue.longitude ?? null,
    sports: sportLabels(venue),
    golfCourse: venue.golfCourse ?? null,
  };
}

export function toGolfRoundVenue(
  option: GolfVenueOption | null,
): GolfRoundVenue | null {
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

/**
 * Golf round venues need a playable CMS golfCourse (number/par/strokeIndex).
 * Sport tags alone are not enough.
 */
export function isGolfVenue(
  option: Pick<GolfVenueOption, "golfCourse">,
): boolean {
  return hasPlayableGolfCourse(option.golfCourse);
}
