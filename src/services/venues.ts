import { sanityClient } from "@/sanity/client";
import { SanityImageSource } from "@sanity/image-url";

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
  description: string;
  address: {
    street: string;
    suburb: string;
    city: string;
    province: string;
    postcode: string;
    country: string;
  };
  sports: {
    _id: string;
    name: string;
    image: SanityImageSource | undefined;
  }[];
  broadcasts: {
    _id: string;
    name: string;
    slug: string;
  }[];
  /** SA operational flags — optional until Sanity schema is fully populated */
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
};

/** Full venue document for venue detail pages (watch/play from linked sports). */
export type VenueDetail = Venue & {
  // watch: Activity[];
  // play: Activity[];
};

const VENUE_UTILITY_PROJECTION = `
  phone,
  website,
  has_generator_backup,
  has_big_screens,
  has_live_audio,
  has_craft_drafts,
  has_food_menu,
  has_outdoor_area,
  has_parking,
  is_verified,
  claim_status,
  rating,
  latitude,
  longitude,
  upcoming_screenings[]{
    title,
    startsAt,
    setupTags
  },
`;

function mapVenueRow(row: {
  _id: string;
  name: string;
  slug: string | null;
  description: string | null;
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
  website?: string | null;
  upcoming_screenings?: VenueScreening[] | null;
}): VenueDetail | null {
  if (!row.slug) return null;

  return {
    _id: row._id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
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
    phone: row.phone ?? null,
    website: row.website ?? null,
    upcoming_screenings: (row.upcoming_screenings ?? []).filter(
      (s) => s?.title && s?.startsAt,
    ),
  };
}

export async function listVenues() {
  const venues = await sanityClient.fetch<
    Parameters<typeof mapVenueRow>[0][]
  >(`
    *[_type == "venue"] | order(_createdAt desc) {
      _id,
      name,
      "slug": slug.current,
      description,
      ${VENUE_UTILITY_PROJECTION}
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
      },
      "broadcasts": broadcasts[]-> {
        _id,
        name,
        slug,
      },
    }
    `);

  return venues
    .map(mapVenueRow)
    .filter((v): v is VenueDetail => v !== null);
}

export async function getVenueBySlug(
  slug: string,
): Promise<VenueDetail | null> {
  if (!slug) return null;

  const row = await sanityClient.fetch<Parameters<typeof mapVenueRow>[0] | null>(
    `*[_type == "venue" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      ${VENUE_UTILITY_PROJECTION}
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
      },
      "broadcasts": broadcasts[]-> {
        _id,
        name,
        "slug": slug.current,
      }
    }`,
    { slug },
  );

  if (!row) return null;
  return mapVenueRow(row);
}
