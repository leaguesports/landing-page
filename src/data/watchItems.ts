/**
 * Watch items for the home "Showing soon" grid.
 * Optional `areas`: suburb slugs (e.g. "sandton"). Omit or [] = show in all areas.
 */
export type WatchItemWithAreas = {
  href: string;
  sport: string;
  image: string;
  title: string;
  date: string;
  time: string;
  /** Suburb slugs where this event is shown. Omit or empty = show everywhere */
  areas?: string[];
};

export const WATCH_ITEMS_WITH_AREAS: WatchItemWithAreas[] = [
  {
    href: "/venues/1",
    sport: "Rugby",
    image:
      "https://images.unsplash.com/photo-1574602904329-56e2f95fb15e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Golden Lions vs Blue Bulls",
    date: "2025-03-15",
    time: "10:00",
    areas: ["sandton", "rosebank", "fourways"],
  },
  {
    href: "/venues/1",
    sport: "Formula 1",
    image:
      "https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Monaco Grand Prix: FP1",
    date: "May 25, 2026",
    time: "10:00",
    areas: ["sandton", "bryanston", "randburg", "midrand"],
  },
  {
    href: "/venues/1",
    sport: "Cricket",
    image:
      "https://images.unsplash.com/photo-1599982917650-21da4d09c437?q=80&w=1552&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "South Africa vs Pakistan",
    date: "Feb 7, 2026",
    time: "10:00",
    areas: ["edenvale", "bedfordview", "kensington"],
  },
  {
    href: "/venues/1",
    sport: "Rugby",
    image:
      "https://images.unsplash.com/photo-1574602904329-56e2f95fb15e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Stormers vs Sharks",
    date: "2026-03-21",
    time: "15:00",
    areas: ["roodepoort", "randburg"],
  },
  {
    href: "/venues/1",
    sport: "Formula 1",
    image:
      "https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Bahrain Grand Prix",
    date: "2026-04-12",
    time: "16:00",
    // no areas = show in all areas
  },
];

/** Filter items by area slug. When citySlug is null (no area selected), returns all. When set, returns items that have no areas or include citySlug. */
export function filterWatchItemsByArea(
  items: WatchItemWithAreas[],
  citySlug: string | null
): Omit<WatchItemWithAreas, "areas">[] {
  if (!citySlug) {
    return items.map(({ areas: _a, ...rest }) => rest);
  }
  return items
    .filter(
      (item) =>
        !item.areas ||
        item.areas.length === 0 ||
        item.areas.includes(citySlug)
    )
    .map(({ areas: _a, ...rest }) => rest);
}
