import type { VenueDetail } from "@/services/venues";
import {
  DEFAULT_MAP_CENTER,
  SUBURB_COORDINATES,
} from "@/data/coordinates";
import { toSlug } from "@/data/suburbs";

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

export function buildVenueJsonLd(venue: VenueDetail, pageUrl: string) {
  const coords = resolveCoords(venue);
  const [lat, lng] = coords ?? DEFAULT_MAP_CENTER;

  const amenityFeature: { "@type": "LocationFeatureSpecification"; name: string }[] =
    [];

  if (venue.has_generator_backup) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Generator / Inverter Backup",
    });
  }
  if (venue.has_big_screens) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "HD Big Screens",
    });
  }
  if (venue.has_live_audio) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Live Commentary",
    });
  }
  if (venue.has_craft_drafts) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Draft Beer",
    });
  }
  if (venue.has_food_menu) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Food Menu",
    });
  }
  if (venue.has_outdoor_area) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "Outdoor Area",
    });
  }
  if (venue.has_parking) {
    amenityFeature.push({
      "@type": "LocationFeatureSpecification",
      name: "On-site Parking",
    });
  }

  const streetAddress = [venue.address.street, venue.address.suburb]
    .filter(Boolean)
    .join(", ");

  const hasPlaySports = (venue.sports?.length ?? 0) > 0;
  const schemaType = hasPlaySports ? "SportsActivityLocation" : "BarOrPub";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: venue.name,
    url: pageUrl,
    telephone: venue.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: streetAddress || undefined,
      addressLocality: venue.address.city || venue.address.suburb || undefined,
      addressRegion: venue.address.province || undefined,
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
