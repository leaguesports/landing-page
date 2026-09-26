import { selectCtaMatrix, type CtaMatrix } from "@/lib/conversion/cta-matrix";
import { IntentBrowseGrid } from "@/components/intent/IntentBrowseGrid";
import { IntentFaqSection } from "@/components/intent/IntentFaqSection";
import { IntentHero } from "@/components/intent/IntentHero";
import { IntentHighlights } from "@/components/intent/IntentHighlights";
import { IntentHub } from "@/components/intent/IntentHub";
import { IntentNav } from "@/components/intent/IntentNav";
import { IntentVenuesSection } from "@/components/intent/IntentVenuesSection";
import { WatchCityExperience } from "@/components/intent/WatchCityExperience";
import { WatchCityFooter } from "@/components/intent/WatchCityFooter";
import {
  intentBrowseDescription,
  intentBrowseTitle,
  intentDetailDescription,
  intentDetailFaqs,
  intentDetailHeading,
  intentDetailTitle,
  intentLandingDescription,
  intentLandingTitle,
  watchCityHubDescription,
  watchCityHubFaqs,
} from "@/lib/intent/copy";
import {
  getLocationBySlug,
  getVenuesByLocationAndActivityWithFallback,
  getWatchVenuesInLocation,
  listLocationsForActivity,
  listPlaySports,
  listWatchActivities,
  listWatchSportsInLocation,
  resolveActivityFromCms,
  type IntentLocation,
} from "@/lib/intent/data";
import {
  buildIntentEnrichment,
  buildIntentIntroParagraphs,
  resolveIntentIndexPolicy,
  type IntentPageEnrichment,
} from "@/lib/intent/enrichment";
import { loadWatchCityFixtures } from "@/lib/intent/watch-fixtures";
import {
  buildWatchHubModel,
  resolveWatchFixtureSelection,
  watchCityCentroid,
  watchCityEmptyBody,
  watchCityEventsHref,
  watchCityHubHeading,
  watchHubPromise,
  watchLivingCount,
  watchSiblingSportLinks,
  watchSportChipHref,
  type WatchHubVenueInput,
} from "@/lib/intent/watch-hub";
import {
  dedupeVenuesBySlug,
  watchCalendarScreenings,
  watchEventsHref,
  watchRelatedGuideLink,
  watchRelatedGuides,
  watchScreeningEmptyBody,
  watchScreeningEmptyCopy,
  WATCH_CITY_CALENDAR_LIMIT,
} from "@/lib/intent/watch-screenings";
import { buildIntentJsonLd } from "@/lib/intent/jsonLd";
import type { IntentKind } from "@/lib/intent/paths";
import { intentPath } from "@/lib/intent/paths";
import { isWatchCityHubLocation, resolveIntentRoute } from "@/lib/intent/routes";
import type { UpcomingFixture } from "@/lib/sports/events-feed";
import { getSiteBaseUrl } from "@/lib/site-url";
import { sanityImageUrl } from "@/lib/venues/photo";
import { resolveVenueImage, type VenueDetail } from "@/services/venues";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

function intentOgImageUrl(
  venue: {
    hero_image?: VenueDetail["hero_image"];
    sports?: VenueDetail["sports"];
  } | null,
): string | null {
  if (!venue) return null;
  const source = resolveVenueImage(venue);
  if (!source) return null;
  return sanityImageUrl(source, { width: 1200, height: 630 }) ?? null;
}

function scopeWatchEnrichment(
  enrichment: IntentPageEnrichment,
  intent: IntentKind,
  venues: VenueDetail[],
  fixtures: Awaited<ReturnType<typeof loadWatchCityFixtures>>,
  sportSlug: string,
): IntentPageEnrichment {
  if (intent !== "watch") return enrichment;
  return {
    ...enrichment,
    screeningHighlights: watchCalendarScreenings(
      venues,
      fixtures,
      sportSlug,
      new Date(),
      WATCH_CITY_CALENDAR_LIMIT,
    ),
  };
}

