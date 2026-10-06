import { SUBURB_COORDINATES } from "@/data/coordinates";
import { toSlug } from "@/data/suburbs";
import { sanityImageUrl } from "@/lib/venues/photo";
import {
  hasVenueCoordinates,
  resolveVenueImage,
  type VenueDetail,
} from "@/services/venues";
import {
  venueProfileCrumbs,
  venueProfileDescription,
  venueProfileFaqs,
  venueProfileKind,
  type VenueProfileKind,
} from "@/lib/venues/profile-seo";

function suburbFallback(venue: VenueDetail): [number, number] | null {
  const suburb = venue.address.suburb?.trim();
  if (!suburb) return null;
  return SUBURB_COORDINATES[toSlug(suburb)] ?? null;
}

type AmenityFeature = {
  "@type": "LocationFeatureSpecification";
  name: string;
  value: true;
};

function schemaType(kind: VenueProfileKind): string | string[] {
  if (kind === "watch") return "BarOrPub";
  if (kind === "play") return "SportsActivityLocation";
  if (kind === "hybrid") return ["SportsActivityLocation", "BarOrPub"];
  return "LocalBusiness";
}

function sameAs(website: string | null | undefined): string | undefined {
  const value = website?.trim() ?? "";
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes(".")) return `https://${value}`;
  return undefined;
}

export function buildVenueJsonLd(venue: VenueDetail, pageUrl: string) {
  const kind = venueProfileKind(venue);
  const image = sanityImageUrl(resolveVenueImage(venue), { width: 1200, height: 630 });
  const coords = hasVenueCoordinates(venue)
    ? ([venue.latitude, venue.longitude] as const)
    : suburbFallback(venue);

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

  const origin = new URL(pageUrl).origin;
  const crumbs = venueProfileCrumbs(venue);
  const website = sameAs(venue.website);
  const place = {
    "@type": schemaType(kind),
    name: venue.name,
    description: venueProfileDescription(venue),
    image: image || undefined,
    url: pageUrl,
    sameAs: website,
    telephone: venue.phone?.trim() || venue.whatsapp?.trim() || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address.street || undefined,
      addressLocality: venue.address.suburb || venue.address.city || undefined,
      addressRegion: venue.address.province || venue.address.city || undefined,
      postalCode: venue.address.postcode || undefined,
      addressCountry: venue.address.country || "ZA",
    },
    geo: coords
      ? {
          "@type": "GeoCoordinates",
          latitude: coords[0],
          longitude: coords[1],
        }
      : undefined,
    amenityFeature: amenityFeature.length > 0 ? amenityFeature : undefined,
  };

  const faqs = venueProfileFaqs(venue);
  const graph: object[] = [
    place,
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: index === crumbs.length - 1 ? pageUrl : new URL(crumb.path, origin).toString(),
      })),
    },
  ];
  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
