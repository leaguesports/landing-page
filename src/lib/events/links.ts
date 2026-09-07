import { activitySupportsIntent, buildIntentActivity } from "../intent/activity.ts";
import { intentPath } from "../intent/paths.ts";
import { guideHref, isGuideSlug } from "../guides/slugs.ts";
import type { UpcomingFixture } from "../sports/events-feed.ts";

export type FixtureRelatedLink = {
  href: string;
  label: string;
  kind: "venue" | "guide" | "fixture" | "watch" | "play";
};

function uniqueCitySlugs(fixture: UpcomingFixture): string[] {
  const slugs = new Set<string>();
  if (fixture.hostVenue?.citySlug?.trim()) {
    slugs.add(fixture.hostVenue.citySlug.trim());
  }
  for (const venue of fixture.venues) {
    if (venue.citySlug?.trim()) slugs.add(venue.citySlug.trim());
  }
  return [...slugs];
}

export function relatedFixtureLinks(
  fixture: UpcomingFixture,
  others: UpcomingFixture[],
  limit = 3,
): FixtureRelatedLink[] {
  const sport = fixture.sportSlug;
  if (!sport) return [];
  return others
    .filter(
      (item) =>
        item.slug !== fixture.slug &&
        item.sportSlug === sport &&
        item.title.trim() &&
        item.slug.trim(),
    )
    .slice(0, limit)
    .map((item) => ({
      href: `/events/${item.slug}`,
      label: item.title,
      kind: "fixture" as const,
    }));
}

/**
 * Internal links that already exist: host venue, guide, related fixtures,
 * and city watch/play landings from real CMS city slugs.
 */
export function fixtureInternalLinks(
  fixture: UpcomingFixture,
  related: UpcomingFixture[] = [],
): FixtureRelatedLink[] {
  const links: FixtureRelatedLink[] = [];
  const seen = new Set<string>();

  function push(link: FixtureRelatedLink) {
    if (!link.href || seen.has(link.href)) return;
    seen.add(link.href);
    links.push(link);
  }

  if (fixture.hostVenue?.slug && fixture.hostVenue.name) {
    push({
      href: `/venues/${fixture.hostVenue.slug}`,
      label: fixture.hostVenue.name,
      kind: "venue",
    });
  }
  for (const venue of fixture.venues) {
    if (!venue.slug || !venue.name) continue;
    push({
      href: `/venues/${venue.slug}`,
      label: venue.name,
      kind: "venue",
    });
  }

  const guideSlug = fixture.relatedGuide?.slug;
  if (guideSlug && isGuideSlug(guideSlug) && fixture.relatedGuide?.title) {
    push({
      href: guideHref(guideSlug),
      label: fixture.relatedGuide.title,
      kind: "guide",
    });
  }

  for (const item of relatedFixtureLinks(fixture, related)) {
    push(item);
  }

  const sport = fixture.sportSlug;
  if (sport) {
    const activity = buildIntentActivity({ slug: sport });
    for (const citySlug of uniqueCitySlugs(fixture)) {
      if (activitySupportsIntent(activity, "watch")) {
        push({
          href: intentPath("watch", sport, citySlug),
          label: `Watch ${activity.name} in ${citySlug.replace(/-/g, " ")}`,
          kind: "watch",
        });
      }
      if (activitySupportsIntent(activity, "play")) {
        push({
          href: intentPath("play", sport, citySlug),
          label: `Play ${activity.name} in ${citySlug.replace(/-/g, " ")}`,
          kind: "play",
        });
      }
    }
  }

  return links;
}