function metaDescriptionExtras(
  enrichment: ReturnType<typeof buildIntentEnrichment>,
  intent: IntentKind,
) {
  const amenityHint =
    enrichment.amenityStats.length > 0
      ? enrichment.amenityStats
          .slice(0, 2)
          .map((stat) => stat.label)
          .join("; ") + "."
      : null;
  const screeningHint =
    intent === "watch" && enrichment.screeningHighlights.length > 0
      ? `${enrichment.screeningHighlights.length} upcoming ${enrichment.screeningHighlights.length === 1 ? "screening" : "screenings"} listed.`
      : null;
  return { amenityHint, screeningHint };
}

function watchHubPhoto(venue: VenueDetail): string | null {
  const image = venue.hero_image;
  if (!image || typeof image !== "object") return null;
  if (!(image as { asset?: unknown }).asset) return null;
  return sanityImageUrl(image, { width: 112, height: 112 }) ?? null;
}

function toWatchHubVenue(venue: VenueDetail): WatchHubVenueInput {
  return {
    id: venue._id,
    name: venue.name,
    slug: venue.slug,
    suburb: venue.address.suburb?.trim() ?? "",
    latitude: typeof venue.latitude === "number" ? venue.latitude : null,
    longitude: typeof venue.longitude === "number" ? venue.longitude : null,
    photoSrc: watchHubPhoto(venue),
    hasScreens: Boolean(venue.has_big_screens),
    hasLiveAudio: Boolean(venue.has_live_audio),
    hasOutdoor: Boolean(venue.has_outdoor_area),
    setupTags: (venue.upcoming_screenings ?? []).flatMap(
      (item) => item.setupTags ?? [],
    ),
    cmsHook: null,
    broadcasts: venue.broadcasts ?? [],
    upcoming_screenings: venue.upcoming_screenings ?? [],
  };
}

function FanzoWatchHub({
  mode,
  heading,
  sportName,
  sportSlug,
  locationTitle,
  distanceCityTitle,
  pageCitySlug,
  guideCitySlug,
  guideCityTitle,
  cityHubHref,
  venues,
  fixtures,
  sports,
  matrix,
  sourcePage,
  initialFixture,
  usedCityFallback,
  fallbackSuburb,
  fallbackCity,
}: {
  mode: "sport" | "city";
  heading: string;
  sportName: string | null;
  sportSlug: string | null;
  locationTitle: string;
  distanceCityTitle: string;
  pageCitySlug: string;
  guideCitySlug: string;
  guideCityTitle: string;
  cityHubHref: string | null;
  venues: VenueDetail[];
  fixtures: UpcomingFixture[];
  sports: { slug: string; name: string }[];
  matrix: CtaMatrix;
  sourcePage: string;
  initialFixture: string | null;
  usedCityFallback: boolean;
  fallbackSuburb: string | null;
  fallbackCity: string | null;
}) {
  const model = buildWatchHubModel({
    venues: venues.map(toWatchHubVenue),
    fixtures,
    sportSlug,
  });
  const chipSports = mode === "city" ? model.sports : sports;
  const siblings = watchSiblingSportLinks({
    citySlug: guideCitySlug,
    cityTitle: guideCityTitle,
    sports: chipSports,
    currentSportSlug: mode === "city" ? null : sportSlug,
  });
  const count = model.cards.length;
  const venueHeading = sportName
    ? `${sportName} venues in ${locationTitle}`
    : `Venues in ${locationTitle}`;

  return (
    <>
      <WatchCityExperience
        mode={mode}
        heading={heading}
        promise={watchHubPromise({
          sportName,
          hasFixtures: model.fixtureRows.length > 0,
        })}
        livingCount={watchLivingCount(count, model.weekendVenueCount)}
        sportName={sportName}
        venueHeading={venueHeading}
        cityTitle={locationTitle}
        distanceCityTitle={distanceCityTitle}
        citySlug={pageCitySlug}
        cityHubHref={mode === "sport" ? cityHubHref : null}
        suburbChips={model.suburbs}
        sportChips={
          mode === "city"
            ? model.sports.map((sport) => ({
                slug: sport.slug,
                name: sport.name,
                href: watchSportChipHref(sport.slug, guideCitySlug),
              }))
            : []
        }
        buckets={model.buckets}
        fixtureRows={model.fixtureRows}
        cards={model.cards}
        todayYmd={model.todayYmd}
        centroid={watchCityCentroid(guideCitySlug)}
        initialFixtureKey={resolveWatchFixtureSelection(
          model.fixtureRows,
          initialFixture,
        )}
        empty={{
          title: sportName
            ? watchScreeningEmptyCopy(sportName)
            : "No upcoming screenings listed yet",
          body: sportName
            ? watchScreeningEmptyBody(sportName, locationTitle, count)
            : watchCityEmptyBody(locationTitle, count),
          eventsHref: sportSlug
            ? watchEventsHref(sportSlug)
            : watchCityEventsHref(guideCitySlug),
          guide: watchRelatedGuideLink(sportSlug ?? "", guideCitySlug),
          sibling: siblings[0] ?? null,
        }}
        usedCityFallback={usedCityFallback}
        fallbackSuburb={fallbackSuburb}
        fallbackCity={fallbackCity}
        matrix={matrix}
        sportSlug={sportSlug}
        sourcePage={sourcePage}
      />
      <WatchCityFooter
        relatedGuides={watchRelatedGuides(sportSlug ?? "", guideCitySlug)}
        siblings={siblings}
      />
    </>
  );
}

