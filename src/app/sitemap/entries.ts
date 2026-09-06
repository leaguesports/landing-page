import { guideHref, isGuideSlug } from "../../lib/guides/slugs.ts";

export const SITEMAP_FALLBACK_ORIGIN = "https://leaguesports.co.za";

/** Path-only slugs Next can serialize without breaking sitemap XML. */
const SLUG_PATTERN = /^[A-Za-z0-9._~-]+$/;

export type IntentKind = "watch" | "play";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
};

export type SitemapVenueRow = {
  slug?: unknown;
  updatedAt?: unknown;
};

export type SitemapGuideRow = {
  slug?: unknown;
  updatedAt?: unknown;
};

export type SitemapIntentPair = {
  activitySlug?: unknown;
  locationSlug?: unknown;
  updatedAt?: unknown;
};

export type SitemapFixtureRow = {
  slug?: unknown;
  startsAt?: unknown;
};

export type SitemapDataSource = {
  getVenues: () => Promise<SitemapVenueRow[]>;
  getGuides: () => Promise<SitemapGuideRow[]>;
  getIntentPairs: (intent: IntentKind) => Promise<SitemapIntentPair[]>;
  getFixtures: () => Promise<SitemapFixtureRow[]>;
};

const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/events", changeFrequency: "daily", priority: 0.95 },
  { path: "/venues", changeFrequency: "daily", priority: 1 },
  { path: "/watch", changeFrequency: "daily", priority: 0.95 },
  { path: "/play", changeFrequency: "daily", priority: 0.95 },
  { path: "/communities", changeFrequency: "weekly", priority: 0.8 },
  { path: "/athletes", changeFrequency: "weekly", priority: 0.85 },
  { path: "/guides", changeFrequency: "weekly", priority: 0.8 },
  { path: "/integrations", changeFrequency: "weekly", priority: 0.7 },
];

export function resolveSitemapOrigin(raw?: string | null): string {
  const candidate = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  if (!candidate) return SITEMAP_FALLBACK_ORIGIN;

  try {
    const withProtocol = candidate.includes("://")
      ? candidate
      : `https://${candidate}`;
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return SITEMAP_FALLBACK_ORIGIN;
    }
    if (!url.hostname) return SITEMAP_FALLBACK_ORIGIN;
    if (url.hostname !== "localhost" && !url.hostname.includes(".")) {
      return SITEMAP_FALLBACK_ORIGIN;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return SITEMAP_FALLBACK_ORIGIN;
  }
}

export function isSitemapSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_PATTERN.test(value);
}

export function toSitemapDate(
  value: string | Date | null | undefined,
  fallback: Date,
): Date {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : value;
  }
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

/**
 * Build an absolute path URL. Query strings are rejected: Next.js sitemap
 * serialization does not XML-escape `&`, which yields invalid XML (and can 500).
 */
