import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { EventArticle } from "./_components/EventArticle";
import { resolveFixturePageFaqs } from "@/lib/events/fixtureFaqs";
import { isFixtureIndexable } from "@/lib/events/index-bar";
import { buildEventJsonLd } from "@/lib/events/jsonLd";
import { fixtureInternalLinks } from "@/lib/events/links";
import { highlightFixtureVenues, withFeaturedVenueCards } from "@/lib/events/highlight-venues";
import { fixtureProfileKeywords } from "@/lib/events/profile";
import { eventDetailListHref, eventMoreSportLabel } from "@/lib/events/scope";
import { fixtureSeoDescription, fixtureSeoTitle } from "@/lib/events/meta";
import { selectCtaMatrix } from "@/lib/conversion/cta-matrix";
import { missingObjectOgTitle } from "@/lib/conversion/deep-links";
import { buildFixtureWhatsAppShare } from "@/lib/events/whatsapp-share";
import { ensureFixtureFeed } from "@/lib/fixtures/feed-store";
import {
  eventRaceReplaySlug,
  findOpenF1RaceSession,
  getOpenF1WeekendByEventSlug,
  getOpenF1WeekendForFixture,
  isOpenF1EnrichableFixture,
  isOpenF1EventSlug,
  openF1CircuitImageUrl,
  openF1CircuitLine,
} from "@/lib/openf1/openf1";
import { replayConfigFromWeekend } from "@/lib/openf1/replay";
import { getSiteBaseUrl } from "@/lib/site-url";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import { formatFixtureWhen } from "@/lib/sports/events-feed";
import { fixturePublicSlugs } from "@/lib/sports/events-path";
import { getFixtureBySlug, getUpcomingFixtures } from "@/services/events";
import { getVenueCardsBySlugs } from "@/services/venueHub";
import type { Metadata } from "next";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function sportDisplayName(slug: string | null): string | null {
  if (!slug) return null;
  const catalog = SPORT_CATALOG.find((item) => item.slug === slug);
  return catalog?.name ?? slug.replace(/-/g, " ");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const weekendPrefetch = isOpenF1EventSlug(slug)
    ? getOpenF1WeekendByEventSlug(slug)
    : Promise.resolve(null);
  const [fixture, prefetchedWeekend] = await Promise.all([
    getFixtureBySlug(slug),
    weekendPrefetch,
  ]);
  if (!fixture) {
    const title = missingObjectOgTitle("event", slug);
    return { title, robots: { index: false, follow: false } };
  }

  const weekend = isOpenF1EnrichableFixture(fixture)
    ? (prefetchedWeekend ?? (await getOpenF1WeekendForFixture(fixture)))
    : null;
  const race = weekend ? findOpenF1RaceSession(weekend.sessions) : null;
  const indexable = isFixtureIndexable(fixture);
  const title = fixtureSeoTitle({
    title: fixture.title,
    seoTitle: fixture.seoTitle,
    competition: fixture.competition,
    teams: fixture.teams,
    startsAt: race?.dateStart ?? fixture.startsAt,
  });
  const description = fixtureSeoDescription({
    title: fixture.title,
    seoTitle: fixture.seoTitle,
    seoDescription: fixture.seoDescription,
    seoIntro: fixture.seoIntro,
    competition: fixture.competition,
    teams: fixture.teams,
    startsAt: race?.dateStart ?? fixture.startsAt,
    venueCount: fixture.venues.length,
    circuitLine: weekend ? openF1CircuitLine(weekend.meeting) : null,
  });
  const canonical = `/events/${fixture.slug}`;
  const circuitImage = weekend ? openF1CircuitImageUrl(weekend.meeting) : null;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${getSiteBaseUrl()}${canonical}`,
      type: "website",
      locale: "en_ZA",
      ...(circuitImage
        ? { images: [{ url: circuitImage, alt: weekend?.meeting.circuitShortName }] }
        : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    keywords: fixtureProfileKeywords({
      title: fixture.title,
      sportName: sportDisplayName(fixture.sportSlug),
      competition: fixture.competition,
      series: fixture.series,
      teams: fixture.teams,
      broadcastInfo: fixture.broadcastInfo,
      venues: fixture.venues,
      hostVenue: fixture.hostVenue,
      circuitLine: weekend ? openF1CircuitLine(weekend.meeting) : null,
    }),
    robots: {
      index: indexable,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  const fixtures = await getUpcomingFixtures({ limit: 24 });
  const slugs = new Set<string>();
  for (const fixture of fixtures) {
    for (const slug of fixturePublicSlugs(fixture)) {
      slugs.add(slug);
    }
  }
  return [...slugs].map((slug) => ({ slug }));
}

export default async function EventFixturePage({ params }: PageProps) {
  const { slug } = await params;
  const weekendPrefetch = isOpenF1EventSlug(slug)
    ? getOpenF1WeekendByEventSlug(slug)
    : Promise.resolve(null);
  const [fixture, upcoming, prefetchedWeekend] = await Promise.all([
    getFixtureBySlug(slug),
    getUpcomingFixtures({ limit: 24 }),
    weekendPrefetch,
  ]);
  if (!fixture) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <DeepLinkRecovery kind="event" objectName={slug} />
      </div>
    );
  }

  const weekend = isOpenF1EnrichableFixture(fixture)
    ? (prefetchedWeekend ?? (await getOpenF1WeekendForFixture(fixture)))
    : null;
  const race = weekend ? findOpenF1RaceSession(weekend.sessions) : null;
  const replay = weekend ? replayConfigFromWeekend(weekend) : null;
  const replayEventSlug = eventRaceReplaySlug({
    slug: fixture.slug,
    fixture,
    weekendEventSlug: weekend?.meeting.eventSlug,
  });
  const replayHref = replayEventSlug
    ? `/events/${fixture.slug}/replay`
    : null;
  const kickoff = race?.dateStart ?? fixture.startsAt;
  const when = formatFixtureWhen(kickoff);
  const sport = sportDisplayName(fixture.sportSlug);
  const venueCount = fixture.venues.length;
  const heading = fixtureSeoTitle({
    title: fixture.title,
    seoTitle: fixture.seoTitle,
    competition: fixture.competition,
    teams: fixture.teams,
    startsAt: kickoff,
  });
  const faqs = resolveFixturePageFaqs(fixture.slug, fixture.faqs);
  const intro = fixture.seoIntro?.trim() || null;
  const localAngle = fixture.localAngle?.trim() || null;
  const related = upcoming.filter((item) => item.slug !== fixture.slug);
  const internalLinks = fixtureInternalLinks(fixture, related);
  const share = buildFixtureWhatsAppShare({
    title: fixture.title,
    slug: fixture.slug,
    origin: getSiteBaseUrl(),
  });
  const jsonLd = buildEventJsonLd({
    title: heading,
    slug: fixture.slug,
    description: fixture.seoDescription || intro,
    startsAt: weekend?.meeting.dateStart ?? kickoff,
    endsAt: weekend?.meeting.dateEnd,
    sportName: sport,
    competition: fixture.competition ?? (weekend ? "Formula 1" : null),
    teams: fixture.teams,
    hostVenue: fixture.hostVenue,
    screeningVenues: fixture.venues,
    localAngle,
    circuit: weekend
      ? {
          name: weekend.meeting.circuitShortName,
          location: weekend.meeting.location,
          countryName: weekend.meeting.countryName,
          countryCode: weekend.meeting.countryCode,
        }
      : null,
    sessions: weekend?.sessions.map((session) => ({
      name: session.sessionName,
      startDate: session.dateStart,
      endDate: session.dateEnd,
      cancelled: session.isCancelled,
    })),
    image: weekend ? openF1CircuitImageUrl(weekend.meeting) : null,
    faqs,
    siteUrl: getSiteBaseUrl(),
  });

  const highlighted = highlightFixtureVenues(fixture.venues, fixture.hostVenue?.slug);
  const fetchedVenueCards = await getVenueCardsBySlugs(highlighted.map((venue) => venue.slug));
  const venueCards = withFeaturedVenueCards(
    highlighted,
    fetchedVenueCards,
    sport && fixture.sportSlug ? { slug: fixture.sportSlug, name: sport } : null,
  );

  const feed = ensureFixtureFeed({
    slug: fixture.slug,
    title: fixture.title,
    sportSlug: fixture.sportSlug,
    venueCount,
  });

  const matrix = selectCtaMatrix({
    pageType: "event",
    sport: fixture.sportSlug,
    venueCount,
    shareHref: share.href,
  });

  return (
    <EventArticle
      fixture={fixture}
      sport={sport}
      kickoffLabel={when}
      kickoff={kickoff}
      weekend={weekend}
      replaySessionKey={replay?.sessionKey}
      replayEventSlug={replayEventSlug}
      replayHref={replayHref}
      intro={intro}
      localAngle={localAngle}
      editorialFaqs={faqs}
      internalLinks={internalLinks}
      moreLabel={eventMoreSportLabel(fixture.sportSlug)}
      listHref={eventDetailListHref(fixture.sportSlug)}
      matrix={matrix}
      feed={feed}
      venueCards={venueCards}
      venueCount={venueCount}
      circuitLine={weekend ? openF1CircuitLine(weekend.meeting) : null}
      jsonLd={jsonLd}
    />
  );
}
