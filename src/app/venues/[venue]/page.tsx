import { missingObjectOgTitle } from "@/lib/conversion/deep-links";
import { sanityImageUrl } from "@/lib/venues/photo";
import { PLAY_RESULTS_SPORT_SLUGS } from "@/lib/venues/play-chrome";
import {
  venueProfileDescription,
  venueProfileKeywords,
  venueProfileKind,
  venueProfileTitle,
} from "@/lib/venues/profile-seo";
import { loadEventKickoffs } from "@/lib/venues/event-kickoffs";
import { lookupVenueLockedResults } from "@/lib/venues/locked-results";
import { venueDistinctPlaySports } from "@/lib/venues/page-template";
import {
  buildWatchVenueWeek,
  screeningListingDays,
} from "@/lib/venues/watch-week";
import { ensureVenueFromCms } from "@/lib/venues/appVenueApi";
import { getUpcomingFixtures } from "@/services/events";
import {
  getVenueBySlug,
  listNearbyVenues,
  resolveVenueImage,
  type VenueDetail,
} from "@/services/venues";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { after } from "next/server";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { buildVenueJsonLd } from "./_components/venueJsonLd";
import { VenueProfile } from "./_components/VenueProfile";

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

function venueOgImageUrl(venue: Pick<VenueDetail, "hero_image" | "sports">): string | undefined {
  return sanityImageUrl(resolveVenueImage(venue), { width: 1200, height: 630 });
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

function firstQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string }>;
}): Promise<Metadata> {
  const { venue: slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) {
    return {
      title: missingObjectOgTitle("venue", slug),
      robots: { index: false, follow: false },
    };
  }

  const title = venueProfileTitle(venue);
  const description = venueProfileDescription(venue);
  const canonicalUrl = `${getBaseUrl()}/venues/${venue.slug}`;
  const ogImage = venueOgImageUrl(venue);

  return {
    title,
    description,
    keywords: venueProfileKeywords(venue),
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
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

export default async function VenuePage({ params, searchParams }: Props) {
  const { venue: venueSlug } = await params;
  const query = await searchParams;
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

  const kind = venueProfileKind(venue);
  const mapsSearchUrl = buildMapsUrl(venue);
  const pageUrl = `${getBaseUrl()}/venues/${venue.slug}`;
  const showWatch = kind === "watch" || kind === "hybrid";
  const playSports = venueDistinctPlaySports(venue).filter((sport) =>
    (PLAY_RESULTS_SPORT_SLUGS as readonly string[]).includes(sport.key),
  );

  const [week, nearby, resultLists] = await Promise.all([
    showWatch
      ? (async () => {
          const days = screeningListingDays(venue.upcoming_screenings);
          const [fixtures, events] = await Promise.all([
            getUpcomingFixtures({ limit: 48 }),
            loadEventKickoffs(days),
          ]);
          return buildWatchVenueWeek({ venue, fixtures, events });
        })()
      : Promise.resolve(null),
    listNearbyVenues({
      slug: venue.slug,
      city: venue.address.city,
      suburb: venue.address.suburb,
    }),
    Promise.all(playSports.map((sport) => lookupVenueLockedResults(venue._id, sport.key))),
  ]);

  return (
    <VenueProfile
      venue={venue}
      mapsUrl={mapsSearchUrl}
      jsonLd={buildVenueJsonLd(venue, pageUrl)}
      week={week}
      nearby={nearby}
      results={resultLists.flat()}
      initialBoard={firstQuery(query.board)}
      initialWindow={firstQuery(query.window)}
    />
  );
}
