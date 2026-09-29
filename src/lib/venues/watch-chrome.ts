/**
 * Venue-detail Watch chrome (issue #255).
 *
 * Play-only listings (karting, padel courts, …) must not imply live sports
 * broadcasts. Screenings, “who’s going”, and broadcast amenities render only
 * when the venue already has Watch data: a linked broadcast sport, or
 * upcoming screenings. No new CMS flags.
 */

export type VenueWatchBroadcast = {
  _id?: string | null;
  name?: string | null;
  slug?: string | null;
};

export type VenueWatchScreening = {
  title?: string | null;
  startsAt?: string | null;
};

export type VenueWatchChromeInput = {
  name?: string | null;
  broadcasts?: readonly VenueWatchBroadcast[] | null;
  upcoming_screenings?: readonly VenueWatchScreening[] | null;
  sports?: readonly { name?: string | null; slug?: string | null }[] | null;
  has_generator_backup?: boolean | null;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  has_craft_drafts?: boolean | null;
  has_food_menu?: boolean | null;
  has_outdoor_area?: boolean | null;
  has_parking?: boolean | null;
};

/** Broadcast setup. Draft beer can exist at a play venue; these cannot. */
export const WATCH_ONLY_AMENITY_KEYS = [
  "has_big_screens",
  "has_live_audio",
] as const;

export type WatchOnlyAmenityKey = (typeof WATCH_ONLY_AMENITY_KEYS)[number];

const LISTED_AMENITY_KEYS = [
  "has_generator_backup",
  "has_big_screens",
  "has_live_audio",
  "has_craft_drafts",
  "has_food_menu",
  "has_outdoor_area",
  "has_parking",
] as const;

export type ListedAmenityKey = (typeof LISTED_AMENITY_KEYS)[number];

const WATCH_META_WITH_SUBURB =
  "screens, amenities, and matchday details on LeagueSports.";
const PLAY_META_WITH_SUBURB =
  "where to play, amenities, and venue details on LeagueSports.";

const WATCH_AMENITIES_DESCRIPTION = "Power, screens, and on-site facilities";
const PLAY_AMENITIES_DESCRIPTION = "On-site facilities";

const WATCH_SPORTS_DESCRIPTION = "Watch and play what's on offer";
const PLAY_SPORTS_DESCRIPTION = "Play what's on offer";

const WATCH_FOLLOW_BLURB =
  "Follow this venue to keep it on your list, or browse more screenings and places to play nearby.";
const PLAY_FOLLOW_BLURB =
  "Follow this venue to keep it on your list, or browse more places to play nearby.";

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/** Linked Watch sport (`broadcasts`), not a Play sport on `sports`. */
export function venueHasBroadcasts(
  venue: Pick<VenueWatchChromeInput, "broadcasts">,
): boolean {
  return (venue.broadcasts ?? []).some(
    (item) =>
      Boolean(item) &&
      (hasText(item._id) || hasText(item.name) || hasText(item.slug)),
  );
}

/** CMS `upcoming_screenings` with a title and kickoff. */
export function venueHasScreenings(
  venue: Pick<VenueWatchChromeInput, "upcoming_screenings">,
): boolean {
  return (venue.upcoming_screenings ?? []).some(
    (item) => Boolean(item) && hasText(item.title) && hasText(item.startsAt),
  );
}

/**
 * True when this venue actually screens or broadcasts sport.
 * Play-only venues (no broadcasts, no screenings) are false.
 */
export function venueSupportsWatch(venue: VenueWatchChromeInput): boolean {
  return venueHasBroadcasts(venue) || venueHasScreenings(venue);
}

export function venueAmenityShown(
  key: ListedAmenityKey,
  value: boolean | null | undefined,
  supportsWatch: boolean,
): boolean {
  if (value !== true) return false;
  if (
    (WATCH_ONLY_AMENITY_KEYS as readonly string[]).includes(key) &&
    !supportsWatch
  ) {
    return false;
  }
  return true;
}

export function venueHasVisibleAmenities(
  venue: VenueWatchChromeInput,
  supportsWatch = venueSupportsWatch(venue),
): boolean {
  return LISTED_AMENITY_KEYS.some((key) =>
    venueAmenityShown(key, venue[key], supportsWatch),
  );
}

/**
 * Sports bars keep the amenities block even when no flags are set (today's
 * page). Play-only venues hide it unless a non-broadcast amenity is listed.
 */
export function venueShowsAmenitiesSection(
  venue: VenueWatchChromeInput,
): boolean {
  if (venueSupportsWatch(venue)) return true;
  return venueHasVisibleAmenities(venue, false);
}

export function venueAmenitiesDescription(
  venue: VenueWatchChromeInput,
): string {
  return venueSupportsWatch(venue)
    ? WATCH_AMENITIES_DESCRIPTION
    : PLAY_AMENITIES_DESCRIPTION;
}

export function venueSportsSectionDescription(
  venue: VenueWatchChromeInput,
): string {
  return venueHasBroadcasts(venue)
    ? WATCH_SPORTS_DESCRIPTION
    : PLAY_SPORTS_DESCRIPTION;
}

export function venueDetailMetaDescription(
  venue: Pick<VenueWatchChromeInput, "name"> & VenueWatchChromeInput,
  suburb?: string | null,
): string {
  const name = venue.name?.trim() || "This venue";
  const place = suburb?.trim();
  const tail = venueSupportsWatch(venue)
    ? WATCH_META_WITH_SUBURB
    : PLAY_META_WITH_SUBURB;
  return place ? `${name} in ${place} — ${tail}` : `${name} — ${tail}`;
}

export function venueFollowBlurb(venue: VenueWatchChromeInput): string {
  return venueSupportsWatch(venue) ? WATCH_FOLLOW_BLURB : PLAY_FOLLOW_BLURB;
}

export type VenueNavLink = { label: string; href: string };

export function venueDetailNavLinks(input: {
  hasQuickStart: boolean;
  venue: VenueWatchChromeInput;
}): VenueNavLink[] {
  const supportsWatch = venueSupportsWatch(input.venue);
  const links: VenueNavLink[] = [];
  if (input.hasQuickStart) {
    links.push({ label: "Quick start", href: "#quick-start" });
  }
  links.push({ label: "About", href: "#about" });
  if (supportsWatch) {
    links.push({ label: "This weekend", href: "#weekend" });
  }
  links.push(
    { label: "Match history", href: "#match-history" },
    { label: "Leaderboards", href: "#leaderboards" },
    { label: "Sports", href: "#sports" },
  );
  if (venueShowsAmenitiesSection(input.venue)) {
    links.push({ label: "Amenities", href: "#amenities" });
  }
  links.push({ label: "Location", href: "#location" });
  return links;
}
