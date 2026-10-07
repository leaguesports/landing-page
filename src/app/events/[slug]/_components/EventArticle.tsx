import { ConversionKit } from "@/components/conversion/ConversionKit";
import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import { FixtureFollowButton } from "@/components/events/FixtureFollowButton";
import { FixturePoolPanel } from "@/components/events/FixturePoolPanel";
import {
  FixtureFaqSection,
  FixtureInternalLinks,
  FixtureIntroSection,
} from "@/components/events/FixtureSeoSections";
import { FixtureSocialFeed } from "@/components/events/FixtureSocialFeed";
import { OpenF1WeekendSection } from "@/components/events/OpenF1WeekendSection";
import { RaceReplaySection } from "@/components/f1-replay/RaceReplaySection";
import { VenueSectionNav } from "@/app/venues/[venue]/_components/VenueSectionNav";
import { FeaturedVenueCard } from "@/components/venues/FeaturedVenueCard";
import { watchFixtureSides } from "@/lib/intent/watch-fixture-card";
import type { FeaturedHomeVenue } from "@/lib/venues/featured-home";
import { buildFixtureProfile } from "@/lib/events/profile";
import { eventSportVoice } from "@/lib/events/sport-voice";
import { intentPath } from "@/lib/intent/paths";
import type { FixtureRelatedLink } from "@/lib/events/links";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import type { OpenF1Weekend } from "@/lib/openf1/openf1";
import type { FixtureFaq, UpcomingFixture } from "@/lib/sports/events-feed";
import type { FixtureFeedSnapshot } from "@/types/fixture-feed";
import Link from "next/link";

const SIDEBAR_FACTS = new Set(["Host", "Circuit", "Broadcast"]);

