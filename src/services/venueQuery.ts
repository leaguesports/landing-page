import type { TypedObject } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import type { GolfCourseCms } from "@/types/golf-round";

export type VenueScreening = {
  title: string;
  /** ISO datetime or free-form display string from CMS */
  startsAt: string;
  setupTags?: string[];
};

export type Venue = {
  _id: string;
  name: string;
  slug: string;
  /** Portable Text from Sanity `blockContent`. */
  description: TypedObject[];
  /** Venue hero photo (targeted schema field `hero_image`). */
  hero_image?: SanityImageSource | null;
  address: {
    street: string;
    suburb: string;
    city: string;
    province: string;
    postcode: string;
    country: string;
  };
  /** Play — sports hosted at the venue. */
  sports: {
    _id: string;
    name: string;
    slug?: string | null;
    image: SanityImageSource | undefined;
  }[];
  /** Watch — sports this venue broadcasts. */
  broadcasts: {
    _id: string;
    name: string;
    slug: string;
  }[];
  has_generator_backup?: boolean | null;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  has_craft_drafts?: boolean | null;
  has_food_menu?: boolean | null;
  has_outdoor_area?: boolean | null;
  has_parking?: boolean | null;
  is_verified?: boolean | null;
  claim_status?: "unclaimed" | "claim_pending" | "claimed" | null;
  rating?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  upcoming_screenings?: VenueScreening[] | null;
  /** Hole-by-hole golf scorecard when the venue hosts golf. */
  golfCourse?: GolfCourseCms | null;
};

/** Full venue document for venue detail pages (watch/play from linked sports). */
export type VenueDetail = Venue;

export type VenueRow = {
  _id: string;
  name: string;
  slug: string | null;
  description: TypedObject[] | null;
  hero_image?: SanityImageSource | null;
  address: Venue["address"] | null;
  sports: Venue["sports"] | null;
  broadcasts: Venue["broadcasts"] | null;
  has_generator_backup?: boolean | null;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  has_craft_drafts?: boolean | null;
  has_food_menu?: boolean | null;
  has_outdoor_area?: boolean | null;
  has_parking?: boolean | null;
  is_verified?: boolean | null;
  claim_status?: "unclaimed" | "claim_pending" | "claimed" | null;
  rating?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  upcoming_screenings?: VenueScreening[] | null;
  golfCourse?: GolfCourseCms | null;
};

/**
 * Fields the site reads, named to match issue #7 and existing GROQ.
 *
 * Targeted Sanity Venue schema (cms PR may land in parallel):
 * hero_image (photo field name is locked; no heroImage/hero aliases),
 * latitude/longitude, amenities.*, contact/contactInfo,
 * claim_status, upcoming_screenings, rating; Watch = broadcasts, Play = sports.
 *
 * `select(defined(is_verified) => …)` plus contact/contactInfo coalesce so
 * live documents still populate. CMS fieldsets are not objects, so phone /
 * whatsapp / website also read top-level fields. Explicit `is_verified: false`
 * must not lose a legacy `isVerified: true`.
 */
export const VENUE_PROJECTION = `
  _id,
  name,
  "slug": slug.current,
  description,
  hero_image,
  "phone": coalesce(contact.phone, contactInfo.phone, phone),
  "whatsapp": coalesce(contact.whatsapp, contactInfo.whatsapp, whatsapp),
  "website": coalesce(contact.website, contactInfo.website, website),
  "has_generator_backup": coalesce(amenities.has_generator_backup, has_generator_backup),
  "has_big_screens": coalesce(amenities.has_big_screens, has_big_screens),
  "has_live_audio": coalesce(amenities.has_live_audio, has_live_audio),
  "has_craft_drafts": coalesce(amenities.has_craft_drafts, has_craft_drafts),
  "has_food_menu": coalesce(amenities.has_food_menu, has_food_menu),
  "has_outdoor_area": coalesce(amenities.has_outdoor_area, has_outdoor_area),
  "has_parking": coalesce(amenities.has_parking, has_parking),
  "is_verified": select(defined(is_verified) => is_verified, isVerified),
  claim_status,
  rating,
  latitude,
  longitude,
  upcoming_screenings[]{
    title,
    startsAt,
    setupTags
  },
  "address": {
    "street": address.street,
    "province": address.province,
    "postcode": address.postcode,
    "country": address.country,
    "suburb": address.suburb->title,
    "city": address.city->title
  },
  "sports": sports[]-> {
    _id,
    name,
    image,
    "slug": slug.current,
  },
  "broadcasts": broadcasts[]-> {
    _id,
    name,
    "slug": slug.current,
  },
  golfCourse{
    courseName,
    holesTotal,
    parTotal,
    notes,
    tees[]{
      name,
      color,
      courseRating,
      slope,
      totalMeters
    },
    holes[]{
      number,
      par,
      strokeIndex,
      distances[]{
        teeName,
        meters
      }
    }
  },
`;

