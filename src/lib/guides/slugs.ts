/** Public `/guides/{slug}` helpers shared by index, homepage, and detail lookup. */

const GUIDE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GUIDE_SLUG_MAX = 96;
/** Short tokens like `best` or `claim` are too easy to collide; require this for prefix guesses. */
const GUIDE_PREFIX_MIN = 8;

export type GuideSlugCandidate = {
  slug?: unknown;
  title?: unknown;
};

export function isGuideSlug(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value !== value.trim()) return false;
  if (!value || value.length > GUIDE_SLUG_MAX) return false;
  if (value === "undefined" || value === "null") return false;
  return GUIDE_SLUG_RE.test(value);
}

/**
 * Sanity Studio-style slug from a guide title (`source: "title"`, max 96).
 * Used to resolve shareable / title-derived URLs to the stored `slug.current`.
 */
export function slugifyGuideTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’′`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, GUIDE_SLUG_MAX);
}

export function guideHref(slug: string): string {
  return `/guides/${slug}`;
}

export function publishedGuides<T extends { slug?: unknown }>(
  rows: T[] | null | undefined,
): Array<T & { slug: string }> {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row): row is T & { slug: string } => isGuideSlug(row.slug));
}

function titleSlugOf(row: GuideSlugCandidate): string | null {
  const title = typeof row.title === "string" ? row.title : "";
  if (!title) return null;
  const derived = slugifyGuideTitle(title);
  return isGuideSlug(derived) ? derived : null;
}

/**
 * Unique prefix of a published/title slug. Hyphen-boundary (`requested-…`)
 * or a safe unique prefix (min length ≥ 8). `ambiguous` when two aliases share it.
 */
function uniquePrefixHit(
  needle: string,
  aliases: ReadonlyArray<string>,
): { hit: string | null; ambiguous: boolean } {
  if (!isGuideSlug(needle) || needle.length < GUIDE_PREFIX_MIN) {
    return { hit: null, ambiguous: false };
  }

  const hyphenHits = aliases.filter((alias) => alias.startsWith(`${needle}-`));
  if (hyphenHits.length > 1) return { hit: null, ambiguous: true };
  if (hyphenHits.length === 1) {
    return { hit: hyphenHits[0] ?? null, ambiguous: false };
  }

  const prefixHits = aliases.filter(
    (alias) => alias !== needle && alias.startsWith(needle),
  );
  if (prefixHits.length > 1) return { hit: null, ambiguous: true };
  if (prefixHits.length === 1) {
    return { hit: prefixHits[0] ?? null, ambiguous: false };
  }
  return { hit: null, ambiguous: false };
}

/**
 * Map a requested URL token to a stored `slug.current`.
 * Exact slug wins, then a unique title-derived slug, then a unique prefix.
 */
export function resolveGuideSlug(
  requested: string,
  candidates: ReadonlyArray<GuideSlugCandidate>,
): string | null {
  const needle =
    typeof requested === "string" ? requested.trim().toLowerCase() : "";
  if (!isGuideSlug(needle)) return null;

  const usable = candidates.filter((row) => isGuideSlug(row.slug));
  const exact = usable.find((row) => row.slug === needle);
  if (exact && typeof exact.slug === "string") return exact.slug;

  const titleHits = usable.filter((row) => titleSlugOf(row) === needle);
  if (titleHits.length === 1 && typeof titleHits[0]?.slug === "string") {
    return titleHits[0].slug;
  }

  const storedAliases = usable.map((row) => row.slug as string);
  const storedPrefix = uniquePrefixHit(needle, storedAliases);
  if (storedPrefix.ambiguous) return null;
  if (storedPrefix.hit) return storedPrefix.hit;

  const titleAliases = usable
    .map((row) => titleSlugOf(row))
    .filter((alias): alias is string => alias !== null);
  const titlePrefix = uniquePrefixHit(needle, titleAliases);
  if (titlePrefix.ambiguous) return null;
  if (titlePrefix.hit) {
    const titleRow = usable.find((row) => titleSlugOf(row) === titlePrefix.hit);
    if (titleRow && typeof titleRow.slug === "string") return titleRow.slug;
  }

  return null;
}
