export const ALL_SPORTS_SLUG = "all";

export type SportCapability = "play" | "watch" | "scorecard" | "calendar";

export type HubUtilityKind =
  | "scorecard"
  | "history"
  | "play"
  | "watch"
  | "calendar"
  | "series"
  | "guides"
  | "training";

export type HubUtility = {
  id: string;
  sportSlug: string;
  kind: HubUtilityKind;
  title: string;
  description: string;
  href: string;
  emphasis: "primary" | "secondary";
};

/**
 * Nested actions under a hub sport (e.g. Golf → round / simulator / range).
 * Venue directory filters use `venueSportSlug` leaf slugs; hub follow/focus stays on the parent.
 */
export type SportActivity = {
  id: string;
  name: string;
  kind: "scorecard" | "history" | "play";
  /** Venue directory slug when this is a find-venue action. */
  venueSportSlug?: string;
  /** Venue noun for play CTAs — bay, range, course. */
  noun?: string;
  /** Explicit href for scorecard/history (and optional play overrides). */
  href?: string;
  description?: string;
  emphasis?: "primary" | "secondary";
};

export type SportDefinition = {
  slug: string;
  name: string;
  /** Venue noun used in play CTAs — court, course, pitch. */
  noun: string;
  capabilities: SportCapability[];
  /** When set, Tools utilities are built from these instead of capabilities alone. */
  activities?: SportActivity[];
};

/** Sports the hub knows how to serve. Extra Sanity sports merge in at runtime. */
export const SPORT_CATALOG: SportDefinition[] = [
  {
    slug: "padel",
    name: "Padel",
    noun: "court",
    capabilities: ["play", "watch", "scorecard"],
  },
  {
    slug: "rugby",
    name: "Rugby",
    noun: "pitch",
    capabilities: ["play", "watch"],
  },
  {
    slug: "soccer",
    name: "Soccer",
    noun: "pitch",
    capabilities: ["play", "watch"],
  },
  {
    slug: "cricket",
    name: "Cricket",
    noun: "ground",
    capabilities: ["play", "watch"],
  },
  {
    slug: "golf",
    name: "Golf",
    noun: "course",
    capabilities: ["play", "scorecard"],
    activities: [
      {
        id: "round",
        name: "Start a round",
        kind: "scorecard",
        href: "/golf/new",
        description: "Hole-by-hole scorecard for your group.",
        emphasis: "primary",
      },
      {
        id: "history",
        name: "Round history",
        kind: "history",
        href: "/golf/history",
        description: "Locked rounds on your record.",
        emphasis: "secondary",
      },
      {
        id: "course",
        name: "Find a course",
        kind: "play",
        venueSportSlug: "golf",
        noun: "course",
        description: "Places to play golf near you.",
        emphasis: "secondary",
      },
      {
        id: "simulator",
        name: "Find a simulator",
        kind: "play",
        venueSportSlug: "indoor-golf",
        noun: "bay",
        description: "Indoor golf and simulator bays near you.",
        emphasis: "secondary",
      },
      {
        id: "driving-range",
        name: "Find a driving range",
        kind: "play",
        venueSportSlug: "driving-range",
        noun: "range",
        description: "Ranges to warm up and practice.",
        emphasis: "secondary",
      },
    ],
  },
  {
    slug: "motorsport",
    name: "Motorsport",
    noun: "venue",
    capabilities: ["watch", "calendar"],
  },
  {
    slug: "tennis",
    name: "Tennis",
    noun: "court",
    capabilities: ["play"],
  },
  {
    slug: "squash",
    name: "Squash",
    noun: "court",
    capabilities: ["play"],
  },
  {
    slug: "karting",
    name: "Karting",
    noun: "track",
    capabilities: ["play"],
  },
  {
    slug: "darts",
    name: "Darts",
    noun: "board",
    capabilities: ["play"],
  },
  {
    slug: "pool",
    name: "Pool",
    noun: "table",
    capabilities: ["play"],
  },
  {
    slug: "bowling",
    name: "Bowling",
    noun: "lane",
    capabilities: ["play"],
  },
  {
    slug: "sim-racing",
    name: "Sim Racing",
    noun: "sim",
    capabilities: ["play"],
  },
];

