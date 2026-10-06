import type { SanityImageSource } from "@sanity/image-url";

/** Cap the Play snap-strip. Extra CMS images stay off the page. */
export const VENUE_GALLERY_LIMIT = 8;

/**
 * One gallery tile from Sanity `gallery[]`.
 * `alt` is required. `credit` is optional. Not rendered when the list is empty.
 */
export type VenueGalleryImage = {
  image: SanityImageSource;
  alt: string;
  credit?: string | null;
};

function usableAsset(asset: unknown): asset is SanityImageSource {
  if (!asset || typeof asset !== "object") return false;
  const record = asset as {
    _id?: unknown;
    _ref?: unknown;
    url?: unknown;
    asset?: unknown;
  };
  if (typeof record._id === "string" && record._id.trim()) return true;
  if (typeof record._ref === "string" && record._ref.trim()) return true;
  if (typeof record.url === "string" && record.url.trim()) return true;
  return Boolean(record.asset && typeof record.asset === "object");
}

/** Keep tiles that have alt text and an image asset. Drop the rest. Cap at 8. */
export function mapVenueGallery(value: unknown): VenueGalleryImage[] {
  if (!Array.isArray(value)) return [];
  const items: VenueGalleryImage[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as { alt?: unknown; credit?: unknown; asset?: unknown };
    const alt = typeof record.alt === "string" ? record.alt.trim() : "";
    if (!alt || !usableAsset(record.asset)) continue;
    const credit =
      typeof record.credit === "string" && record.credit.trim()
        ? record.credit.trim()
        : null;
    items.push({ image: record.asset, alt, credit });
    if (items.length >= VENUE_GALLERY_LIMIT) break;
  }
  return items;
}
