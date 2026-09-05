import {
  SERIES_TO_SPORT,
  SPORT_CATALOG,
  normalizeSportSlug,
} from "../sports/catalog.ts";

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
