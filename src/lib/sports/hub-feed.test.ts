import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  eventToFeedItem,
  filterFeedByVenueSlugs,
  fixtureToFeedItem,
  fixturesToFollowedFeedItems,
  fixturesToPreferredFeedItems,
  formatHubWhen,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_FOLLOWED_SCREENINGS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  MAX_FOLLOWED_FIXTURE_SLUGS,
  MAX_FOLLOWED_VENUE_SLUGS,
  MAX_PREFERRED_FIXTURE_SLUGS,
  mergeHubFeedItems,
  normalizePreferredSportSlugs,
  screeningsToFeedItems,
  sortHubFeed,
  sortHubFeedPreferringSports,
  uniqueFollowedFixtureSlugs,
  uniqueFollowedVenueSlugs,
  type HubFeedItem,
} from "./hub-feed.ts";
import { SPORT_CATALOG } from "./catalog.ts";
import type { UpcomingFixture } from "./events-feed.ts";

describe("hub feed queries", () => {
  it("reads CMS events, screenings, and guides — not hardcoded races", () => {
    assert.match(HUB_EVENTS_QUERY, /_type == "event"/);
    assert.match(HUB_EVENTS_QUERY, /f1Details\.dateTime/);
    assert.match(HUB_SCREENINGS_QUERY, /upcoming_screenings/);
    assert.match(HUB_SCREENINGS_QUERY, /fixtureSlug/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /slug\.current in \$slugs/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /count\(upcoming_screenings\) > 0/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /order\(_updatedAt desc\)/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /\[0\.\.\.24\]/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /upcoming_screenings\[0\.\.\.12\]/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /fixtureSlug/);
    assert.match(HUB_GUIDES_QUERY, /_type == "guide"/);
    assert.doesNotMatch(HUB_EVENTS_QUERY, /Monaco|Verstappen/);
  });
});
