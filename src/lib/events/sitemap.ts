import {
  fixtureSlugFromTitle,
  type UpcomingFixture,
} from "../sports/events-feed.ts";
import { isFixtureIndexable } from "./index-bar.ts";

export type IndexableSitemapFixture = {
  slug: string;
  startsAt?: string;
  updatedAt?: string;
};

/**
 * Past fixtures stay in the sitemap for one season window after kickoff.
 * Older date-specific URLs drop out so crawl attention stays on pages
 * people still search. Undated and future fixtures are kept.
 */
export const SITEMAP_PAST_EVENT_WINDOW_DAYS = 90;
export const SITEMAP_PAST_EVENT_WINDOW_MS =
  SITEMAP_PAST_EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export type SitemapEventDoc = {
  title?: unknown;
  slug?: unknown;
  startsAt?: unknown;
  updatedAt?: unknown;
  seoIntro?: unknown;
  localAngle?: unknown;
  faqs?: unknown;
};

function trimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function isBeyondPastEventWindow(startsAt: string, now: Date): boolean {
  const time = Date.parse(startsAt);
  if (!Number.isFinite(time)) return false;
  return now.getTime() - time > SITEMAP_PAST_EVENT_WINDOW_MS;
}

/**
 * One sitemap row per published, indexable event page.
 * `updatedAt` is the event document `_updatedAt` (never the kickoff).
 * Thin stubs stay out: those pages are noindex.
 */
export function toPublishedEventSitemapRows(
  docs: readonly SitemapEventDoc[],
  now: Date = new Date(),
): IndexableSitemapFixture[] {
  const bySlug = new Map<string, IndexableSitemapFixture>();

  for (const doc of docs) {
    if (!isFixtureIndexable(doc)) continue;
    const title = trimmedString(doc.title);
    if (!title) continue;
    const startsAt = trimmedString(doc.startsAt);
    if (startsAt && isBeyondPastEventWindow(startsAt, now)) continue;

    const slug = fixtureSlugFromTitle(title, startsAt);
    const updatedAt = trimmedString(doc.updatedAt) ?? undefined;
    const row: IndexableSitemapFixture = {
      slug,
      ...(startsAt ? { startsAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    };
    const existing = bySlug.get(slug);
    if (!existing || (updatedAt ?? "") > (existing.updatedAt ?? "")) {
      bySlug.set(slug, row);
    }
  }

  return [...bySlug.values()];
}

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
