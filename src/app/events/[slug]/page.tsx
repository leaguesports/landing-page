import { ConversionKit } from "@/components/conversion/ConversionKit";
import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import { FixtureFollowButton } from "@/components/events/FixtureFollowButton";
import { FixtureVenueList } from "@/components/events/FixtureList";
import { FixturePoolPanel } from "@/components/events/FixturePoolPanel";
import {
  FixtureFaqSection,
  FixtureInternalLinks,
  FixtureIntroSection,
} from "@/components/events/FixtureSeoSections";
import { FixtureSocialFeed } from "@/components/events/FixtureSocialFeed";
import { indexableFixtureFaqs, isFixtureIndexable } from "@/lib/events/index-bar";
import { buildEventJsonLd } from "@/lib/events/jsonLd";
import { fixtureInternalLinks } from "@/lib/events/links";
import { fixtureSeoDescription, fixtureSeoTitle } from "@/lib/events/meta";
import { selectCtaMatrix } from "@/lib/conversion/cta-matrix";
import { missingObjectOgTitle } from "@/lib/conversion/deep-links";
import { buildFixtureWhatsAppShare } from "@/lib/events/whatsapp-share";
import { ensureFixtureFeed } from "@/lib/fixtures/feed-store";
import { getSiteBaseUrl } from "@/lib/site-url";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import { formatFixtureWhen } from "@/lib/sports/events-feed";
import { fixturePublicSlugs } from "@/lib/sports/events-path";
import { getFixtureBySlug, getUpcomingFixtures } from "@/services/events";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
  const fixture = await getFixtureBySlug(slug);
  if (!fixture) {
    const title = missingObjectOgTitle("event", slug);
    return { title, robots: { index: false, follow: false } };
  }

  const indexable = isFixtureIndexable(fixture);
  const title = fixtureSeoTitle({
    title: fixture.title,
    seoTitle: fixture.seoTitle,
    competition: fixture.competition,
    teams: fixture.teams,
    startsAt: fixture.startsAt,
  });
  const description = fixtureSeoDescription({
    title: fixture.title,
    seoTitle: fixture.seoTitle,
    seoDescription: fixture.seoDescription,
    seoIntro: fixture.seoIntro,
    competition: fixture.competition,
    teams: fixture.teams,
    startsAt: fixture.startsAt,
    venueCount: fixture.venues.length,
  });
  const canonical = `/events/${fixture.slug}`;

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
  const [fixture, upcoming] = await Promise.all([
    getFixtureBySlug(slug),
    getUpcomingFixtures({ limit: 24 }),
  ]);
  if (!fixture) {
    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <DeepLinkRecovery kind="event" objectName={slug} />
      </div>
    );
  }

  const when = formatFixtureWhen(fixture.startsAt);
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
    startsAt: fixture.startsAt,
  });
  const faqs = indexableFixtureFaqs(fixture);
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
    startsAt: fixture.startsAt,
    sportName: sport,
    competition: fixture.competition,
    teams: fixture.teams,
    hostVenue: fixture.hostVenue,
    screeningVenues: fixture.venues,
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

      <section className="border-b border-white/5 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-zinc-500"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/events" className="transition-colors hover:text-white">
              Events
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-400">{fixture.title}</span>
          </nav>

          <Link
            href="/events"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All events
          </Link>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            {sport ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-400">
                {sport}
              </span>
            ) : null}
            {fixture.competition ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                {fixture.competition}
              </span>
            ) : null}
            {when ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                {when}
              </span>
            ) : null}
          </div>

          <h1 className="font-display max-w-4xl text-4xl tracking-wide text-white sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            {fixture.broadcastInfo?.trim() ||
              (venueCount > 0
                ? `Find a screening nearby, follow the fixture, then open the live feed.`
                : `Follow the live feed, then pick a venue screening nearby when listings land.`)}
          </p>

          <div className="mt-8 flex flex-col items-start gap-4">
            <ConversionKit
              matrix={matrix}
              tone="watch"
              sport={fixture.sportSlug}
              slug={fixture.slug}
              sourcePage={`/events/${fixture.slug}`}
              pageKey={`event:${fixture.slug}`}
              pageType="event"
              showSticky
              showFallback={false}
            />
            <div className="flex flex-wrap items-start gap-3">
              <FixtureFollowButton slug={fixture.slug} variant="secondary" />
              <Link
                href="#live-feed"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                Open live feed
              </Link>
              {fixture.relatedGuide?.slug ? (
                <Link
                  href={`/guides/${fixture.relatedGuide.slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                >
                  Related guide
                </Link>
              ) : null}
              {fixture.hostVenue?.slug ? (
                <Link
                  href={`/venues/${fixture.hostVenue.slug}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                >
                  {fixture.hostVenue.name}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
              {fixture.eventPageHref ? (
                <Link
                  href={fixture.eventPageHref}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
                >
                  Event page
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <FixtureIntroSection intro={intro} localAngle={localAngle} />

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
                kicksOffAt={fixture.startsAt}
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
      <FixtureInternalLinks links={internalLinks} />
    </div>
  );
}
