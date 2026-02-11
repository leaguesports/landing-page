import { ACTIVITIES, Activity } from "./activity";
import { toSlug } from "./suburbs";

export type SportsEvent = {
  id: string;
  imageUrl?: string;
  slug: string;
  name: string;
  date: string;
  utcTime: string;
  activity: Activity;
  /** Suburb slugs where this event is shown. Omit or empty = show in all areas */
  areas?: string[];
};

export const IRELAND_VS_ITALY: SportsEvent = {
  id: "ireland-vs-italy",
  imageUrl:
    "https://rugbytravelireland.com/wp-content/uploads/2021/04/inpho_02421809-scaled.jpg",
  slug: "ireland-vs-italy",
  name: "Six Nations: Ireland vs Italy",
  date: "2026-02-14",
  utcTime: "18:40",
  activity: ACTIVITIES.RUGBY,
  areas: ["sandton", "rosebank", "fourways"],
};

const SCOTLAND_VS_ENGLAND: SportsEvent = {
  id: "scotland-vs-england",
  imageUrl:
    "https://images.unsplash.com/photo-1574602904329-56e2f95fb15e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  slug: "scotland-vs-england",
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
  name: "Bahrain Grand Prix",
  date: "2026-04-12",
  utcTime: "08:00",
  activity: ACTIVITIES.FORMULA_1,
  // no areas = show in all areas
};

export const THAILAND_MOTO_GP: SportsEvent = {
  id: "thailand-motogp",
  imageUrl:
    "https://www.blackbookmotorsport.com/wp-content/uploads/2024/08/motogp-thailand-buriram-chang-international-circuit-2025.jpg",
  slug: "thailand-motogp",
  name: "Thailand MotoGP",
  date: "2026-04-12",
  utcTime: "08:00",
  activity: ACTIVITIES.MOTOGP,
  areas: ["sandton", "rosebank", "fourways"],
};

export const BRAZIL_MOTO_GP: SportsEvent = {
  id: "brazil-motogp",
  imageUrl:
    "https://resources.motogp.pulselive.com/photo-resources/2023/03/29/dacb17bf-93ee-4ba0-afa8-5e61283382d5/TmOS7xyv.jpg?width=1440&height=810",
  slug: "brazil-motogp",
  name: "Brazil MotoGP",
  date: "2026-04-12",
  utcTime: "08:00",
  activity: ACTIVITIES.MOTOGP,
  areas: ["sandton", "rosebank", "fourways"],
};

export const KAIZER_CHIEFS_VS_STELLENBOSCH: SportsEvent = {
  id: "kaizer-chiefs-vs-stellenbosch",
  imageUrl:
    "https://image-prod.iol.co.za/16x9/800?source=https://iol-prod.appspot.com/image/63ecb7426d79240cccf389e843695ac8da204a8d/5052&operation=CROP&offset=0x0&resize=5052x2842",
  slug: "kaizer-chiefs-vs-stellenbosch",
  name: "Betway Premiership: Kaizer Chiefs vs Stellenbosch",
  date: "2026-02-14",
  utcTime: "18:45",
  activity: ACTIVITIES.SOCCER,
  areas: ["sandton", "rosebank", "fourways"],
};

export const ORLANDO_PIRATE_VS_ORLANDO_MARUMO_GALLANTS: SportsEvent = {
  id: "orlando-pirate-vs-orlando-marumo-gallants",
  imageUrl:
    "https://www.orlandopiratesfc.com/storage/2025/08/B25HLSS0495-e1755030186330.jpg",
  slug: "orlando-pirate-vs-orlando-marumo-gallants",
  name: "Betway Premiership: Orlando Pirates vs Marumo Gallants",
  date: "2026-02-15",
  utcTime: "15:30",
  activity: ACTIVITIES.SOCCER,
};

export const EVENTS = {
  IRELAND_VS_ITALY,
  SCOTLAND_VS_ENGLAND,
  AUSTRALIAN_GRAND_PRIX,
  CHINESE_GRAND_PRIX,
  JAPANESE_GRAND_PRIX,
  BAHRAIN_GRAND_PRIX,
  THAILAND_MOTO_GP,
  BRAZIL_MOTO_GP,
  KAIZER_CHIEFS_VS_STELLENBOSCH,
  ORLANDO_PIRATE_VS_ORLANDO_MARUMO_GALLANTS,
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
export function getWatchItemsFromEvents(citySlug: string | null): WatchItem[] {
  const filtered = !citySlug
    ? EVENT_LIST
    : EVENT_LIST.filter(
        (e) => !e.areas || e.areas.length === 0 || e.areas.includes(citySlug),
      );

  const baseUrl = citySlug
    ? `/${toSlug(citySlug)}/watch/sports`
    : "/watch/sports";

  return filtered.map((e) => ({
    href: `${baseUrl}/${e.activity.slug}/${e.slug}`,
    sport: e.activity.name,
    image: e.imageUrl ?? DEFAULT_EVENT_IMAGE,
    title: e.name,
    date: e.date,
    time: e.utcTime,
  }));
}
