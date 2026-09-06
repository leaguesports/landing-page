/** Public `/guides/{slug}` helpers shared by index, homepage, and detail lookup. */

const GUIDE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GUIDE_SLUG_MAX = 96;

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

/**
 * Map a requested URL token to a stored `slug.current`.
 * Exact slug wins; otherwise a unique title-derived slug is accepted.
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

  const titleHits = usable.filter((row) => {
    const title = typeof row.title === "string" ? row.title : "";
    return title.length > 0 && slugifyGuideTitle(title) === needle;
  });
  if (titleHits.length === 1 && typeof titleHits[0]?.slug === "string") {
    return titleHits[0].slug;
  }

  return null;
}
