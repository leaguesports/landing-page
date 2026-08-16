import type { VenueDetail } from "@/services/venues";
import {
  DEFAULT_MAP_CENTER,
  SUBURB_COORDINATES,
} from "@/data/coordinates";
import { toSlug } from "@/data/suburbs";
import { urlFor } from "@/sanity/client";

function resolveCoords(venue: VenueDetail): [number, number] | null {
  if (
    typeof venue.latitude === "number" &&
    typeof venue.longitude === "number" &&
    !Number.isNaN(venue.latitude) &&
    !Number.isNaN(venue.longitude)
  ) {
    return [venue.latitude, venue.longitude];
  }

  const suburb = venue.address.suburb?.trim();
  if (suburb) {
    const key = toSlug(suburb);
    if (SUBURB_COORDINATES[key]) return SUBURB_COORDINATES[key];
  }

  return null;
}

function resolveImage(venue: VenueDetail): string | undefined {
  const sportImage = venue.sports?.find((s) => s.image)?.image;
  if (sportImage) {
    return urlFor(sportImage)?.width(1200).height(630).fit("crop").url();
  }
  return undefined;
}

type AmenityFeature = {
  "@type": "LocationFeatureSpecification";
  name: string;
  value: true;
};

export function buildVenueJsonLd(venue: VenueDetail, pageUrl: string) {
  const coords = resolveCoords(venue);
  const [lat, lng] = coords ?? DEFAULT_MAP_CENTER;
  const image = resolveImage(venue);

  const amenityFeature: AmenityFeature[] = [];

  if (venue.has_generator_backup) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Generator Backup",
      value: true,
    });
  }
  if (venue.has_big_screens) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "HD Big Screens",
      value: true,
    });
  }
  if (venue.has_live_audio) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Live Commentary",
      value: true,
    });
  }
  if (venue.has_craft_drafts) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Draft Beer",
      value: true,
    });
  }
  if (venue.has_food_menu) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Food Menu",
      value: true,
    });
  }
  if (venue.has_outdoor_area) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Outdoor Area",
      value: true,
    });
  }
  if (venue.has_parking) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "On-site Parking",
      value: true,
    });
  }

  const hasPlaySports = (venue.sports?.length ?? 0) > 0;
  const schemaType = hasPlaySports ? "SportsActivityLocation" : "BarOrPub";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: venue.name,
    image: image || undefined,
    url: venue.website?.trim() || pageUrl,
    telephone: venue.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address.street || undefined,
      addressLocality: venue.address.suburb || venue.address.city || undefined,
      addressRegion: venue.address.province || venue.address.city || undefined,
      postalCode: venue.address.postcode || undefined,
      addressCountry: venue.address.country || "ZA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    },
    amenityFeature: amenityFeature.length > 0 ? amenityFeature : undefined,
    aggregateRating:
      typeof venue.rating === "number"
        ? {
            "@type": "AggregateRating",
            ratingValue: venue.rating,
            bestRating: 5,
          }
        : undefined,
  };
}
