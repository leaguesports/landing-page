import { sanityImageUrl } from "@/lib/venues/photo";
import { sanityClient } from "@/sanity/client";
import {
  asGuideVenueCoord,
  chooseGuideVenueMediaRows,
  guideVenuePhotoSource,
  type GuideVenueMedia,
  type GuideVenueMediaRow,
} from "@/lib/guides/venueMedia";

const GUIDE_VENUE_MEDIA_QUERY = `*[_type == "venue" && slug.current in $slugs]{
  "slug": slug.current,
  hero_image,
  latitude,
  longitude,
  "suburb": address.suburb->title,
  "sports": sports[]->{ image }
}`;

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

export async function getGuideVenueMedia(
  slugs: readonly string[],
): Promise<Map<string, GuideVenueMedia>> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0 || !isSanityConfigured()) return new Map();

  try {
    const rows = await sanityClient.fetch<GuideVenueMediaRow[]>(
      GUIDE_VENUE_MEDIA_QUERY,
      { slugs: unique },
    );
    const media = new Map<string, GuideVenueMedia>();
    for (const [slug, row] of chooseGuideVenueMediaRows(rows)) {
      const source = guideVenuePhotoSource(row);
      const suburb = typeof row.suburb === "string" ? row.suburb.trim() : "";
      media.set(slug, {
        photoUrl: source
          ? (sanityImageUrl(source, { width: 1200, height: 750 }) ?? null)
          : null,
        latitude: asGuideVenueCoord(row.latitude),
        longitude: asGuideVenueCoord(row.longitude),
        suburb: suburb || null,
      });
    }
    return media;
  } catch (error) {
    console.error("[guides] venue media lookup failed", error);
    return new Map();
  }
}
