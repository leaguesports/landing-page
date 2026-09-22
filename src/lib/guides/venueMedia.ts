import { resolveVenueImage } from "../../services/venueQuery.ts";
import type { SanityImageSource } from "@sanity/image-url";

export type GuideVenueMedia = {
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  suburb: string | null;
};

export type GuideVenueMediaRow = {
  slug?: unknown;
  hero_image?: SanityImageSource | null;
  sports?: Array<{ image?: SanityImageSource | null }> | null;
  latitude?: unknown;
  longitude?: unknown;
  suburb?: unknown;
};

export function asGuideVenueCoord(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export type GuideVenueCardVisual =
  | { kind: "photo"; src: string; initial: string }
  | { kind: "placeholder"; initial: string };

export function guideVenueMarkInitial(suburb: string, name: string): string {
  const source = `${suburb} ${name}`.trim();
  const letter = source.match(/[A-Za-z0-9]/);
  return letter ? letter[0].toUpperCase() : "•";
}

/**
 * Art for a pilot venue card.
 * A Sanity photo becomes a small thumb. Anything else — including coordinates —
 * is a quiet initial. Unkeyed CARTO tiles render "API KEY REQUIRED" and must
 * not be used as card media.
 */
export function guideVenueCardVisual(input: {
  name: string;
  suburb: string;
  media: Pick<GuideVenueMedia, "photoUrl" | "latitude" | "longitude"> | null;
}): GuideVenueCardVisual {
  const initial = guideVenueMarkInitial(input.suburb, input.name);
  const src = input.media?.photoUrl?.trim() ?? "";
  if (src) return { kind: "photo", src, initial };
  return { kind: "placeholder", initial };
}

export function guideVenuePhotoSource(
  row: GuideVenueMediaRow,
): SanityImageSource | undefined {
  return resolveVenueImage({
    hero_image: row.hero_image,
    sports: (row.sports ?? []).flatMap((sport) => {
      if (!sport?.image) return [];
      return [{ _id: "", name: "", image: sport.image }];
    }),
  });
}

function rowScore(row: GuideVenueMediaRow): number {
  const photo = guideVenuePhotoSource(row) ? 2 : 0;
  const coords =
    asGuideVenueCoord(row.latitude) !== null &&
    asGuideVenueCoord(row.longitude) !== null
      ? 1
      : 0;
  return photo + coords;
}

/**
 * One row per slug. Duplicate CMS docs (same slug) prefer a photo, then
 * coordinates. Ties keep the first row.
 */
export function chooseGuideVenueMediaRows(
  rows: readonly GuideVenueMediaRow[] | null | undefined,
): Map<string, GuideVenueMediaRow> {
  const chosen = new Map<string, GuideVenueMediaRow>();
  const scores = new Map<string, number>();
  for (const row of rows ?? []) {
    const slug = typeof row.slug === "string" ? row.slug.trim().toLowerCase() : "";
    if (!slug) continue;
    const score = rowScore(row);
    const previous = scores.get(slug);
    if (previous === undefined || score > previous) {
      chosen.set(slug, row);
      scores.set(slug, score);
    }
  }
  return chosen;
}