async function watchCityMetadata(location: IntentLocation): Promise<Metadata> {
  const siteUrl = getSiteBaseUrl();
  const venues = dedupeVenuesBySlug(
    await getWatchVenuesInLocation(location.slug),
  );
  const title = watchCityHubHeading(location.title);
  const description = watchCityHubDescription(location.title, venues.length);
  const canonical = intentPath("watch", location.slug);
  const pageUrl = `${siteUrl}${canonical}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      locale: "en_ZA",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: venues.length > 0, follow: true },
    keywords: ["watch", location.title, "venues", "LeagueSports", "South Africa"],
  };
}

async function WatchOnlyCityPage({
  location,
  initialFixture,
  siteUrl,
}: {
  location: IntentLocation;
  initialFixture: string | null;
  siteUrl: string;
}) {
  const [venueRows, fixtures] = await Promise.all([
    getWatchVenuesInLocation(location.slug),
    loadWatchCityFixtures(),
  ]);
  const venues = dedupeVenuesBySlug(venueRows);
  const title = watchCityHubHeading(location.title);
  const description = watchCityHubDescription(location.title, venues.length);
  const faqs = watchCityHubFaqs({
    cityTitle: location.title,
    venueCount: venues.length,
  });
  const jsonLd = buildIntentJsonLd({
    intent: "watch",
    title,
    description,
    activitySlug: location.slug,
    activityName: location.title,
    venues: venues.map((venue) => ({ name: venue.name, slug: venue.slug })),
    faqs,
    siteUrl,
  });
  const sourcePage = intentPath("watch", location.slug);

  return (
    <div className="min-h-screen bg-[#0c0f0c] pb-24 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IntentNav intent="watch" locationTitle={location.title} />
      {/*
        Fixture strip and venue cards render before FAQ. Do not wrap this
        block in Suspense — a hole streams FAQ ahead of the cards.
      */}
      <FanzoWatchHub
        mode="city"
        heading={title}
        sportName={null}
        sportSlug={null}
        locationTitle={location.title}
        distanceCityTitle={location.title}
        pageCitySlug={location.slug}
        guideCitySlug={location.slug}
        guideCityTitle={location.title}
        cityHubHref={null}
        venues={venues}
        fixtures={fixtures}
        sports={[]}
        matrix={selectCtaMatrix({
          pageType: "watch_city_sport",
          city: location.slug,
          venueCount: venues.length,
        })}
        sourcePage={sourcePage}
        initialFixture={initialFixture}
        usedCityFallback={false}
        fallbackSuburb={null}
        fallbackCity={null}
      />
      <IntentFaqSection intent="watch" faqs={faqs} />
    </div>
  );
}

export async function generateIntentMetadata(
  intent: IntentKind,
  route: string[] | undefined,
): Promise<Metadata> {
  const resolved = resolveIntentRoute(route);
  const siteUrl = getSiteBaseUrl();

  if (resolved.kind === "not-found") {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  if (resolved.kind === "landing") {
    const title = intentLandingTitle(intent);
    const description = intentLandingDescription(intent);
    const canonical = intentPath(intent);
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: `${siteUrl}${canonical}`,
        type: "website",
        locale: "en_ZA",
      },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  }

  const activity = await resolveActivityFromCms(resolved.activitySlug, intent);
  if (!activity) {
    if (intent === "watch" && resolved.kind === "browse") {
      const location = await getLocationBySlug(resolved.activitySlug);
      if (location && isWatchCityHubLocation(location)) {
        return watchCityMetadata(location);
      }
    }
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  if (resolved.kind === "browse") {
    const title = intentBrowseTitle(intent, activity.name);
    const description = intentBrowseDescription(intent, activity.name);
    const canonical = intentPath(intent, activity.slug);
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: `${siteUrl}${canonical}`,
        type: "website",
        locale: "en_ZA",
      },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
      keywords: [activity.name, intent, "LeagueSports", "South Africa"],
    };
  }

  const location = await getLocationBySlug(resolved.locationSlug);
  if (!location) {
    return { title: "Location not found", robots: { index: false, follow: false } };
  }

  const [results, fixtures] = await Promise.all([
    getVenuesByLocationAndActivityWithFallback(
      intent,
      resolved.locationSlug,
      activity,
      location,
    ),
    intent === "watch" ? loadWatchCityFixtures() : Promise.resolve([]),
  ]);
  const venues =
    intent === "watch" ? dedupeVenuesBySlug(results.venues) : results.venues;
  const enrichment = scopeWatchEnrichment(
    buildIntentEnrichment(intent, venues),
    intent,
    venues,
    fixtures,
    activity.sportSlug,
  );
  const indexPolicy = resolveIntentIndexPolicy({
    locationSlug: location.slug,
    parentSlug: location.parentSlug,
    venueCount: venues.length,
    usedCityFallback: results.usedCityFallback,
  });
  const title = intentDetailTitle(intent, activity.name, location.title);
  const description = intentDetailDescription(
    intent,
    activity.name,
    location.title,
    venues.length,
    metaDescriptionExtras(enrichment, intent),
  );
  const canonical = intentPath(
    intent,
    activity.slug,
    indexPolicy.canonicalLocationSlug,
  );
  const ogImage = intentOgImageUrl(
    enrichment.ogImageVenue as VenueDetail | null,
  );
  const pageUrl = `${siteUrl}${canonical}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      locale: "en_ZA",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      index: indexPolicy.indexable,
      follow: true,
    },
    keywords: [
      intent,
      activity.name,
      location.title,
      "venues",
      "LeagueSports",
      "South Africa",
    ],
  };
}

