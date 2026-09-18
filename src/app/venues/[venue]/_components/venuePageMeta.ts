import { missingObjectOgTitle } from "@/lib/conversion/deep-links";
import { toGolfVenueOption } from "@/lib/golf/venue-options";
import {
  venueDetailKind,
  venueDetailMetaDescription,
} from "@/lib/venues/detail-ia";
import { sanityImageUrl } from "@/lib/venues/photo";
import { venueQuickStartActivities } from "@/lib/venues/quick-start";
import {
  getVenueBySlug,
  resolveVenueImage,
  type VenueDetail,
} from "@/services/venues";
import type { Metadata } from "next";

export function getVenuePageBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://leaguesports.co.za";
}

export function venueOgImageUrl(
  venue: Pick<VenueDetail, "hero_image" | "sports">,
  width: number,
  height: number,
): string | undefined {
  return sanityImageUrl(resolveVenueImage(venue), { width, height });
}

export function buildVenueMapsUrl(venue: VenueDetail): string {
  const query = [
    venue.name,
    venue.address.street,
    venue.address.suburb,
    venue.address.city,
  ]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || venue.name)}`;
}

export async function venuePageMetadata(
  slug: string,
): Promise<Metadata> {
  const venue = await getVenueBySlug(slug);
  if (!venue) {
    return {
      title: missingObjectOgTitle("venue", slug),
      robots: { index: false, follow: false },
    };
  }
  const title = `${venue.name}`;
  const canonicalPath = `/venues/${venue.slug}`;
  const baseUrl = getVenuePageBaseUrl();
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const suburb = venue.address.suburb;
  const quickStartActivities = venueQuickStartActivities(
    toGolfVenueOption(venue),
  );
  const kind = venueDetailKind(venue, quickStartActivities.length > 0);
  const description = venueDetailMetaDescription({
    name: venue.name,
    suburb,
    kind,
  });
  const ogImage = venueOgImageUrl(venue, 1200, 630);

  return {
    title,
    description,
    keywords: [
      venue.name,
      suburb,
      "Venues",
      "Sports",
      "LeagueSports",
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "LeagueSports",
      type: "website",
      locale: "en_ZA",
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: venue.name }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
