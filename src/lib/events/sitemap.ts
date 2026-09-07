import type { UpcomingFixture } from "../sports/events-feed.ts";
import { isFixtureIndexable } from "./index-bar.ts";

export type IndexableSitemapFixture = {
  slug: string;
  startsAt?: string;
  updatedAt?: string;
};

/**
 * Sitemap rows for fixtures that meet the index bar.
 * Thin stubs stay off the sitemap even if they appear on `/events`.
 */
export function toIndexableSitemapFixtures(
  fixtures: readonly UpcomingFixture[],
): IndexableSitemapFixture[] {
  const rows: IndexableSitemapFixture[] = [];
  for (const fixture of fixtures) {
    if (!isFixtureIndexable(fixture)) continue;
    const slug = fixture.slug.trim();
    if (!slug) continue;
    rows.push({
      slug,
      ...(fixture.startsAt ? { startsAt: fixture.startsAt } : {}),
      ...(fixture.updatedAt ? { updatedAt: fixture.updatedAt } : {}),
    });
  }
  return rows;
}