export function sitemapAbsoluteUrl(
  origin: string,
  path: string,
): string | null {
  if (typeof path !== "string" || !path.startsWith("/")) return null;
  if (/[?#\s]/.test(path)) return null;

  const base = resolveSitemapOrigin(origin);
  try {
    const url = new URL(path, `${base}/`);
    if (url.origin !== base) return null;
    if (url.search || url.hash) return null;
    if (path === "/") return base;
    return `${base}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function sitemapEntry(
  url: string | null,
  options: {
    lastModified: Date;
    changeFrequency: SitemapChangeFrequency;
    priority: number;
  },
): SitemapEntry | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (parsed.search || parsed.hash) return null;
    if (/[<>&\s]/.test(url)) return null;
  } catch {
    return null;
  }

  const lastModified = toSitemapDate(options.lastModified, new Date());
  return {
    url,
    lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
  };
}

function intentHubPath(
  intent: IntentKind,
  activitySlug: string,
  locationSlug: string,
): string {
  return `/${intent}/${activitySlug}/${locationSlug}`;
}

export function staticSitemapRoutes(
  origin: string,
  now: Date,
): SitemapEntry[] {
  return STATIC_PATHS.flatMap((route) => {
    const entry = sitemapEntry(sitemapAbsoluteUrl(origin, route.path), {
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
    return entry ? [entry] : [];
  });
}

function collectRows<T>(rows: unknown): T[] {
  return Array.isArray(rows)
    ? rows.filter((row) => row && typeof row === "object")
    : [];
}

export function venueSitemapRoutes(
  origin: string,
  rows: unknown,
  now: Date,
): SitemapEntry[] {
  const routes: SitemapEntry[] = [];
  for (const row of collectRows<SitemapVenueRow>(rows)) {
    if (!isSitemapSlug(row.slug)) continue;
    const entry = sitemapEntry(sitemapAbsoluteUrl(origin, `/venues/${row.slug}`), {
      lastModified: toSitemapDate(
        typeof row.updatedAt === "string" ? row.updatedAt : null,
        now,
      ),
      changeFrequency: "daily",
      priority: 0.9,
    });
    if (entry) routes.push(entry);
  }
  return routes;
}

export function guideSitemapRoutes(
  origin: string,
  rows: unknown,
  now: Date,
): SitemapEntry[] {
  const routes: SitemapEntry[] = [];
  for (const row of collectRows<SitemapGuideRow>(rows)) {
    if (!isGuideSlug(row.slug)) continue;
    const entry = sitemapEntry(sitemapAbsoluteUrl(origin, guideHref(row.slug)), {
      lastModified: toSitemapDate(
        typeof row.updatedAt === "string" ? row.updatedAt : null,
        now,
      ),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    if (entry) routes.push(entry);
  }
  return routes;
}

export function intentSitemapRoutes(
  origin: string,
  intent: IntentKind,
  rows: unknown,
  now: Date,
): SitemapEntry[] {
  const routes: SitemapEntry[] = [];
  for (const row of collectRows<SitemapIntentPair>(rows)) {
    if (!isSitemapSlug(row.activitySlug) || !isSitemapSlug(row.locationSlug)) {
      continue;
    }
    const path = intentHubPath(intent, row.activitySlug, row.locationSlug);
    const entry = sitemapEntry(sitemapAbsoluteUrl(origin, path), {
      lastModified: toSitemapDate(
        typeof row.updatedAt === "string" ? row.updatedAt : null,
        now,
      ),
      changeFrequency: "daily",
      priority: 1,
    });
    if (entry) routes.push(entry);
  }
  return routes;
}

export function fixtureSitemapRoutes(
  origin: string,
  rows: unknown,
  now: Date,
): SitemapEntry[] {
  const routes: SitemapEntry[] = [];
  for (const row of collectRows<SitemapFixtureRow>(rows)) {
    if (!isSitemapSlug(row.slug)) continue;
    const entry = sitemapEntry(sitemapAbsoluteUrl(origin, `/events/${row.slug}`), {
      lastModified: toSitemapDate(
        typeof row.startsAt === "string" ? row.startsAt : null,
        now,
      ),
      changeFrequency: "daily",
      priority: 0.9,
    });
    if (entry) routes.push(entry);
  }
  return routes;
}

export async function buildSitemapEntries(options: {
  baseUrl?: string | null;
  now?: Date;
  source?: Partial<SitemapDataSource>;
}): Promise<SitemapEntry[]> {
  const now = options.now ?? new Date();
  const origin = resolveSitemapOrigin(options.baseUrl);
  const fallback = staticSitemapRoutes(origin, now);

  try {
    const source = options.source ?? {};
    const empty = async () => [];
    const [venues, guides, watchPairs, playPairs, fixtures] = await Promise.all([
      Promise.resolve()
        .then(() => (source.getVenues ?? empty)())
        .catch(() => []),
      Promise.resolve()
        .then(() => (source.getGuides ?? empty)())
        .catch(() => []),
      Promise.resolve()
        .then(() => (source.getIntentPairs ?? empty)("watch"))
        .catch(() => []),
      Promise.resolve()
        .then(() => (source.getIntentPairs ?? empty)("play"))
        .catch(() => []),
      Promise.resolve()
        .then(() => (source.getFixtures ?? empty)())
        .catch(() => []),
    ]);

    const seen = new Set<string>();
    const merged: SitemapEntry[] = [];

    for (const entry of [
      ...fallback,
      ...intentSitemapRoutes(origin, "watch", watchPairs, now),
      ...intentSitemapRoutes(origin, "play", playPairs, now),
      ...guideSitemapRoutes(origin, guides, now),
      ...venueSitemapRoutes(origin, venues, now),
      ...fixtureSitemapRoutes(origin, fixtures, now),
    ]) {
      if (seen.has(entry.url)) continue;
      seen.add(entry.url);
      merged.push(entry);
    }

    return merged;
  } catch (error) {
    console.error("[sitemap] generation failed", error);
    return fallback;
  }
}
