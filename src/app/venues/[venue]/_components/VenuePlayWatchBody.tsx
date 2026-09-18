import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { VenueLeaderboardSection } from "@/components/venue-leaderboards/VenueLeaderboardSection";
import { venueLeaderboardPlayHref } from "@/lib/venue-leaderboards/boards";
import type { VenueDetailChrome } from "@/lib/venues/detail-ia";
import type { VenueQuickStartActivity } from "@/lib/venues/quick-start";
import type { VenueDetail } from "@/services/venues";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { VenueFriendsPlayed } from "./VenueFriendsPlayed";
import { VenueMatchHistory } from "./VenueMatchHistory";
import { VenueMatchSchedule } from "./VenueMatchSchedule";
import { VenueQuickStart } from "./VenueQuickStart";
import { VenueSportChips } from "./VenueSportChips";

export async function VenuePlayWatchBody({
  venue,
  chrome,
  sportsCopy,
  quickStartActivities,
  primaryQuickStart,
  citySlug,
  initialBoard,
  initialWindow,
}: {
  venue: VenueDetail;
  chrome: VenueDetailChrome;
  sportsCopy: { title: string; description: string };
  quickStartActivities: VenueQuickStartActivity[];
  primaryQuickStart?: VenueQuickStartActivity;
  citySlug: string;
  initialBoard?: string | null;
  initialWindow?: string | null;
}) {
  return (
    <>
      {chrome.showWatchWhatsOn ? (
        <section
          id="weekend"
          className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="mb-8 sm:mb-10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                This weekend
              </p>
              <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                What&apos;s on
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Upcoming screenings at this venue
              </p>
            </header>
            <div className="grid max-w-3xl gap-5">
              <VenueMatchSchedule venue={venue} />
            </div>
          </div>
        </section>
      ) : null}

      <VenueQuickStart
        venueName={venue.name}
        activities={quickStartActivities}
      />

      {chrome.showPlayStack ? (
        <>
          <VenueFriendsPlayed
            venueId={venue._id}
            venueName={venue.name}
            venueSlug={venue.slug}
            primarySport={primaryQuickStart?.sportSlug ?? null}
            startHref={primaryQuickStart?.href}
          />
          <VenueMatchHistory
            venueName={venue.name}
            venueCmsId={venue._id}
            startHref={primaryQuickStart?.href}
          />
          <VenueLeaderboardSection
            venueId={venue._id}
            venueName={venue.name}
            playHref={venueLeaderboardPlayHref(primaryQuickStart?.sportSlug)}
            sport={primaryQuickStart?.sportSlug ?? null}
            initialBoard={initialBoard}
            initialWindow={initialWindow}
          />
        </>
      ) : null}

      {chrome.showSportsSection ? (
        <section
          id="sports"
          className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="mb-8 sm:mb-10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                Sports
              </p>
              <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
                {sportsCopy.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">{sportsCopy.description}</p>
            </header>
            <div
              className={`grid gap-4 sm:gap-5 ${
                chrome.showWatchChips && chrome.showPlayChips
                  ? "sm:grid-cols-2"
                  : ""
              }`}
            >
              {chrome.showWatchChips ? (
                <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                    Watch
                  </h3>
                  {venue.broadcasts.length > 0 ? (
                    <VenueSportChips
                      intent="watch"
                      items={venue.broadcasts}
                      venue={venue}
                    />
                  ) : (
                    <CoverageNotify
                      sport={null}
                      city={citySlug || null}
                      cityName={venue.address.city || venue.address.suburb}
                      sourcePage={`/venues/${venue.slug}`}
                      pageType="venue"
                      showRoadmap
                    />
                  )}
                </div>
              ) : null}
              {chrome.showPlayChips ? (
                <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                    Play
                  </h3>
                  <VenueSportChips
                    intent="play"
                    items={venue.sports}
                    venue={venue}
                  />
                </div>
              ) : null}
            </div>
            {chrome.showFindPlacesToWatch || chrome.showFindPlacesToPlay ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {chrome.showFindPlacesToWatch ? (
                  <Link
                    href="/watch"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:text-white"
                  >
                    Find places to watch <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
                {chrome.showFindPlacesToWatch && chrome.showFindPlacesToPlay ? (
                  <span className="hidden text-zinc-700 sm:inline">|</span>
                ) : null}
                {chrome.showFindPlacesToPlay ? (
                  <Link
                    href="/play"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:text-white"
                  >
                    Find places to play <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
