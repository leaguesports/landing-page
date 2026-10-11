import { sanityClient } from "@/sanity/client";
import {
  FEATURED_HOME_VENUE_MIN,
  selectFeaturedHomeVenues,
  type FeaturedHomeVenue,
} from "@/lib/venues/featured-home";
import { scoreboardHeroImage } from "@/lib/venues/gallery";
import { sanityImageUrl } from "@/lib/venues/photo";
import {
  VENUE_NAME_SEARCH_FETCH_LIMIT,
  VENUE_NAME_SEARCH_HAYSTACK,
  capVenueNameSearchResults,
  rankVenueNameHits,
  venueNameMatchTerm,
} from "@/lib/search/nameSearch";
import {
  VENUE_HUB_RECOMMENDED_FETCH_LIMIT,
  VENUE_HUB_RECOMMENDED_LIMIT,
  dedupeVenuesBySlug,
  rankRecommendedVenues,
  type VenueHubSearchHit,
} from "@/lib/venues/hub";
import {
  VENUE_IN_LOCATION,
  mapVenueRow,
  type VenueDetail,
  type VenueRow,
} from "./venueQuery";

/** Card fields only — no Portable Text description, no golfCourse holes/tees. */
export const VENUE_HUB_CARD_PROJECTION = `
  _id,
  name,
  "slug": slug.current,
  hero_image,
  rating,
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
  "address": {
    "suburb": address.suburb->title,
    "city": address.city->title
  },
  "sports": sports[]-> {
    _id,
    name,
    image,
    "slug": slug.current
  },
  "broadcasts": broadcasts[]-> {
    _id,
    name,
    "slug": slug.current
  }
`;

export const VENUE_HUB_SEARCH_QUERY = `*[
  _type == "venue"
  && defined(slug.current)
  && defined(name)
  && ${VENUE_NAME_SEARCH_HAYSTACK} match $term
] | order(name asc) [0...${VENUE_NAME_SEARCH_FETCH_LIMIT}] {
  _id,
  name,
  "slug": slug.current,
  "city": coalesce(address.city->title, address.suburb->title, location->parent->title, location->title)
}`;

export const VENUE_HUB_RECOMMENDED_QUERY = `*[
  _type == "venue"
  && defined(slug.current)
  && defined(name)
  && ($location == "" || ${VENUE_IN_LOCATION})
] | order(
  select(
    defined(hero_image.asset) => 0,
    count(sports[defined(@->image.asset)]) > 0 => 1,
    2
  ) asc,
  coalesce(rating, 0) desc,
  name asc
) [0...${VENUE_HUB_RECOMMENDED_FETCH_LIMIT}] {
  ${VENUE_HUB_CARD_PROJECTION}
}`;

/** Over-fetch before the alt-text filter drops a gallery tile. */
const FEATURED_HOME_VENUE_FETCH_LIMIT = 24;

export const FEATURED_HOME_VENUES_QUERY = `*[
  _type == "venue"
  && defined(slug.current)
  && defined(name)
  && (
    defined(hero_image.asset)
    || count(gallery[defined(asset)]) > 0
  )
] | order(coalesce(rating, 0) desc, name asc) [0...${FEATURED_HOME_VENUE_FETCH_LIMIT}] {
  _id,
  name,
  "slug": slug.current,
  hero_image,
  rating,
  gallery[]{
    alt,
    credit,
    asset->{
      _id,
      url
    }
  },
  "address": {
    "suburb": address.suburb->title,
    "city": address.city->title
  },
  "sports": sports[]-> {
    _id,
    name,
    image,
    "slug": slug.current
  }
}`;

export const VENUE_HUB_CITIES_BY_SLUG_QUERY = `*[
  _type == "venue"
  && slug.current in $slugs
] [0...12] {
  "slug": slug.current,
  "citySlug": coalesce(
    address.city->slug.current,
    location->parent->slug.current,
    location->slug.current
  )
}`;