/** CMS series slugs (and common labels) → hub sport slug. */
export const SERIES_TO_SPORT: Record<string, string> = {
  f1: "motorsport",
  f2: "motorsport",
  motogp: "motorsport",
  wrc: "motorsport",
  gt3: "motorsport",
  "formula-1": "motorsport",
  "formula-2": "motorsport",
  "formula 1": "motorsport",
  "formula 2": "motorsport",
  football: "soccer",
  "premier-league": "soccer",
  "six-nations": "rugby",
  paddle: "padel",
  "go-karting": "karting",
  "go karting": "karting",
  gokart: "karting",
  "go-kart": "karting",
  kart: "karting",
  dart: "darts",
  autodarts: "darts",
  "ar darts": "darts",
  "ar-darts": "darts",
  billiards: "pool",
  snooker: "pool",
  "pool table": "pool",
  "pool tables": "pool",
  "ten-pin": "bowling",
  "ten pin": "bowling",
  tenpin: "bowling",
  "hyper bowling": "bowling",
  "hyper-bowling": "bowling",
  // Golf family → hub parent (venue leaf slugs stay in VENUE_SPORT_PARENT / search aliases).
  "golf simulator": "golf",
  "golf sim": "golf",
  "golf-sim": "golf",
  "simulator golf": "golf",
  "indoor golf": "golf",
  "indoor-golf": "golf",
  "driving range": "golf",
  "driving-range": "golf",
  "practice range": "golf",
  "sim racing": "sim-racing",
  "racing sim": "sim-racing",
  "racing simulator": "sim-racing",
  simracing: "sim-racing",
};

/**
 * Leaf venue-directory slugs nested under a hub parent.
 * Keep these out of top-level follow/focus chips; SEO/search still use the leaf.
 */
export const VENUE_SPORT_PARENT: Record<string, string> = {
  "indoor-golf": "golf",
  "golf-sim": "golf",
  "golf-simulator": "golf",
  "driving-range": "golf",
};

/** Display names for nested venue sports (SEO hubs / autocomplete). */
export const VENUE_SPORT_LABELS: Record<string, string> = {
  "indoor-golf": "Indoor Golf",
  "golf-sim": "Indoor Golf",
  "golf-simulator": "Indoor Golf",
  "driving-range": "Driving Range",
};

/** Hub parent for a leaf venue sport, or null when the slug is already top-level. */
export function parentSportSlug(
  slug: string | null | undefined,
): string | null {
  const normalized = normalizeSportSlug(slug);
  if (!normalized) return null;
  return VENUE_SPORT_PARENT[normalized] ?? null;
}

/** Remap nested venue sports (e.g. indoor-golf) onto their hub parent. */
export function toHubSportSlug(slug: string | null | undefined): string | null {
  const normalized = normalizeSportSlug(slug);
  if (!normalized) return null;
  return VENUE_SPORT_PARENT[normalized] ?? normalized;
}

export function normalizeSportSlug(slug: string | null | undefined): string {
  return (slug ?? "").trim().toLowerCase().replace(/\s+/g, "-");
}

export function catalogBySlug(
  sports: SportDefinition[] = SPORT_CATALOG,
): Map<string, SportDefinition> {
  return new Map(sports.map((sport) => [sport.slug, sport]));
}

export function knownSportSlugs(
  sports: SportDefinition[] = SPORT_CATALOG,
): string[] {
  return sports.map((sport) => sport.slug);
}

function uniqueSlugs(values: string[], allowed: Set<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const raw = normalizeSportSlug(value);
    if (!raw) continue;
    // Migrate legacy indoor-golf (etc.) follows onto the hub parent.
    const slug = toHubSportSlug(raw) ?? raw;
    if (!allowed.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    result.push(slug);
  }
  return result;
}

/**
 * Catalog first (stable order), then any extra Sanity sports as play+watch.
 */
export function mergeHubSports(
  catalog: SportDefinition[],
  live: Array<{ name?: string | null; slug?: string | null }>,
): SportDefinition[] {
  const bySlug = new Map(catalog.map((sport) => [sport.slug, { ...sport }]));

  for (const item of live) {
    const slug = normalizeSportSlug(item.slug);
    if (!slug) continue;
    // Nested venue sports (indoor-golf, driving-range) stay under their hub parent.
    if (VENUE_SPORT_PARENT[slug]) continue;
    const name = item.name?.trim() || slug;
    const existing = bySlug.get(slug);
    if (existing) {
      bySlug.set(slug, { ...existing, name });
      continue;
    }
    bySlug.set(slug, {
      slug,
      name,
      noun: "venue",
      capabilities: ["play", "watch"],
    });
  }

  const extras = [...bySlug.values()]
    .filter((sport) => !catalog.some((item) => item.slug === sport.slug))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    ...catalog.map((item) => bySlug.get(item.slug) ?? item),
    ...extras,
  ];
}