/** Match a city or suburb slug on address refs or the venue location ref. */
export const VENUE_IN_LOCATION = `(
  address.suburb->slug.current == $location ||
  address.city->slug.current == $location ||
  location->slug.current == $location ||
  location->parent->slug.current == $location
)`;

/** Slugs to send to GROQ so soccer/football documents both match. */
export function sportSlugVariants(slug: string | null | undefined): string[] {
  if (!slug) return [];
  if (slug === "soccer" || slug === "football") return ["soccer", "football"];
  if (slug === "padel" || slug === "paddle") return ["padel", "paddle"];
  return [slug];
}

function asPortableText(value: unknown): TypedObject[] {
  if (Array.isArray(value)) {
    return value.filter(
      (block): block is TypedObject =>
        Boolean(block) && typeof block === "object",
    );
  }
  return [];
}

export function mapVenueRow(row: VenueRow): VenueDetail | null {
  if (!row.slug) return null;

  return {
    _id: row._id,
    name: row.name,
    slug: row.slug,
    description: asPortableText(row.description),
    hero_image: row.hero_image ?? null,
    address: row.address ?? {
      street: "",
      suburb: "",
      city: "",
      province: "",
      postcode: "",
      country: "",
    },
    sports: row.sports ?? [],
    broadcasts: row.broadcasts ?? [],
    has_generator_backup: row.has_generator_backup ?? null,
    has_big_screens: row.has_big_screens ?? null,
    has_live_audio: row.has_live_audio ?? null,
    has_craft_drafts: row.has_craft_drafts ?? null,
    has_food_menu: row.has_food_menu ?? null,
    has_outdoor_area: row.has_outdoor_area ?? null,
    has_parking: row.has_parking ?? null,
    is_verified: row.is_verified ?? false,
    claim_status: row.claim_status ?? null,
    rating: row.rating ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    // WhatsApp CTA uses `phone`; prefer the dedicated WhatsApp number when set.
    phone: row.whatsapp || row.phone || null,
    website: row.website ?? null,
    upcoming_screenings: (row.upcoming_screenings ?? []).filter(
      (s) => s?.title && s?.startsAt,
    ),
    golfCourse: mapGolfCourse(row.golfCourse),
  };
}

function mapGolfCourse(
  value: GolfCourseCms | null | undefined,
): GolfCourseCms | null {
  if (!value || typeof value !== "object") return null;
  return {
    courseName: value.courseName ?? null,
    holesTotal: value.holesTotal ?? null,
    parTotal: value.parTotal ?? null,
    notes: value.notes ?? null,
    tees: Array.isArray(value.tees) ? value.tees : null,
    holes: Array.isArray(value.holes) ? value.holes : null,
  };
}

/** Same-origin card/hero fallback when CMS has no photo. Allowed by CSP `img-src 'self'`. */
export const VENUE_PLACEHOLDER_IMAGE = "/images/venue-placeholder.svg";

function hasImageAsset(
  source: SanityImageSource | null | undefined,
): source is SanityImageSource {
  if (!source || typeof source !== "object") return false;
  const asset = (source as { asset?: { _ref?: unknown; url?: unknown } }).asset;
  return typeof asset?._ref === "string" || typeof asset?.url === "string";
}

/**
 * Venue photo from `hero_image`, then the first Play sport image.
 * No heroImage/hero aliases and no Watch/broadcasts Unsplash heuristic.
 */
export function resolveVenueImage(
  venue: Pick<Venue, "hero_image"> & { sports?: Venue["sports"] | null },
): SanityImageSource | undefined {
  if (hasImageAsset(venue.hero_image)) return venue.hero_image;
  for (const sport of venue.sports ?? []) {
    if (sport && hasImageAsset(sport.image)) return sport.image;
  }
  return undefined;
}

/** True when the venue document itself has usable map coordinates. */
export function hasVenueCoordinates(
  venue: Pick<Venue, "latitude" | "longitude">,
): venue is Pick<Venue, "latitude" | "longitude"> & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof venue.latitude === "number" &&
    typeof venue.longitude === "number" &&
    Number.isFinite(venue.latitude) &&
    Number.isFinite(venue.longitude)
  );
}
