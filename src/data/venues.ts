import { ACTIVITIES, Activity } from "./activity";

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

export const RIDGEWAY_RACEBAR: Venue = {
  id: "ridgeway-racebar",
  slug: "ridgeway-racebar",
  name: "Ridgeway Racebar",
  area: "Ridgeway, Johannesburg",
  image: "https://pbs.twimg.com/media/FUub3zBXsAEpIGZ.jpg",
  description: "Ridgeway Racebar is a racebar in Johannesburg, South Africa.",
  suburb: "edenvale",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const BENCHEWARMERS_SPORTS_BAR: Venue = {
  id: "benchwarmers-sports-bar",
  slug: "benchwarmers-sports-bar",
  name: "Benchwarmers Sports Bar",
  area: "Rosebank, Johannesburg",
  suburb: "rosebank",
  image:
    "https://res.cloudinary.com/spothopper/image/fetch/f_auto,q_auto:best,c_fit,h_1200/http://static.spotapps.co/spots/41/6798d757b142ee82e52f6f5d7c34cd/:original",
  description:
    "Benchwarmers Sports Bar is a sports bar in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP, ACTIVITIES.RUGBY],
};

export const HOGSHED_ILLOVO: Venue = {
  id: "hogshead-illovo",
  slug: "hogshead-illovo",
  name: "Hogshead Illovo",
  area: "Illovo, Johannesburg",
  suburb: "illovo",
  image: "https://sspartnervenues.com/wp-content/uploads/2024/11/HHRC-4.jpg",
  description:
    "Hogshead Illovo is a pub & grill in Johannesburg, South Africa.",
  watch: [ACTIVITIES.RUGBY, ACTIVITIES.SOCCER],
};

export const THE_WANDERS_CLUB: Venue = {
  id: "the-wanders-club",
  slug: "the-wanders-club",
  name: "The Wanders Club",
  area: "Illovo, Johannesburg",
  suburb: "illovo",
  image:
    "https://res.cloudinary.com/playtomic/image/upload/v1706862477/pro/tenants/137ac129-c935-4504-80e9-82a7b7243f2b/1706862476357.jpg",
  description: "The Wanders Club is a club in Johannesburg, South Africa.",
  watch: [ACTIVITIES.CRICKET, ACTIVITIES.RUGBY, ACTIVITIES.SOCCER],
};

export const KIMIAD_GOLF_COURSE: Venue = {
  id: "kimiad-golf-course",
  slug: "kimiad-golf-course",
  name: "Kimiad Golf Course",
  area: "Moreleta Park, Johannesburg",
  suburb: "moreleta-park",
  image:
    "https://golf-pass.brightspotcdn.com/dims4/default/4517432/2147483647/strip/true/crop/1280x720+0+120/resize/590x332!/quality/90/?url=https%3A%2F%2Fgolf-pass-brightspot.s3.amazonaws.com%2Fd0%2Fc6%2Fc59b1682b565676dbac3a39c1dbf%2F18936.jpg",
  description:
    "Kimiad Golf Course is a golf course in Johannesburg, South Africa.",
  watch: [ACTIVITIES.GOLF],
  play: [ACTIVITIES.GOLF],
};

export const HUDDLE_PARK: Venue = {
  id: "huddle-park",
  slug: "huddle-park",
  name: "Huddle Park",
  area: "Linksfield, Johannesburg",
  suburb: "linksfield",
  image:
    "https://golf-pass.brightspotcdn.com/8c/f7/065814c1e715b1d5a9429b9cd469/53120.jpg",
  description: "Huddle Park is a park in Johannesburg, South Africa.",
  play: [ACTIVITIES.GOLF],
};

export const PIRATES_SPORTS_CLUB: Venue = {
  id: "pirates-sports-club",
  slug: "pirates-sports-club",
  name: "Pirates Sports Club",
  area: "Greenside, Johannesburg",
  suburb: "greenside",
  image:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROFLjN2x-0VYXnIgZbVHyNfyxSea9xKPnrKQ&s",
  description:
    "Pirates Sports Club is a sports club in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const OLD_PARKS_CLUB: Venue = {
  id: "old-parks-club",
  slug: "old-parks-club",
  name: "Old Parks Club",
  area: "Randburg, Johannesburg",
  suburb: "randburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Old Parks Club is a club in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const MODDERFONTEIN_GC: Venue = {
  id: "modderfontein-gc",
  slug: "modderfontein-gc",
  name: "Modderfontein GC",
  area: "Modderfontein, Johannesburg",
  suburb: "modderfontein",
  image:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9KpzmTWoJuosptHwwkjhCYWxJIaYwjy--QA&s",
  description:
    "Modderfontein GC is a golf course in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const MOLLY_MALONE_S: Venue = {
  id: "molly-malone-s",
  slug: "molly-malone-s",
  name: "Molly Malone's",
  area: "Fourways, Johannesburg",
  suburb: "fourways",
  image:
    "https://www.useyourlocal.com/imgs/pubs/1200x630/190522-123329_186396540-489751019105649-956477783579296535-n.jpg",
  description: "Molly Malone's is a pub in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP, ACTIVITIES.RUGBY],
};

export const VENUES = {
  RIDGEWAY_RACEBAR,
  THE_WANDERS_CLUB,
  BENCHEWARMERS_SPORTS_BAR,
  KIMIAD_GOLF_COURSE,
  HUDDLE_PARK,
  PIRATES_SPORTS_CLUB,
  HOGSHED_ILLOVO,
  OLD_PARKS_CLUB,
  MODDERFONTEIN_GC,
  MOLLY_MALONE_S,
};

export const VENUE_LIST = Object.values(VENUES);

/** Display venue type from description (e.g. "sports bar", "club") */
export function getVenueType(venue: Venue): string {
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
