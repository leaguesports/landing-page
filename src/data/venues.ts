import { Activity } from "./activity";

export type Venue = {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
  area: string;
  suburb: string;
  play?: Activity[];
  watch?: Activity[];
};

/** Display venue type from description (e.g. "sports bar", "club") */
export function getVenueType(venue: Pick<Venue, "description">): string {
  const match = venue.description.match(/ is a ([^.]+) in /i);
  return match ? match[1].trim() : "Sports venue";
}

/** Lowercase venue type for intent matching */
function getVenueTypeFromDescription(venue: Venue): string {
  const match = venue.description.match(/ is a ([^.]+) in /i);
  return match ? match[1].trim().toLowerCase() : "";
}

/** Watch intent: Sports Bars, Fan Zones (and pub/racebar as watch venues) */
const WATCH_VENUE_TYPE_KEYWORDS = [
  "sports bar",
  "fan zone",
  "racebar",
  "pub",
  "grill",
];
/** Play intent: Clubs, Courts, Tournaments (and golf course, park) */
const PLAY_VENUE_TYPE_KEYWORDS = [
  "club",
  "court",
  "tournament",
  "golf course",
  "park",
  "sports club",
];

export type Intent = "watch" | "play";

export function isVenueForIntent(venue: Venue, intent: Intent): boolean {
  const type = getVenueTypeFromDescription(venue);
  if (!type) return false;
  const keywords =
    intent === "watch" ? WATCH_VENUE_TYPE_KEYWORDS : PLAY_VENUE_TYPE_KEYWORDS;
  return keywords.some((kw) => type.includes(kw) || kw.includes(type));
}