export async function IntentSeoPage({
  intent,
  route,
  initialFixture = null,
}: {
  intent: IntentKind;
  route: string[] | undefined;
  initialFixture?: string | null;
}) {
  const resolved = resolveIntentRoute(route);
  const siteUrl = getSiteBaseUrl();

  if (resolved.kind === "not-found") notFound();

  if (resolved.kind === "landing") {
    const choices =
      intent === "watch"
        ? await listWatchActivities()
        : await listPlaySports();
    const sports = choices.filter((item) => item.kind === "sport");
    const series = choices.filter((item) => item.kind === "series");
    const title = intentLandingTitle(intent);
    const description = intentLandingDescription(intent);
    const jsonLd = buildIntentJsonLd({
      intent,
      title,
      description,
      siteUrl,
    });

    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <IntentNav intent={intent} />
        <IntentHub intent={intent} />
        <IntentBrowseGrid
          intent={intent}
          eyebrow={intent === "watch" ? "Sports" : "Sports"}
          title="Choose a sport"
          description={
            intent === "watch"
              ? "Open a sport to see suburbs with screening venues."
              : "Open a sport to see suburbs with courts and clubs."
          }
          items={sports.map((item) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            subtitle: intent === "watch" ? `Watch ${item.name}` : `Play ${item.name}`,
          }))}
          emptyMessage={`No ${intent} sports listed yet.`}
        />
        {intent === "watch" && series.length > 0 ? (
          <IntentBrowseGrid
            intent={intent}
            eyebrow="Series"
            title="Series & championships"
            description="Select a series to see venues showing those broadcasts."
            items={series.map((item) => ({
              id: item.id,
              slug: item.slug,
              name: item.name,
              subtitle: `Watch ${item.name}`,
            }))}
            emptyMessage="No series listed yet."
          />
        ) : null}
      </div>
    );
  }

  const activity = await resolveActivityFromCms(resolved.activitySlug, intent);
  if (!activity) {
    if (intent === "watch") {
      const location = await getLocationBySlug(resolved.activitySlug);
      if (location && isWatchCityHubLocation(location)) {
        return (
          <WatchOnlyCityPage
            location={location}
            initialFixture={initialFixture}
            siteUrl={siteUrl}
          />
        );
      }
    }
    notFound();
  }

  if (resolved.kind === "browse") {
    const locations = await listLocationsForActivity(intent, activity);
    const title = intentBrowseTitle(intent, activity.name);
    const description = intentBrowseDescription(intent, activity.name);
    const jsonLd = buildIntentJsonLd({
      intent,
      title,
      description,
      activitySlug: activity.slug,
      activityName: activity.name,
      siteUrl,
    });

    return (
      <div className="min-h-screen bg-[#0c0f0c] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <IntentNav intent={intent} activityName={activity.name} />
        <IntentHub
          intent={intent}
          activityName={activity.name}
          activitySlug={activity.slug}
        />
        <IntentBrowseGrid
          intent={intent}
          activitySlug={activity.slug}
          eyebrow="Areas"
          title="Choose an area"
          description={
            intent === "watch"
              ? "Pick a suburb to see venues screening this activity."
              : "Pick a suburb to see venues hosting this sport."
          }
          items={locations.map((location) => ({
            id: location.id,
            slug: location.slug,
            name: location.title,
            subtitle:
              intent === "watch"
                ? `Watch ${activity.name}`
                : `Play ${activity.name}`,
          }))}
          emptyMessage={`No suburbs with ${intent} venues for ${activity.name} yet.`}
        />
      </div>
    );
  }

  const location = await getLocationBySlug(resolved.locationSlug);
  if (!location) notFound();

  const guideCitySlug = location.parentSlug || location.slug;
  const [results, nearby, fixtures, citySports] = await Promise.all([
    getVenuesByLocationAndActivityWithFallback(
      intent,
      resolved.locationSlug,
      activity,
      location,
    ),
    listLocationsForActivity(intent, activity),
    intent === "watch" ? loadWatchCityFixtures() : Promise.resolve([]),
    intent === "watch"
      ? listWatchSportsInLocation(guideCitySlug)
      : Promise.resolve([]),
  ]);
  const venues =
    intent === "watch" ? dedupeVenuesBySlug(results.venues) : results.venues;

  const enrichment = scopeWatchEnrichment(
    buildIntentEnrichment(intent, venues),
    intent,
    venues,
    fixtures,
    activity.sportSlug,
  );
  const relatedGuides =
    intent === "watch"
      ? watchRelatedGuides(activity.sportSlug, guideCitySlug)
      : [];
  const heading = intentDetailHeading(intent, activity.name, location.title);
  const title = intentDetailTitle(intent, activity.name, location.title);
  const description = intentDetailDescription(
    intent,
    activity.name,
    location.title,
    venues.length,
    metaDescriptionExtras(enrichment, intent),
  );
  const introParagraphs = buildIntentIntroParagraphs({
    intent,
    activity,
    locationTitle: location.title,
    venueCount: venues.length,
    usedCityFallback: results.usedCityFallback,
    cityTitle: results.cityTitle,
    enrichment,
  });
  const faqs = intentDetailFaqs({
    intent,
    activity,
    locationTitle: location.title,
    venueCount: venues.length,
  });
  const jsonLd = buildIntentJsonLd({
    intent,
    title,
    description,
    activitySlug: activity.slug,
    activityName: activity.name,
    locationSlug: location.slug,
    locationTitle: location.title,
    venues: venues.map((venue) => ({
      name: venue.name,
      slug: venue.slug,
    })),
    faqs,
    siteUrl,
  });

  const matrix = selectCtaMatrix({
    pageType: intent === "watch" ? "watch_city_sport" : "play_city_sport",
    sport: activity.sportSlug || activity.slug,
    city: location.slug,
    venueCount: venues.length,
  });
  const related = nearby
    .filter((item) => item.slug !== location.slug)
    .slice(0, 8)
    .map((item) => ({ slug: item.slug, title: item.title }));

  return (
    <div className="min-h-screen bg-[#0c0f0c] pb-24 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IntentNav
        intent={intent}
        activityName={activity.name}
        locationTitle={location.title}
      />
      {/*
        Fixture strip and venue cards render here, before FAQ, from data
        already awaited above. Do not wrap the list in Suspense — a hole
        streams FAQ ahead of the cards.
      */}
      {intent === "watch" ? (
        <FanzoWatchHub
          mode="sport"
          heading={heading}
          sportName={activity.name}
          sportSlug={activity.sportSlug}
          locationTitle={location.title}
          distanceCityTitle={location.parentTitle || location.title}
          pageCitySlug={location.slug}
          guideCitySlug={guideCitySlug}
          guideCityTitle={location.parentTitle || location.title}
          cityHubHref={
            isWatchCityHubLocation(location)
              ? intentPath("watch", location.slug)
              : location.parentSlug
                ? intentPath("watch", location.parentSlug)
                : null
          }
          venues={venues}
          fixtures={fixtures}
          sports={citySports}
          matrix={matrix}
          sourcePage={intentPath(intent, activity.slug, location.slug)}
          initialFixture={initialFixture}
          usedCityFallback={results.usedCityFallback}
          fallbackSuburb={results.suburbTitle}
          fallbackCity={results.cityTitle}
        />
      ) : (
        <>
          <IntentHero
            intent={intent}
            activity={activity}
            locationTitle={location.title}
            locationSlug={location.slug}
            heading={heading}
            introParagraphs={introParagraphs}
            venueCount={venues.length}
            amenityStats={enrichment.amenityStats}
            matrix={matrix}
            sourcePage={intentPath(intent, activity.slug, location.slug)}
          />
          <IntentHighlights
            intent={intent}
            amenityStats={enrichment.amenityStats}
            verifiedCount={enrichment.verifiedCount}
          />
          <IntentVenuesSection
            intent={intent}
            venues={venues}
            activityName={activity.name}
            activitySlug={activity.slug}
            sportSlug={activity.sportSlug}
            fixtures={fixtures}
            matrix={matrix}
            locationTitle={location.title}
            usedCityFallback={results.usedCityFallback}
            suburbTitle={results.suburbTitle}
            cityTitle={results.cityTitle}
            related={related}
            relatedGuides={relatedGuides}
            locationSlug={location.slug}
            sourcePage={intentPath(intent, activity.slug, location.slug)}
          />
        </>
      )}
      <IntentFaqSection intent={intent} faqs={faqs} />
    </div>
  );
}