export function resolveSportSlug(
  value: string | null | undefined,
  sports: SportDefinition[] = SPORT_CATALOG,
): string | null {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw) return null;
  const slug = normalizeSportSlug(raw);
  const alias = SERIES_TO_SPORT[raw] ?? SERIES_TO_SPORT[slug];
  if (alias && sports.some((sport) => sport.slug === alias)) return alias;
  if (sports.some((sport) => sport.slug === slug)) return slug;
  return null;
}

/**
 * Best-effort sport from free text (guide titles, screening names, series).
 * Longest name/slug/alias wins so "Formula 1" beats "1".
 */
export function inferSportSlug(
  text: string,
  sports: SportDefinition[] = SPORT_CATALOG,
): string | null {
  const haystack = text.trim().toLowerCase();
  if (!haystack) return null;

  const needles: { needle: string; slug: string }[] = [];
  for (const sport of sports) {
    needles.push({ needle: sport.slug, slug: sport.slug });
    needles.push({ needle: sport.name.toLowerCase(), slug: sport.slug });
  }
  for (const [alias, slug] of Object.entries(SERIES_TO_SPORT)) {
    if (sports.some((sport) => sport.slug === slug)) {
      needles.push({ needle: alias, slug });
    }
  }

  needles.sort((a, b) => b.needle.length - a.needle.length);

  for (const candidate of needles) {
    if (candidate.needle.length < 3 && candidate.needle !== "f1" && candidate.needle !== "f2") {
      continue;
    }
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(candidate.needle)}([^a-z0-9]|$)`,
      "i",
    );
    if (pattern.test(haystack)) return candidate.slug;
  }

  return resolveSportSlug(haystack, sports);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function eventHref(
  series: string | null | undefined,
  slug: string | null | undefined,
): string {
  const seriesSlug = normalizeSportSlug(series);
  const raceSlug = slug?.trim() || "";
  if (seriesSlug === "f1" && raceSlug) return `/motorsport/f1/${raceSlug}`;
  if (seriesSlug === "f2") return "/motorsport/f2";
  if (SERIES_TO_SPORT[seriesSlug] === "motorsport") return "/motorsport";
  const sport = resolveSportSlug(series);
  if (sport) {
    return `/watch/${encodeURIComponent(sport)}`;
  }
  return "/watch";
}

function utilitiesFromActivities(sport: SportDefinition): HubUtility[] {
  const activities = sport.activities ?? [];
  const list: HubUtility[] = [];

  for (const activity of activities) {
    const venueSlug = activity.venueSportSlug ?? sport.slug;
    const href =
      activity.href ??
      (activity.kind === "play"
        ? `/play/${encodeURIComponent(venueSlug)}`
        : "#");
    list.push({
      id: `${sport.slug}-${activity.id}`,
      sportSlug: sport.slug,
      kind: activity.kind,
      title: activity.name,
      description:
        activity.description ??
        (activity.kind === "play"
          ? `Places to play ${activity.name.toLowerCase()} near you.`
          : activity.name),
      href,
      emphasis: activity.emphasis ?? (list.length === 0 ? "primary" : "secondary"),
    });
  }

  list.push({
    id: `${sport.slug}-guides`,
    sportSlug: sport.slug,
    kind: "guides",
    title: "Guides",
    description: `Local tips for ${sport.name.toLowerCase()}.`,
    href: "/guides",
    emphasis: "secondary",
  });

  return list;
}

export function utilitiesForSport(sport: SportDefinition): HubUtility[] {
  if (sport.activities && sport.activities.length > 0) {
    return utilitiesFromActivities(sport);
  }

  const list: HubUtility[] = [];
  const playHref = `/play/${encodeURIComponent(sport.slug)}`;
  const watchHref =
    sport.slug === "motorsport"
      ? "/watch"
      : `/watch/${encodeURIComponent(sport.slug)}`;

  if (sport.capabilities.includes("scorecard")) {
    const isGolf = sport.slug === "golf";
    list.push({
      id: `${sport.slug}-start`,
      sportSlug: sport.slug,
      kind: "scorecard",
      title: isGolf ? "Start a round" : "Start a match",
      description: isGolf
        ? "Hole-by-hole scorecard for your group."
        : "Live scorecard for a four-ball.",
      href: isGolf ? "/golf/new" : "/padel/new",
      emphasis: "primary",
    });
    list.push({
      id: `${sport.slug}-history`,
      sportSlug: sport.slug,
      kind: "history",
      title: isGolf ? "Round history" : "Match history",
      description: isGolf
        ? "Locked rounds on your record."
        : "Locked results on your record.",
      href: isGolf ? "/golf/history" : "/padel/history",
      emphasis: "secondary",
    });
    if (sport.slug === "padel") {
      list.push({
        id: `${sport.slug}-training`,
        sportSlug: sport.slug,
        kind: "training",
        title: "Training plans",
        description: "Start a curated padel plan and log each drill.",
        href: "/training",
        emphasis: "secondary",
      });
    }
  }

  if (sport.capabilities.includes("play")) {
    list.push({
      id: `${sport.slug}-play`,
      sportSlug: sport.slug,
      kind: "play",
      title: `Find a ${sport.noun}`,
      description: `Places to play ${sport.name.toLowerCase()} near you.`,
      href: playHref,
      emphasis: sport.capabilities.includes("scorecard") ? "secondary" : "primary",
    });
  }

  if (sport.capabilities.includes("watch")) {
    list.push({
      id: `${sport.slug}-watch`,
      sportSlug: sport.slug,
      kind: "watch",
      title: `Watch ${sport.name}`,
      description: "Bars and fan zones with live screens.",
      href: watchHref,
      emphasis:
        sport.capabilities.includes("play") ||
        sport.capabilities.includes("scorecard")
          ? "secondary"
          : "primary",
    });
  }

  if (sport.capabilities.includes("calendar")) {
    list.push({
      id: `${sport.slug}-calendar`,
      sportSlug: sport.slug,
      kind: "calendar",
      title: "Season calendar",
      description: "Upcoming Grands Prix and race weekends.",
      href: "/motorsport/f1/calendar",
      emphasis: "primary",
    });
    list.push({
      id: `${sport.slug}-series`,
      sportSlug: sport.slug,
      kind: "series",
      title: "Series hub",
      description: "F1, F2, and the rest of the grid.",
      href: "/motorsport",
      emphasis: "secondary",
    });
  }

  list.push({
    id: `${sport.slug}-guides`,
    sportSlug: sport.slug,
    kind: "guides",
    title: "Guides",
    description: `Local tips for ${sport.name.toLowerCase()}.`,
    href: "/guides",
    emphasis: "secondary",
  });

  return list;
}

export function utilitiesForAll(): HubUtility[] {
  return [
    {
      id: "all-start",
      sportSlug: "padel",
      kind: "scorecard",
      title: "Start a padel match",
      description: "Live scorecard — lock the result onto your history.",
      href: "/padel/new",
      emphasis: "primary",
    },
    {
      id: "all-golf-start",
      sportSlug: "golf",
      kind: "scorecard",
      title: "Start a golf round",
      description: "Hole-by-hole scorecard — lock the round onto your history.",
      href: "/golf/new",
      emphasis: "secondary",
    },
    {
      id: "all-play",
      sportSlug: ALL_SPORTS_SLUG,
      kind: "play",
      title: "Find a venue",
      description: "Courts, clubs, and pitches near you.",
      href: "/play",
      emphasis: "primary",
    },
    {
      id: "all-watch",
      sportSlug: ALL_SPORTS_SLUG,
      kind: "watch",
      title: "Watch live",
      description: "Find a bar or fan zone screening sport.",
      href: "/watch",
      emphasis: "secondary",
    },
    {
      id: "all-history",
      sportSlug: "padel",
      kind: "history",
      title: "Match history",
      description: "Locked padel results for your account.",
      href: "/padel/history",
      emphasis: "secondary",
    },
    {
      id: "all-training",
      sportSlug: "padel",
      kind: "training",
      title: "Padel training",
      description: "Curated plans — start Accuracy Focus from the hub.",
      href: "/training",
      emphasis: "secondary",
    },
    {
      id: "all-calendar",
      sportSlug: "motorsport",
      kind: "calendar",
      title: "Motorsport calendar",
      description: "Race weekends and the F1 season.",
      href: "/motorsport/f1/calendar",
      emphasis: "secondary",
    },
    {
      id: "all-guides",
      sportSlug: ALL_SPORTS_SLUG,
      kind: "guides",
      title: "Guides",
      description: "Local tips for fans and players.",
      href: "/guides",
      emphasis: "secondary",
    },
  ];
}

export function utilitiesForActiveSport(
  active: string,
  sports: SportDefinition[],
): HubUtility[] {
  if (active === ALL_SPORTS_SLUG) return utilitiesForAll();
  const sport = sports.find((item) => item.slug === active);
  if (!sport) return utilitiesForAll();
  return utilitiesForSport(sport);
}

export function filterFeedBySport<T extends { sportSlug: string | null }>(
  items: T[],
  active: string,
): T[] {
  if (active === ALL_SPORTS_SLUG) return items;
  const focus = normalizeSportSlug(active);
  return items.filter((item) => {
    const itemSlug = item.sportSlug;
    if (!itemSlug) return false;
    if (itemSlug === focus) return true;
    // Nested venue sports surface under their hub parent (golf ← indoor-golf).
    return toHubSportSlug(itemSlug) === focus;
  });
}

export type HubPreferences = {
  followed: string[];
  active: string;
};

export function defaultHubPreferences(
  seedFollowed: string[],
  knownSlugs: string[] = knownSportSlugs(),
): HubPreferences {
  const allowed = new Set(knownSlugs);
  const followed = uniqueSlugs(seedFollowed, allowed);
  return {
    followed,
    active:
      followed.length === 1 ? followed[0] : ALL_SPORTS_SLUG,
  };
}

export function parseHubPreferences(
  raw: string | null | undefined,
  options: { knownSlugs: string[]; seedFollowed: string[] },
): HubPreferences {
  const fallback = defaultHubPreferences(
    options.seedFollowed,
    options.knownSlugs,
  );
  if (!raw?.trim()) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<HubPreferences>;
    const allowed = new Set(options.knownSlugs);
    const followed = uniqueSlugs(
      Array.isArray(parsed.followed) ? parsed.followed : fallback.followed,
      allowed,
    );
    const activeRaw = normalizeSportSlug(
      typeof parsed.active === "string" ? parsed.active : "",
    );
    const activeMapped =
      activeRaw === ALL_SPORTS_SLUG
        ? activeRaw
        : (toHubSportSlug(activeRaw) ?? activeRaw);
    const active =
      activeMapped === ALL_SPORTS_SLUG || allowed.has(activeMapped)
        ? activeMapped
        : fallback.active;
    return { followed, active };
  } catch {
    return fallback;
  }
}

export function serializeHubPreferences(prefs: HubPreferences): string {
  return JSON.stringify({
    followed: prefs.followed,
    active: prefs.active,
  });
}

export function hubStorageKey(userId: string): string {
  return `leaguesports.hub.v1.${userId.trim()}`;
}

/** Focus a sport and follow it. `all` only changes the filter. */
export function selectHubSport(
  prefs: HubPreferences,
  slug: string,
  knownSlugs: string[],
): HubPreferences {
  const allowed = new Set(knownSlugs);
  if (slug === ALL_SPORTS_SLUG) {
    return { ...prefs, active: ALL_SPORTS_SLUG };
  }
  const next = toHubSportSlug(normalizeSportSlug(slug)) ?? normalizeSportSlug(slug);
  if (!allowed.has(next)) return prefs;
  const followed = uniqueSlugs([...prefs.followed, next], allowed);
  return { followed, active: next };
}

export function unfollowHubSport(
  prefs: HubPreferences,
  slug: string,
  knownSlugs: string[],
): HubPreferences {
  const next = normalizeSportSlug(slug);
  const allowed = new Set(knownSlugs);
  const followed = uniqueSlugs(
    prefs.followed.filter((item) => item !== next),
    allowed,
  );
  const active = prefs.active === next ? ALL_SPORTS_SLUG : prefs.active;
  return { followed, active };
}
