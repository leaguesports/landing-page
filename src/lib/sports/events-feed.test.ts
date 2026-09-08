import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPORT_CATALOG } from "./catalog.ts";
import {
  buildUpcomingFixtures,
  cmsEventsToFixtures,
  EVENT_KICKOFF_GROQ,
  EVENTS_CMS_ON_DAY_QUERY,
  EVENTS_CMS_QUERY,
  EVENTS_SCREENINGS_ON_DAY_QUERY,
  EVENTS_SCREENINGS_QUERY,
  findFixtureBySlug,
  fixtureCalendarDay,
  fixtureSlugFromTitle,
  fixtureWatchHref,
  formatFixtureWhen,
  groupScreeningsIntoFixtures,
  mergeUpcomingFixtures,
  normalizeFixtureKey,
  parseFixtureSlug,
  saDayBounds,
  selectFeaturedFixture,
  upcomingNotBeforeIso,
} from "./events-feed.ts";

describe("events feed queries", () => {
  it("filters and orders by upcoming kickoff in GROQ", () => {
    assert.match(EVENTS_SCREENINGS_QUERY, /_type == "venue"/);
    assert.match(EVENTS_SCREENINGS_QUERY, /startsAt >= \$notBefore/);
    assert.match(EVENTS_SCREENINGS_QUERY, /order\(startsAt asc\)/);
    assert.match(EVENTS_SCREENINGS_QUERY, /order\(nextKickoff asc\)/);
    assert.match(EVENTS_SCREENINGS_QUERY, /math::min\(/);
    assert.doesNotMatch(EVENTS_SCREENINGS_QUERY, /"nextKickoff":\s*min\(/);
    assert.doesNotMatch(EVENTS_SCREENINGS_QUERY, /order\(_updatedAt/);
    assert.match(EVENTS_SCREENINGS_QUERY, /address\.city->title/);
    assert.match(EVENTS_SCREENINGS_QUERY, /address\.city->slug\.current/);
    assert.match(EVENTS_SCREENINGS_QUERY, /fixtureSlug/);
    assert.match(EVENTS_CMS_QUERY, /_type == "event"/);
    assert.match(EVENTS_SCREENINGS_ON_DAY_QUERY, /\$dayStart/);
    assert.match(EVENTS_SCREENINGS_ON_DAY_QUERY, /order\(nextKickoff asc\)/);
    assert.match(EVENTS_SCREENINGS_ON_DAY_QUERY, /math::min\(/);
    assert.match(EVENTS_SCREENINGS_ON_DAY_QUERY, /address\.city->title/);
    assert.match(EVENTS_SCREENINGS_ON_DAY_QUERY, /fixtureSlug/);
    assert.doesNotMatch(EVENTS_SCREENINGS_ON_DAY_QUERY, /order\(_updatedAt/);
    assert.match(EVENTS_CMS_ON_DAY_QUERY, /\$dayEnd/);
  });

  it("uses coalesce(startDateTime, startsAt, f1Details.dateTime) and does not require F1-only kickoff", () => {
    assert.equal(
      EVENT_KICKOFF_GROQ,
      "coalesce(startDateTime, startsAt, f1Details.dateTime)",
    );
    assert.match(
      EVENTS_CMS_QUERY,
      /coalesce\(startDateTime,\s*startsAt,\s*f1Details\.dateTime\)/,
    );
    assert.match(
      EVENTS_CMS_QUERY,
      /coalesce\(startDateTime,\s*startsAt,\s*f1Details\.dateTime\) >= \$notBefore/,
    );
    assert.match(
      EVENTS_CMS_QUERY,
      /order\(coalesce\(startDateTime,\s*startsAt,\s*f1Details\.dateTime\) asc\)/,
    );
    assert.doesNotMatch(EVENTS_CMS_QUERY, /defined\(f1Details\.dateTime\)/);
    assert.match(EVENTS_CMS_QUERY, /\bfeatured\b/);
    assert.match(EVENTS_CMS_QUERY, /\bseoIntro\b/);
    assert.match(EVENTS_CMS_QUERY, /\blocalAngle\b/);
    assert.match(EVENTS_CMS_QUERY, /faqs\[\]/);
    assert.match(EVENTS_CMS_QUERY, /hostVenue->/);
    assert.match(EVENTS_CMS_QUERY, /relatedGuide->/);
    assert.match(EVENTS_CMS_QUERY, /\bstartDateTime\b/);
    assert.match(EVENTS_CMS_QUERY, /\bf1Details\.track\b/);
    assert.match(
      EVENTS_CMS_ON_DAY_QUERY,
      /coalesce\(startDateTime,\s*startsAt,\s*f1Details\.dateTime\)/,
    );
    assert.doesNotMatch(EVENTS_CMS_ON_DAY_QUERY, /defined\(f1Details\.dateTime\)/);
    assert.match(EVENTS_CMS_ON_DAY_QUERY, /\bfeatured\b/);
  });
});