export function EventArticle({
  fixture,
  sport,
  kickoffLabel,
  weekend,
  kickoff,
  replaySessionKey,
  replayEventSlug,
  replayHref,
  intro,
  localAngle,
  editorialFaqs,
  internalLinks,
  moreLabel,
  listHref,
  matrix,
  feed,
  venueCards,
  venueCount,
  circuitLine,
  jsonLd,
}: {
  fixture: UpcomingFixture;
  sport: string | null;
  kickoffLabel: string | null;
  weekend: OpenF1Weekend | null;
  kickoff: string | null;
  replaySessionKey?: number | null;
  replayEventSlug: string | null;
  replayHref: string | null;
  intro: string | null;
  localAngle: string | null;
  editorialFaqs: FixtureFaq[];
  internalLinks: FixtureRelatedLink[];
  moreLabel: string;
  listHref: string;
  matrix: CtaMatrix;
  feed: FixtureFeedSnapshot;
  venueCards: FeaturedHomeVenue[];
  venueCount: number;
  circuitLine: string | null;
  jsonLd: unknown;
}) {
  const voice = eventSportVoice({
    sportSlug: fixture.sportSlug,
    sportName: sport,
    series: fixture.series,
    title: fixture.title,
    circuitLine,
  });
  const profile = buildFixtureProfile({
    title: fixture.title,
    sportSlug: fixture.sportSlug,
    sportName: sport,
    competition: fixture.competition,
    series: fixture.series,
    teams: fixture.teams,
    startsAt: fixture.startsAt,
    broadcastInfo: fixture.broadcastInfo,
    venues: fixture.venues,
    hostVenue: fixture.hostVenue,
    circuitLine,
  });
  const hasEditorial = Boolean(intro || localAngle);
  const related = internalLinks.filter((link) => link.kind === "guide" || link.kind === "fixture");
  const sidebarFacts = profile.facts.filter((fact) => SIDEBAR_FACTS.has(fact.label));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: sport ? `${sport} fixtures` : "Events", path: listHref },
    { name: profile.shortName, path: `/events/${fixture.slug}` },
  ];
  const sides = watchFixtureSides({ title: fixture.title, teams: fixture.teams });
  const moreVenueCount = fixture.venues.length - venueCards.length;
  const watchAllHref = intentPath("watch", fixture.sportSlug);
  const sectionTabs = [
    hasEditorial ? { id: "about", label: "About" } : null,
    { id: "live-feed", label: "Feed" },
    weekend ? { id: "weekend-timetable", label: "Timetable" } : null,
    replayEventSlug ? { id: "race-replay", label: "Replay" } : null,
    { id: "where-to-watch", label: "Watch" },
    { id: "prediction-pool", label: "Pool" },
    editorialFaqs.length > 0 ? { id: "questions", label: "Questions" } : null,
    related.length > 0 ? { id: "more", label: "More" } : null,
  ].filter((tab): tab is { id: string; label: string } => tab !== null);

  return (
    <div className="min-h-screen bg-white pb-24 text-zinc-950">
      <DeepLinkLand pageType="event" sport={fixture.sportSlug} slug={fixture.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>
        <header className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <li key={crumb.path} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {last ? (
                      <span className="text-zinc-800">{profile.shortName}</span>
                    ) : (
                      <Link href={crumb.path} className="hover:text-zinc-950">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.18em] ${voice.accentClass}`}>
            {profile.eyebrow}
          </p>
          <h1 className="mt-2 max-w-4xl font-display text-5xl tracking-wide text-zinc-950 sm:text-7xl">
            {profile.shortName}
          </h1>
          {kickoffLabel ? (
            <p className="mt-3 text-sm text-zinc-600">
              <span className="font-medium text-zinc-800">{voice.startLabel}</span>
              <span className="text-zinc-400"> · </span>
              {kickoffLabel}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ConversionKit
              matrix={matrix}
              tone="watch"
              surface="light"
              sport={fixture.sportSlug}
              slug={fixture.slug}
              sourcePage={`/events/${fixture.slug}`}
              pageKey={`event:${fixture.slug}`}
              pageType="event"
              showSticky
              showFallback={false}
            />
            <FixtureFollowButton slug={fixture.slug} variant="secondary" surface="light" />
          </div>
        </header>

        <VenueSectionNav tabs={sectionTabs} label="Event sections" />

        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
          <div
            className={
              sidebarFacts.length > 0
                ? "mt-8 grid w-full min-w-0 grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-12"
                : "mt-8 w-full min-w-0"
            }
          >
            <div className="min-w-0">
              <FixtureIntroSection title={profile.headings.about} intro={intro} localAngle={localAngle} />

              <section id="live-feed" className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8">
                <FixtureSocialFeed
                  slug={fixture.slug}
                  title={fixture.title}
                  sportSlug={fixture.sportSlug}
                  venueCount={venueCount}
                  initial={feed}
                  homeSide={sides.home}
                  awaySide={sides.away}
                  feedHeading={voice.feedHeading}
                  feedEmpty={voice.feedEmpty}
                  replyPlaceholder={voice.replyPlaceholder}
                />
              </section>

              {weekend ? (
                <div className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8">
                  <OpenF1WeekendSection
                    weekend={weekend}
                    eventPageHref={fixture.eventPageHref}
                    replayHref={replayHref}
                    embedded
                  />
                </div>
              ) : null}

              {replayEventSlug ? (
                <div className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8">
                  <RaceReplaySection
                    sessionKey={replaySessionKey}
                    eventSlug={replayEventSlug}
                    title={`${weekend?.meeting.meetingName ?? fixture.title} replay`}
                    replayHref={replayHref}
                    embedded
                  />
                </div>
              ) : null}

              <section id="where-to-watch" className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8" aria-labelledby="watch-title">
                <h2 id="watch-title" className="font-display text-3xl tracking-wide text-zinc-950">
                  Where to watch
                </h2>
                {venueCards.length > 0 ? (
                  <>
                    <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {venueCards.map((venue) => (
                        <li key={venue.slug} className="min-w-0">
                          <FeaturedVenueCard venue={venue} />
                        </li>
                      ))}
                    </ul>
                    {moreVenueCount > 0 ? (
                      <p className="mt-4 text-sm text-zinc-600">
                        <Link href={watchAllHref} className="font-medium text-zinc-950 hover:text-emerald-800">
                          {moreVenueCount} more venue{moreVenueCount === 1 ? "" : "s"}
                        </Link>{" "}
                        screening this.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-4">
                    <p className="text-base leading-relaxed text-zinc-700">
                      No venue has listed this screening yet. {voice.watchEmpty}
                    </p>
                    <div className="mt-4">
                      <CoverageNotify
                        sport={fixture.sportSlug}
                        sportName={sport}
                        sourcePage={`/events/${fixture.slug}`}
                        pageType="event"
                        showRoadmap={false}
                        trackFallbackOnView
                        tone="light"
                      />
                    </div>
                  </div>
                )}
              </section>

              <section id="prediction-pool" className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8">
                <FixturePoolPanel
                  slug={fixture.slug}
                  fixtureTitle={fixture.title}
                  kicksOffAt={kickoff}
                  tone="light"
                  layout="section"
                  poolLine={voice.poolLine}
                />
              </section>

              <FixtureFaqSection title={profile.headings.questions} faqs={editorialFaqs} />
              <FixtureInternalLinks links={related} heading={moreLabel} />
            </div>

            {sidebarFacts.length > 0 ? (
              <aside className="lg:sticky lg:top-40">
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                  <dl className="space-y-4">
                    {sidebarFacts.map((fact) => (
                      <div key={fact.label}>
                        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          {fact.label === "Host" ? voice.hostLabel : fact.label}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-zinc-800">
                          {fact.href ? (
                            <Link href={fact.href} className="font-medium text-zinc-950 hover:text-emerald-800">
                              {fact.value}
                            </Link>
                          ) : (
                            fact.value
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
