import { toSlug } from "@/data/suburbs";

export type VenueChipAddress = {
  suburb?: string | null;
  city?: string | null;
};

/** Suburb first, then city — both slugified from Sanity titles. */
export function venueChipLocationSlug(address: VenueChipAddress): string {
  const suburb = toSlug(address.suburb?.trim() || "");
  if (suburb) return suburb;
  return toSlug(address.city?.trim() || "");
}

/**
 * Watch → `/watch/{sport}/{location}`, Play → `/play/{sport}/{location}`.
 * Falls back to the sport hub when the venue has no suburb or city.
 */
export function venueIntentChipHref(
  intent: "watch" | "play",
  sportSlug: string | null | undefined,
  address: VenueChipAddress,
): string | null {
  const sport = sportSlug?.trim();
  if (!sport) return null;
  const location = venueChipLocationSlug(address);
  if (location) return `/${intent}/${sport}/${location}`;
  return `/${intent}/${sport}`;
}
