import { ACTIVITIES, Activity } from "./activity";

export type SportsEvent = {
  id: string;
  imageUrl?: string;
  slug: string;
  url: string;
  name: string;
  date: string;
  utcTime: string;
  activity: Activity;
  /** Suburb slugs where this event is shown. Omit or empty = show in all areas */
  areas?: string[];
};

const SCOTLAND_VS_ENGLAND: SportsEvent = {
  id: "scotland-vs-england",
  imageUrl:
    "https://images.unsplash.com/photo-1574602904329-56e2f95fb15e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  slug: "scotland-vs-england",
  url: "/sports/rugby/scotland-vs-england",
  name: "Six Nations: Scotland vs England",
  date: "2026-02-14",
  utcTime: "18:40",
  activity: ACTIVITIES.RUGBY,
  areas: ["sandton", "rosebank", "fourways"],
};

export const AUSTRALIAN_GRAND_PRIX: SportsEvent = {
  id: "australian-grand-prix",
  imageUrl:
    "https://www.gtplanet.net/wp-content/uploads/2018/03/1521955695594.jpg",
  slug: "australian-grand-prix",
  url: "/sports/f1/races/australian-grand-prix",
  name: "Australian Grand Prix",
  date: "2026-03-08",
  utcTime: "05:00",
  activity: ACTIVITIES.FORMULA_1,
  areas: ["sandton", "bryanston", "randburg", "midrand"],
};

export const CHINESE_GRAND_PRIX: SportsEvent = {
  id: "chinese-grand-prix",
  imageUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm44DWwVMjBOgMso1tMd-NRNXz8o2q5jZeuA&s",
  slug: "chinese-grand-prix",
  url: "/sports/f1/races/chinese-grand-prix",
  name: "Chinese Grand Prix",
  date: "2026-03-15",
  utcTime: "06:00",
  activity: ACTIVITIES.FORMULA_1,
  areas: ["edenvale", "bedfordview", "kensington"],
};

export const JAPANESE_GRAND_PRIX: SportsEvent = {
  id: "japanese-grand-prix",
  imageUrl:
    "https://www.blackbookmotorsport.com/wp-content/uploads/2024/02/f1-japanese-grand-prix-suzuka-2029.jpg",
  slug: "japanese-grand-prix",
  url: "/sports/f1/races/japanese-grand-prix",
  name: "Japanese Grand Prix",
  date: "2026-03-29",
  utcTime: "07:00",
  activity: ACTIVITIES.FORMULA_1,
  areas: ["roodepoort", "randburg"],
};

export const BAHRAIN_GRAND_PRIX: SportsEvent = {
  id: "bahrain-grand-prix",
  imageUrl:
    "https://media.formula1.com/image/upload/t_16by9North/c_lfill,w_3392/q_auto/v1740000000/trackside-images/2024/F1_Grand_Prix_of_Bahrain/2053162835.webp",
  slug: "bahrain-grand-prix",
  url: "/sports/f1/races/bahrain-grand-prix",
  name: "Bahrain Grand Prix",
  date: "2026-04-12",
  utcTime: "08:00",
  activity: ACTIVITIES.FORMULA_1,
  // no areas = show in all areas
};

export const EVENTS = {
  SCOTLAND_VS_ENGLAND,
  AUSTRALIAN_GRAND_PRIX,
  CHINESE_GRAND_PRIX,
  JAPANESE_GRAND_PRIX,
  BAHRAIN_GRAND_PRIX,
};

export const EVENT_LIST = Object.values(EVENTS);

/** Shape expected by WhatsShowingGrid / WatchCard */
export type WatchItem = {
  href: string;
  sport: string;
  image: string;
  title: string;
  date: string;
  time: string;
};

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1470&auto=format&fit=crop";

/**
 * Events as watch items, filtered by area. When citySlug is null, returns all.
 * When set, returns events that have no areas or include citySlug.
 */
export function getWatchItemsFromEvents(
  citySlug: string | null
): WatchItem[] {
  const filtered =
    !citySlug
      ? EVENT_LIST
      : EVENT_LIST.filter(
          (e) =>
            !e.areas ||
            e.areas.length === 0 ||
            e.areas.includes(citySlug)
        );
  return filtered.map((e) => ({
    href: e.url,
    sport: e.activity.name,
    image: e.imageUrl ?? DEFAULT_EVENT_IMAGE,
    title: e.name,
    date: e.date,
    time: e.utcTime,
  }));
}
