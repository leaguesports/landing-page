import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { selectCtaMatrix } from "@/lib/conversion/cta-matrix";
import { toGolfVenueOption } from "@/lib/golf/venue-options";
import { ensureVenueFromCms } from "@/lib/venues/appVenueApi";
import {
  isVenueClaimable,
  hasVenueWhatsAppContact,
  resolveVenueWhatsAppCta,
} from "@/lib/venues/contact-cta";
import {
  venueDetailChrome,
  venueDetailKind,
  venueDetailNavLinks,
  venueSportsSectionCopy,
} from "@/lib/venues/detail-ia";
import { venuePhotoUrl } from "@/lib/venues/photo";
import { venueQuickStartActivities } from "@/lib/venues/quick-start";
import { getVenueBySlug } from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { after } from "next/server";
import { VenuePageHero } from "./_components/VenuePageHero";
import { VenuePageSections } from "./_components/VenuePageSections";
import {
  buildVenueMapsUrl,
  getVenuePageBaseUrl,
  venuePageMetadata,
} from "./_components/venuePageMeta";
import { buildVenueJsonLd } from "./_components/venueJsonLd";

type Props = {
  params: Promise<{ venue: string }>;
  searchParams: Promise<{ board?: string | string[]; window?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue: slug } = await params;
  return venuePageMetadata(slug);
}

export default async function VenuePage({ params, searchParams }: Props) {
  const { venue: venueSlug } = await params;
  const query = await searchParams;
  const initialBoard = Array.isArray(query.board) ? query.board[0] : query.board;
  const initialWindow = Array.isArray(query.window)
    ? query.window[0]
    : query.window;
  const venue = await getVenueBySlug(venueSlug);
  if (!venue) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <DeepLinkRecovery kind="venue" objectName={venueSlug} />
      </div>
    );
  }

  const cookie = (await cookies()).toString();
  after(() =>
    ensureVenueFromCms(
      { cmsId: venue._id, name: venue.name, slug: venue.slug },
      { cookie },
    ),
  );

  const mapsSearchUrl = buildVenueMapsUrl(venue);
  const pageUrl = `${getVenuePageBaseUrl()}/venues/${venue.slug}`;
  const jsonLd = buildVenueJsonLd(venue, pageUrl);
  const suburbLine = [venue.address.suburb, venue.address.city]
    .filter(Boolean)
    .join(", ");
  const showClaimBar = isVenueClaimable(venue);
  const addressLine = [
    venue.address.street,
    venue.address.suburb,
    venue.address.city,
    venue.address.province,
  ]
    .filter(Boolean)
    .join(", ");
  const heroImageUrl = venuePhotoUrl(venue, { width: 1920, height: 1080 });
  const quickStartActivities = venueQuickStartActivities(
    toGolfVenueOption(venue),
  );
  const primaryQuickStart = quickStartActivities[0];
  const hasQuickStart = quickStartActivities.length > 0;
  const kind = venueDetailKind(venue, hasQuickStart);
  const chrome = venueDetailChrome(kind, venue.sports.length);
  const navLinks = venueDetailNavLinks({ kind, hasQuickStart });
  const sportsCopy = venueSportsSectionCopy(kind);
  const citySlug = (venue.address.city || venue.address.suburb || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const whatsApp = resolveVenueWhatsAppCta(venue);
  const matrix = selectCtaMatrix({
    pageType: "venue",
    sport: primaryQuickStart?.sportSlug ?? venue.sports[0]?.slug ?? null,
    city: citySlug || null,
    venueSlug: venue.slug,
    hasScorecard: quickStartActivities.length > 0,
    hasDirections: true,
    directionsHref: mapsSearchUrl,
    hasWhatsApp: hasVenueWhatsAppContact(venue) && whatsApp.kind === "whatsapp",
    whatsAppHref: whatsApp.kind === "whatsapp" ? whatsApp.href : null,
  });

  return (
    <div>
      <DeepLinkLand pageType="venue" slug={venue.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0c0f0c] pb-24 text-white">
        <nav className="sticky top-16 z-40 border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 overflow-x-auto px-4 scrollbar-hide sm:px-6 lg:px-8">
            <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-brand)] px-3.5 py-1.5 text-xs font-semibold text-zinc-950">
              Venue
            </span>
            <span className="hidden max-w-48 truncate text-sm text-zinc-400 sm:inline">
              {venue.name}
            </span>
            <div className="ml-auto flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/6 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <VenuePageHero
          venue={venue}
          suburbLine={suburbLine}
          heroImageUrl={heroImageUrl}
          matrix={matrix}
          sportSlug={primaryQuickStart?.sportSlug}
          citySlug={citySlug}
          mapsSearchUrl={mapsSearchUrl}
        />

        <VenuePageSections
          venue={venue}
          kind={kind}
          chrome={chrome}
          sportsCopy={sportsCopy}
          quickStartActivities={quickStartActivities}
          primaryQuickStart={primaryQuickStart}
          mapsSearchUrl={mapsSearchUrl}
          addressLine={addressLine}
          citySlug={citySlug}
          initialBoard={initialBoard}
          initialWindow={initialWindow}
          showClaimBar={showClaimBar}
        />
      </div>
    </div>
  );
}
