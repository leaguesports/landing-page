import { IntentBrowseGrid } from "@/components/intent/IntentBrowseGrid";
import { IntentFaqSection } from "@/components/intent/IntentFaqSection";
import { IntentHero } from "@/components/intent/IntentHero";
import { IntentHighlights } from "@/components/intent/IntentHighlights";
import { IntentHub } from "@/components/intent/IntentHub";
import { IntentNav } from "@/components/intent/IntentNav";
import { IntentVenuesSection } from "@/components/intent/IntentVenuesSection";
import {
  intentBrowseDescription,
  intentBrowseTitle,
  intentDetailDescription,
  intentDetailFaqs,
  intentDetailHeading,
  intentDetailTitle,
  intentLandingDescription,
  intentLandingTitle,
} from "@/lib/intent/copy";
import {
  getLocationBySlug,
  getVenuesByLocationAndActivityWithFallback,
  listLocationsForActivity,
  listPlaySports,
  listWatchActivities,
  resolveActivityFromCms,
} from "@/lib/intent/data";
import {
  buildIntentEnrichment,
  buildIntentIntroParagraphs,
  resolveIntentIndexPolicy,
} from "@/lib/intent/enrichment";
import { buildIntentJsonLd } from "@/lib/intent/jsonLd";
import type { IntentKind } from "@/lib/intent/paths";
import { intentPath } from "@/lib/intent/paths";
import { resolveIntentRoute } from "@/lib/intent/routes";
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

function primaryCta(intent: IntentKind, activitySlug: string) {
  if (intent === "play") {
    if (activitySlug === "padel") {
      return { href: "/padel/new", label: "Start a padel match" };
    }
    if (activitySlug === "golf") {
      return { href: "/golf/new", label: "Start a golf round" };
    }
    return { href: "#venues", label: "See venues" };
  }
  return { href: "/events", label: "See fixtures" };
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

  const results = await getVenuesByLocationAndActivityWithFallback(
    intent,
    resolved.locationSlug,
    activity,
    location,
  );
  const enrichment = buildIntentEnrichment(intent, results.venues);
  const indexPolicy = resolveIntentIndexPolicy({
    locationSlug: location.slug,
    parentSlug: location.parentSlug,
    venueCount: results.venues.length,
    usedCityFallback: results.usedCityFallback,
  });
  const title = intentDetailTitle(intent, activity.name, location.title);
  const description = intentDetailDescription(
    intent,
    activity.name,
    location.title,
    results.venues.length,
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
}: {
  intent: IntentKind;
  route: string[] | undefined;
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
  if (!activity) notFound();

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

  const [results, nearby] = await Promise.all([
    getVenuesByLocationAndActivityWithFallback(
      intent,
      resolved.locationSlug,
      activity,
      location,
    ),
    listLocationsForActivity(intent, activity),
  ]);

  const enrichment = buildIntentEnrichment(intent, results.venues);
  const heading = intentDetailHeading(intent, activity.name, location.title);
  const title = intentDetailTitle(intent, activity.name, location.title);
  const description = intentDetailDescription(
    intent,
    activity.name,
    location.title,
    results.venues.length,
    metaDescriptionExtras(enrichment, intent),
  );
  const introParagraphs = buildIntentIntroParagraphs({
    intent,
    activity,
    locationTitle: location.title,
    venueCount: results.venues.length,
    usedCityFallback: results.usedCityFallback,
    cityTitle: results.cityTitle,
    enrichment,
  });
  const faqs = intentDetailFaqs({
    intent,
    activity,
    locationTitle: location.title,
    venueCount: results.venues.length,
  });
  const jsonLd = buildIntentJsonLd({
    intent,
    title,
    description,
    activitySlug: activity.slug,
    activityName: activity.name,
    locationSlug: location.slug,
    locationTitle: location.title,
    venues: results.venues.map((venue) => ({
      name: venue.name,
      slug: venue.slug,
    })),
    faqs,
    siteUrl,
  });

  const cta = primaryCta(intent, activity.slug);
  const related = nearby
    .filter((item) => item.slug !== location.slug)
    .slice(0, 8)
    .map((item) => ({ slug: item.slug, title: item.title }));

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IntentNav
        intent={intent}
        activityName={activity.name}
        locationTitle={location.title}
      />
      <IntentHero
        intent={intent}
        activity={activity}
        locationTitle={location.title}
        heading={heading}
        introParagraphs={introParagraphs}
        venueCount={results.venues.length}
        amenityStats={enrichment.amenityStats}
        primaryHref={cta.href}
        primaryLabel={cta.label}
        secondaryHref="#venues"
        secondaryLabel="Browse venues"
      />
      <IntentHighlights
        intent={intent}
        amenityStats={enrichment.amenityStats}
        screenings={enrichment.screeningHighlights}
        verifiedCount={enrichment.verifiedCount}
      />
      <IntentVenuesSection
        intent={intent}
        venues={results.venues}
        activityName={activity.name}
        activitySlug={activity.slug}
        locationTitle={location.title}
        usedCityFallback={results.usedCityFallback}
        suburbTitle={results.suburbTitle}
        cityTitle={results.cityTitle}
        related={related}
      />
      <IntentFaqSection intent={intent} faqs={faqs} />
    </div>
  );
}
