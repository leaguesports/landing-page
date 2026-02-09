import { ACTIVITIES, Activity } from "./activity";

export type Venue = {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
  area: string;
  play?: Activity[];
  watch?: Activity[];
};

export const RIDGEWAY_RACEBAR: Venue = {
  id: "ridgeway-racebar",
  slug: "ridgeway-racebar",
  name: "Ridgeway Racebar",
  area: "Ridgeway, Johannesburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Ridgeway Racebar is a racebar in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const BENCHEWARMERS_SPORTS_BAR: Venue = {
  id: "benchwarmers-sports-bar",
  slug: "benchwarmers-sports-bar",
  name: "Benchwarmers Sports Bar",
  area: "Rosebank, Johannesburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description:
    "Benchwarmers Sports Bar is a sports bar in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const HOGSHED_ILLOVO: Venue = {
  id: "hogshead-illovo",
  slug: "hogshead-illovo",
  name: "Hogshead Illovo",
  area: "Illovo, Johannesburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description:
    "Hogshead Illovo is a pub & grill in Johannesburg, South Africa.",
  watch: [ACTIVITIES.RUGBY, ACTIVITIES.SOCCER],
};

export const THE_WANDERS_CLUB: Venue = {
  id: "the-wanders-club",
  slug: "the-wanders-club",
  name: "The Wanders Club",
  area: "Illovo, Johannesburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "The Wanders Club is a club in Johannesburg, South Africa.",
  watch: [ACTIVITIES.CRICKET, ACTIVITIES.RUGBY, ACTIVITIES.SOCCER],
};

export const KIMIAD_GOLF_COURSE: Venue = {
  id: "kimiad-golf-course",
  slug: "kimiad-golf-course",
  name: "Kimiad Golf Course",
  area: "Moreleta Park, Johannesburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Huddle Park is a park in Johannesburg, South Africa.",
  play: [ACTIVITIES.GOLF],
};

export const PIRATES_SPORTS_CLUB: Venue = {
  id: "pirates-sports-club",
  slug: "pirates-sports-club",
  name: "Pirates Sports Club",
  area: "Greenside, Johannesburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description:
    "Pirates Sports Club is a sports club in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const OLD_PARKS_CLUB: Venue = {
  id: "old-parks-club",
  slug: "old-parks-club",
  name: "Old Parks Club",
  area: "Randburg, Johannesburg",
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
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description:
    "Modderfontein GC is a golf course in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
};

export const MOLLY_MALONE_S: Venue = {
  id: "molly-malone-s",
  slug: "molly-malone-s",
  name: "Molly Malone's",
  area: "Fourways, Johannesburg",
  image:
    "https://images.unsplash.com/photo-1742744652734-d5ec6598b5da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Molly Malone's is a pub in Johannesburg, South Africa.",
  watch: [ACTIVITIES.FORMULA_1, ACTIVITIES.MOTOGP],
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