type SearchRow = {
  _id?: unknown;
  name?: unknown;
  slug?: unknown;
  city?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSearchHit(row: SearchRow): VenueHubSearchHit | null {
  const cmsId = asString(row._id);
  const name = asString(row.name);
  const slug = asString(row.slug);
  if (!cmsId || !name || !slug) return null;
  return {
    cmsId,
    name,
    slug,
    city: asString(row.city) || null,
  };
}

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

/** Name/slug typeahead — capped GROQ, never the full catalog. */
export async function searchVenuesByName(
  query: string,
): Promise<VenueHubSearchHit[]> {
  const term = venueNameMatchTerm(query);
  if (!term || !isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<SearchRow[]>(VENUE_HUB_SEARCH_QUERY, {
      term,
    });
    const hits = (rows ?? [])
      .map(toSearchHit)
      .filter((item): item is VenueHubSearchHit => item !== null);
    return capVenueNameSearchResults(rankVenueNameHits(hits, query));
  } catch (error) {
    console.error("[venues-hub] name search failed", error);
    throw error;
  }
}

export async function getRecommendedVenues(options: {
  locationSlug?: string | null;
  limit?: number;
} = {}): Promise<VenueDetail[]> {
  if (!isSanityConfigured()) return [];

  const location = options.locationSlug?.trim() || "";
  const limit = options.limit ?? VENUE_HUB_RECOMMENDED_LIMIT;

  try {
    const rows = await sanityClient.fetch<VenueRow[]>(
      VENUE_HUB_RECOMMENDED_QUERY,
      { location },
    );
    const mapped = (rows ?? [])
      .map(mapVenueRow)
      .filter((venue): venue is VenueDetail => venue !== null);
    return dedupeVenuesBySlug(rankRecommendedVenues(mapped)).slice(0, limit);
  } catch (error) {
    console.error("[venues-hub] recommended fetch failed", error);
    return [];
  }
}

function featuredHomePlace(venue: VenueDetail): string | null {
  const suburb = venue.address.suburb?.trim() ?? "";
  const city = venue.address.city?.trim() ?? "";
  if (suburb && city && suburb.toLowerCase() !== city.toLowerCase()) {
    return `${suburb}, ${city}`;
  }
  return suburb || city || null;
}

function toFeaturedHomeVenue(venue: VenueDetail): FeaturedHomeVenue | null {
  const image = scoreboardHeroImage(venue);
  if (!image) return null;
  const imageUrl = sanityImageUrl(image, { width: 960, height: 600 });
  if (!imageUrl) return null;
  const fromGallery = image === venue.gallery?.[0]?.image;
  const sports = venue.sports
    .map((sport) => {
      const name = sport.name?.trim() ?? "";
      const slug = sport.slug?.trim() || name.toLowerCase().replace(/\s+/g, "-");
      if (!name || !slug) return null;
      return { slug, name };
    })
    .filter((sport): sport is { slug: string; name: string } => sport !== null)
    .slice(0, 3);
  return {
    slug: venue.slug,
    name: venue.name,
    place: featuredHomePlace(venue),
    sports,
    imageUrl,
    imageAlt: (fromGallery ? venue.gallery?.[0]?.alt : venue.name) || venue.name,
  };
}

const VENUE_CARDS_BY_SLUG_QUERY = `*[
  _type == "venue"
  && slug.current in $slugs
] {
  _id,
  name,
  "slug": slug.current,
  hero_image,
  gallery[]{
    alt,
    credit,
    asset->{
      _id,
      url
    }
  },
  "address": {
    "suburb": address.suburb->title,
    "city": address.city->title
  },
  "sports": sports[]-> {
    _id,
    name,
    image,
    "slug": slug.current
  }
}`;

function venueCardFromDetail(venue: VenueDetail): FeaturedHomeVenue | null {
  const slug = venue.slug.trim();
  const name = venue.name.trim();
  if (!slug || !name) return null;
  const image = scoreboardHeroImage(venue);
  const imageUrl = image ? sanityImageUrl(image, { width: 960, height: 600 }) ?? "" : "";
  const fromGallery = image === venue.gallery?.[0]?.image;
  const sports = venue.sports
    .map((sport) => {
      const sportName = sport.name?.trim() ?? "";
      const sportSlug = sport.slug?.trim() || sportName.toLowerCase().replace(/\s+/g, "-");
      if (!sportName || !sportSlug) return null;
      return { slug: sportSlug, name: sportName };
    })
    .filter((sport): sport is { slug: string; name: string } => sport !== null)
    .slice(0, 3);
  return {
    slug,
    name,
    place: featuredHomePlace(venue),
    sports,
    imageUrl,
    imageAlt: (fromGallery ? venue.gallery?.[0]?.alt : name) || name,
  };
}

/** Home-style cards for a known slug list. Order follows `slugs`. Missing photos stay on the card. */
export async function getVenueCardsBySlugs(
  slugs: readonly string[],
): Promise<FeaturedHomeVenue[]> {
  const wanted = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))].slice(0, 8);
  if (wanted.length === 0 || !isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<VenueRow[]>(VENUE_CARDS_BY_SLUG_QUERY, {
      slugs: wanted,
    });
    const bySlug = new Map<string, FeaturedHomeVenue>();
    for (const row of rows ?? []) {
      const detail = mapVenueRow({
        ...row,
        _id: row._id || row.slug || "",
        name: row.name || "",
        description: null,
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
      });
      if (!detail) continue;
      const card = venueCardFromDetail(detail);
      if (card) bySlug.set(card.slug, card);
    }
    return wanted.flatMap((slug) => {
      const card = bySlug.get(slug);
      return card ? [card] : [];
    });
  } catch (error) {
    console.error("[events] venue cards fetch failed", error);
    return [];
  }
}

/** Photo venues for the home row. Sport artwork never qualifies. */
export async function getFeaturedHomeVenues(): Promise<FeaturedHomeVenue[]> {
  if (!isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<VenueRow[]>(FEATURED_HOME_VENUES_QUERY);
    const mapped = (rows ?? [])
      .map(mapVenueRow)
      .filter((venue): venue is VenueDetail => venue !== null);
    const cards = selectFeaturedHomeVenues(mapped)
      .map(toFeaturedHomeVenue)
      .filter((venue): venue is FeaturedHomeVenue => venue !== null);
    return cards.length >= FEATURED_HOME_VENUE_MIN ? cards : [];
  } catch (error) {
    console.error("[home] featured venues fetch failed", error);
    return [];
  }
}

export async function getVenueCitiesBySlugs(
  slugs: string[],
): Promise<Array<{ slug: string; citySlug: string | null }>> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0 || !isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<
      Array<{ slug?: unknown; citySlug?: unknown }>
    >(VENUE_HUB_CITIES_BY_SLUG_QUERY, { slugs: unique.slice(0, 12) });
    return (rows ?? [])
      .map((row) => {
        const slug = asString(row.slug);
        if (!slug) return null;
        return { slug, citySlug: asString(row.citySlug) || null };
      })
      .filter((item): item is { slug: string; citySlug: string | null } =>
        Boolean(item),
      );
  } catch (error) {
    console.error("[venues-hub] followed city lookup failed", error);
    return [];
  }
}
