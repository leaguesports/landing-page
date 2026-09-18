import {
  VenueContactActions,
  VenueUtilityBadges,
} from "@/components/VenueUtilityBadges";
import { ConversionKit } from "@/components/conversion/ConversionKit";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { selectCtaMatrix } from "@/lib/conversion/cta-matrix";
import { missingObjectOgTitle } from "@/lib/conversion/deep-links";
import { toGolfVenueOption } from "@/lib/golf/venue-options";
import { isVenueClaimable, hasVenueWhatsAppContact, resolveVenueWhatsAppCta } from "@/lib/venues/contact-cta";
import { ensureVenueFromCms } from "@/lib/venues/appVenueApi";
import {
  venueDetailChrome,
  venueDetailKind,
  venueDetailMetaDescription,
  venueDetailNavLinks,
  venueSportsSectionCopy,
} from "@/lib/venues/detail-ia";
import {
  isRemoteVenuePhoto,
  sanityImageUrl,
  venuePhotoUrl,
} from "@/lib/venues/photo";
import { venueQuickStartActivities } from "@/lib/venues/quick-start";
import {
  getVenueBySlug,
  resolveVenueImage,
  type VenueDetail,
} from "@/services/venues";
import { ChevronRight, MapPin, Star } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { after } from "next/server";
import { VenueFollowButton } from "./_components/VenueFollowButton";
import { VenuePageSections } from "./_components/VenuePageSections";
import { buildVenueJsonLd } from "./_components/venueJsonLd";

type Props = {
  params: Promise<{ venue: string }>;
  searchParams: Promise<{ board?: string | string[]; window?: string | string[] }>;
};

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://leaguesports.co.za";
}

function venueOgImageUrl(
  venue: Pick<VenueDetail, "hero_image" | "sports">,
  width: number,
  height: number,
): string | undefined {
  return sanityImageUrl(resolveVenueImage(venue), { width, height });
}

function buildMapsUrl(venue: VenueDetail): string {
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
