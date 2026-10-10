import { StickyCtaBar } from "@/components/conversion/StickyCtaBar";
import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { EventPosterHero } from "@/components/events/EventPosterHero";
import { FixtureVenueList } from "@/components/events/FixtureList";
import { FixturePoolPanel } from "@/components/events/FixturePoolPanel";
import {
  FixtureFaqSection,
  FixtureInternalLinks,
  FixtureIntroSection,
} from "@/components/events/FixtureSeoSections";
import { FixtureSocialFeed } from "@/components/events/FixtureSocialFeed";
import { OpenF1WeekendSection } from "@/components/events/OpenF1WeekendSection";
import { RaceReplaySection } from "@/components/f1-replay/RaceReplaySection";
import { resolveFixturePageFaqs } from "@/lib/events/fixtureFaqs";
import { isFixtureIndexable } from "@/lib/events/index-bar";
import { buildEventJsonLd } from "@/lib/events/jsonLd";
import { fixtureInternalLinks } from "@/lib/events/links";
import { EVENTS_LIST_HREF, eventMoreSportLabel } from "@/lib/events/scope";
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
import { fixturePublicSlugs } from "@/lib/sports/events-path";
import { getFixtureBySlug, getUpcomingFixtures } from "@/services/events";
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
  const sport = sportDisplayName(fixture.sportSlug);
  const venueCount = fixture.venues.length;
  const watchHref = fixture.sportSlug
    ? `/watch/${encodeURIComponent(fixture.sportSlug)}`
    : "/watch";
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
    <div className="min-h-screen bg-[#0c0f0c] pb-24 text-white">
      <DeepLinkLand
        pageType="event"
        sport={fixture.sportSlug}
        slug={fixture.slug}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <EventPosterHero
        poster={{
          title: fixture.title,
          sportSlug: fixture.sportSlug,
          sportName: sport,
          competition: fixture.competition ?? (weekend ? "Formula 1" : null),
          series: fixture.series,
          startsAt: kickoff,
          teams: fixture.teams,
          countryCode: weekend?.meeting.countryCode,
          countryName: weekend?.meeting.countryName,
          place: weekend?.meeting.location,
          weekendStart: weekend?.meeting.dateStart,
          weekendEnd: weekend?.meeting.dateEnd,
        }}
        sportSlug={fixture.sportSlug}
        findVenueHref={venueCount > 0 ? "#where-to-watch" : watchHref}
        pageUrl={share.pageUrl}
        shareHref={share.href}
        followSlug={fixture.slug}
      />
      <StickyCtaBar
        matrix={matrix}
        tone="watch"
        sport={fixture.sportSlug}
        slug={fixture.slug}
        pageKey={`event:${fixture.slug}`}
      />

      <FixtureIntroSection intro={intro} localAngle={localAngle} />

      {weekend ? (
        <OpenF1WeekendSection
          weekend={weekend}
          eventPageHref={fixture.eventPageHref}
          replayHref={replayHref}
        />
      ) : null}

      {replayEventSlug ? (
        <RaceReplaySection
          sessionKey={replay?.sessionKey}
          eventSlug={replayEventSlug}
          title={`${weekend?.meeting.meetingName ?? fixture.title} replay`}
          replayHref={replayHref}
        />
      ) : null}

      <section
        id="live-feed"
        className="scroll-mt-24 border-b border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
          <FixtureSocialFeed
            slug={fixture.slug}
            title={fixture.title}
            sportSlug={fixture.sportSlug}
            venueCount={venueCount}
            initial={feed}
            watchHref={venueCount > 0 ? `#where-to-watch` : watchHref}
          />

          <aside className="lg:pt-2">
            <div className="mb-8">
              <FixturePoolPanel
                slug={fixture.slug}
                fixtureTitle={fixture.title}
                kicksOffAt={kickoff}
              />
            </div>
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Screenings
              </p>
              <h2
                id="where-to-watch"
                className="font-display scroll-mt-24 text-3xl tracking-wide text-white sm:text-4xl"
              >
                Where it&apos;s on
              </h2>
            </div>
            <FixtureVenueList fixture={fixture} />
            {venueCount === 0 ? (
              <div className="mt-4">
                <CoverageNotify
                  sport={fixture.sportSlug}
                  sourcePage={`/events/${fixture.slug}`}
                  pageType="event"
                  showRoadmap={false}
                  trackFallbackOnView
                />
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <FixtureFaqSection faqs={faqs} />
      <FixtureInternalLinks
        links={internalLinks}
        heading={eventMoreSportLabel(fixture.sportSlug)}
        allEventsHref={fixture.sportSlug ? EVENTS_LIST_HREF : null}
      />
    </div>
  );
}
