import {
  SERIES_TO_SPORT,
  SPORT_CATALOG,
  normalizeSportSlug,
} from "../sports/catalog.ts";
import type { IntentKind } from "./paths.ts";

/** Local copy of sportSlugVariants so unit tests stay free of path aliases. */
function sportSlugVariants(slug: string | null | undefined): string[] {
  if (!slug) return [];
  if (slug === "soccer" || slug === "football") return ["soccer", "football"];
  if (slug === "padel" || slug === "paddle") return ["padel", "paddle"];
  if (slug === "karting" || slug === "go-karting" || slug === "gokart") {
    return ["karting", "go-karting"];
  }
  if (slug === "f1" || slug === "formula-1" || slug === "formula 1") {
    return ["motorsport", "f1", "formula-1"];
  }
  if (slug === "f2" || slug === "formula-2" || slug === "formula 2") {
    return ["motorsport", "f2", "formula-2"];
  }
  if (slug === "motogp" || slug === "moto-gp") {
    return ["motorsport", "motogp", "moto-gp"];
  }
  if (slug === "premier-league") return ["soccer", "premier-league"];
  if (slug === "six-nations") return ["rugby", "six-nations"];
  if (slug === "pool" || slug === "billiards" || slug === "snooker") {
    return ["pool", "billiards", "snooker"];
  }
  if (
    slug === "bowling" ||
    slug === "ten-pin" ||
    slug === "tenpin" ||
    slug === "hyper-bowling"
  ) {
    return ["bowling", "ten-pin", "hyper-bowling"];
  }
  if (
    slug === "indoor-golf" ||
    slug === "golf-sim" ||
    slug === "golf-simulator"
  ) {
    return ["indoor-golf", "golf-sim", "golf-simulator"];
  }
  if (slug === "sim-racing" || slug === "simracing" || slug === "racing-sim") {
    return ["sim-racing", "simracing", "racing-sim"];
  }
  if (
    slug === "darts" ||
    slug === "dart" ||
    slug === "autodarts" ||
    slug === "ar-darts"
  ) {
    return ["darts", "autodarts", "ar-darts"];
  }
  return [slug];
}

export type IntentActivityKind = "sport" | "series";

export type IntentActivity = {
  kind: IntentActivityKind;
  /** URL segment (f1, padel, premier-league). */
  slug: string;
  /** Display name for titles and H1. */
  name: string;
  /** Parent sport slug when this is a series. */
  sportSlug: string;
  /** GROQ match list for venue sports/broadcasts. */
  querySlugs: string[];
};

const SERIES_DISPLAY: Record<string, string> = {
  f1: "Formula 1",
  "formula-1": "Formula 1",
  f2: "Formula 2",
  "formula-2": "Formula 2",
  motogp: "MotoGP",
  "moto-gp": "MotoGP",
  wrc: "WRC",
  gt3: "GT3",
  "premier-league": "Premier League",
  "six-nations": "Six Nations",
};

/**
 * Expand series / alias slugs so `/watch/f1/...` matches motorsport broadcasts.
 */
export function activityQuerySlugs(slug: string | null | undefined): string[] {
  const normalized = normalizeSportSlug(slug);
  if (!normalized) return [];

  const mapped = SERIES_TO_SPORT[normalized] ?? SERIES_TO_SPORT[slug ?? ""];
  if (mapped) {
    return [
      ...new Set([
        ...sportSlugVariants(mapped),
        normalized,
        ...sportSlugVariants(normalized),
      ]),
    ];
  }

  return sportSlugVariants(normalized);
}

export function activityDisplayName(
  slug: string,
  fallbackName?: string | null,
): string {
  const normalized = normalizeSportSlug(slug);
  if (fallbackName?.trim()) return fallbackName.trim();
  if (SERIES_DISPLAY[normalized]) return SERIES_DISPLAY[normalized];
  const catalog = SPORT_CATALOG.find((sport) => sport.slug === normalized);
  if (catalog) return catalog.name;
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildIntentActivity(input: {
  slug: string;
  name?: string | null;
  kind?: IntentActivityKind;
  sportSlug?: string | null;
}): IntentActivity {
  const slug = normalizeSportSlug(input.slug);
  const mappedSport =
    input.sportSlug?.trim() ||
    SERIES_TO_SPORT[slug] ||
    SERIES_TO_SPORT[input.slug] ||
    slug;
  const kind =
    input.kind ??
    (SERIES_TO_SPORT[slug] || SERIES_TO_SPORT[input.slug] ? "series" : "sport");

  return {
    kind,
    slug,
    name: activityDisplayName(slug, input.name),
    sportSlug: normalizeSportSlug(mappedSport) || slug,
    querySlugs: activityQuerySlugs(slug),
  };
}

/** True when slug is a catalog sport, series alias, or known series display key. */
export function isAllowlistedActivitySlug(slug: string | null | undefined): boolean {
  const normalized = normalizeSportSlug(slug);
  if (!normalized) return false;
  if (SPORT_CATALOG.some((sport) => sport.slug === normalized)) return true;
  if (SERIES_TO_SPORT[normalized] || SERIES_TO_SPORT[slug ?? ""]) return true;
  if (SERIES_DISPLAY[normalized]) return true;
  return false;
}

/** Enforce catalog capabilities so play-only sports are not indexed under /watch. */
export function activitySupportsIntent(
  activity: IntentActivity,
  intent: IntentKind,
): boolean {
  const catalog =
    SPORT_CATALOG.find((sport) => sport.slug === activity.sportSlug) ??
    SPORT_CATALOG.find((sport) => sport.slug === activity.slug);
  if (!catalog) return true; // CMS-only sport/series not in the hub catalog yet.
  return catalog.capabilities.includes(intent);
}
