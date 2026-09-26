import { VenueDirectoryCard } from "@/app/venues/_components/VenueDirectoryCard";
import { CoverageNotify } from "@/components/conversion/CoverageNotify";
import { VenueListCard } from "@/components/venues/VenueListCard";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import { guideVenueMarkInitial } from "@/lib/guides/venueMedia";
import type { IntentKind } from "@/lib/intent/paths";
import { intentPath } from "@/lib/intent/paths";
import {
  dedupeVenuesBySlug,
  venueBroadcastSportSlugs,
  watchVenueMetaLine,
  type WatchGuideLink,
} from "@/lib/intent/watch-screenings";
import { mergeVenueUpcomingScreenings } from "@/lib/sports/events-path";
import type { UpcomingFixture } from "@/lib/sports/events-feed";
import { sanityImageUrl } from "@/lib/venues/photo";
import type { VenueDetail } from "@/services/venues";
import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";

function watchHubPhoto(venue: VenueDetail): string | null {
  const image = venue.hero_image;
  if (!image || typeof image !== "object") return null;
  if (!(image as { asset?: unknown }).asset) return null;
  return sanityImageUrl(image, { width: 112, height: 112 }) ?? null;
}

type IntentVenuesSectionProps = {
  intent: IntentKind;
  venues: VenueDetail[];
  activityName: string;
  locationTitle: string;
  usedCityFallback?: boolean;
  suburbTitle?: string | null;
  cityTitle?: string | null;
  related?: { slug: string; title: string }[];
  relatedGuides?: WatchGuideLink[];
  activitySlug: string;
  /** Hub sport used to scope the next-screening line. */
  sportSlug?: string | null;
  fixtures?: UpcomingFixture[];
  matrix?: CtaMatrix | null;
  locationSlug: string;
  sourcePage: string;
};

export function IntentVenuesSection({
  intent,
  venues,
  activityName,
  locationTitle,
  usedCityFallback = false,
  suburbTitle,
  cityTitle,
  related = [],
  relatedGuides = [],
  activitySlug,
  sportSlug = null,
  fixtures = [],
  matrix = null,
  locationSlug,
  sourcePage,
}: IntentVenuesSectionProps) {
  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";
  const fallbackSuburb = suburbTitle ?? locationTitle;
  const fallbackCity = cityTitle ?? "this city";
  const verb = intent === "watch" ? "Watch" : "Play";
  const now = new Date();
  const listedVenues =
    intent === "watch" ? dedupeVenuesBySlug(venues) : venues;

  return (
    <section
      id="venues"
      className="scroll-mt-28 border-t border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <p
            className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
          >
            Venues
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            {intent === "watch"
              ? `${activityName} venues in ${locationTitle}`
              : `${verb} ${activityName} in ${locationTitle}`}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {intent === "watch"
              ? `Bars and fan zones tagged for ${activityName}.`
              : "Courts and clubs hosting this sport"}
          </p>
        </header>

        {usedCityFallback && venues.length > 0 ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3.5 sm:px-5 ${
              intent === "watch"
                ? "border-sky-400/20 bg-sky-400/8"
                : "border-emerald-400/20 bg-emerald-400/8"
            }`}
          >
            <p className="text-sm leading-relaxed text-zinc-200">
              No venues found directly in{" "}
              <span className="font-medium text-white">{fallbackSuburb}</span>{" "}
              yet. Showing top matches in nearby{" "}
              <span className="font-medium text-white">{fallbackCity}</span>.
            </p>
          </div>
        ) : null}

        {listedVenues.length > 0 ? (
          intent === "watch" && matrix ? (
            <div
              className="grid grid-cols-1 gap-3 lg:grid-cols-2"
              data-watch-venue-list=""
            >
              {listedVenues.map((venue) => {
                const next = mergeVenueUpcomingScreenings(venue, fixtures, now, {
                  sportSlug,
                  broadcastSlugs: venueBroadcastSportSlugs(venue.broadcasts),
                })[0];
                const suburb = venue.address.suburb?.trim() ?? "";
                const venueSlug = venue.slug?.trim() ?? "";
                return (
                  <VenueListCard
                    key={venueSlug || venue._id}
                    variant="watch-hub"
                    name={venue.name}
                    suburb={suburb}
                    slug={venueSlug || null}
                    initial={guideVenueMarkInitial(suburb, venue.name)}
                    photoSrc={watchHubPhoto(venue)}
                    meta={watchVenueMetaLine({
                      sportName: activityName,
                      nextTitle: next?.title,
                      nextStartsAt: next?.startsAt,
                      hasScreens: Boolean(venue.has_big_screens),
                      hasParking: Boolean(venue.has_parking),
                      hasLiveAudio: Boolean(venue.has_live_audio),
                      now,
                    })}
                    matrix={matrix}
                    sport={sportSlug}
                    city={locationSlug}
                    pageSlug={venueSlug || sourcePage}
                    pageType="watch_city_sport"
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {listedVenues.map((venue) => (
                <VenueDirectoryCard
                  key={venue._id}
                  venue={venue}
                  intent={intent}
                  nextScreening={
                    intent === "watch"
                      ? mergeVenueUpcomingScreenings(venue, fixtures, now, {
                          sportSlug,
                          broadcastSlugs: venueBroadcastSportSlugs(
                            venue.broadcasts,
                          ),
                        })[0] ?? null
                      : null
                  }
                />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/8 bg-[#141814] px-6 py-12 text-center">
              <MapPin className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-sm text-zinc-400">
                No {intent} venues for {activityName} in {locationTitle} yet.
              </p>
              <Link
                href={intentPath(intent, activitySlug)}
                className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${accent}`}
              >
                Try another area
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CoverageNotify
              sport={activitySlug}
              sportName={activityName}
              city={locationSlug}
              cityName={locationTitle}
              sourcePage={sourcePage}
              pageType={intent === "watch" ? "watch_city_sport" : "play_city_sport"}
              trackFallbackOnView
            />
          </div>
        )}

        {intent === "watch" && relatedGuides.length > 0 ? (
          <div className="mt-10" data-watch-related-guides="">
            <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
              Related guides
            </h2>
            <ul className="mt-4 space-y-2">
              {relatedGuides.map((guide) => (
                <li key={guide.href}>
                  <Link
                    href={guide.href}
                    className="text-sm font-medium text-sky-300 hover:text-white"
                  >
                    {guide.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {related.length > 0 ? (
          <div className="mt-12">
            <h3 className="font-display text-2xl tracking-wide text-white">
              Nearby areas
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={intentPath(intent, activitySlug, item.slug)}
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
