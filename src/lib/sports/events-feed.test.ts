import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPORT_CATALOG } from "./catalog.ts";
import {
  buildUpcomingFixtures,
  cmsEventsToFixtures,
  EVENTS_CMS_QUERY,
  EVENTS_SCREENINGS_QUERY,
  findFixtureBySlug,
  fixtureSlugFromTitle,
  fixtureWatchHref,
  formatFixtureWhen,
  groupScreeningsIntoFixtures,
  mergeUpcomingFixtures,
  normalizeFixtureKey,
} from "./events-feed.ts";

describe("events feed queries", () => {
  it("reads venue screenings and CMS events for the public hub", () => {
    assert.match(EVENTS_SCREENINGS_QUERY, /_type == "venue"/);
    assert.match(EVENTS_SCREENINGS_QUERY, /upcoming_screenings/);
    assert.match(EVENTS_CMS_QUERY, /_type == "event"/);
    assert.match(EVENTS_CMS_QUERY, /f1Details\.dateTime/);
  });
});

describe("fixtureSlugFromTitle", () => {
  it("slugifies big-game titles for /events URLs", () => {
    assert.equal(
      fixtureSlugFromTitle("Springboks vs All Blacks"),
      "springboks-vs-all-blacks",
    );
    assert.equal(
      fixtureSlugFromTitle("SA vs New Zealand — Ellis Park"),
      "sa-vs-new-zealand-ellis-park",
    );
  });
});

describe("normalizeFixtureKey", () => {
  it("collapses whitespace so venues listing the same fixture merge", () => {
    assert.equal(
      normalizeFixtureKey("  Springboks   vs  All Blacks "),
      "springboks vs all blacks",
    );
  });
});

describe("groupScreeningsIntoFixtures", () => {
  const now = new Date("2026-09-05T10:00:00.000Z");

  it("groups the same kickoff title across venues and tags rugby", () => {
    const fixtures = groupScreeningsIntoFixtures(
      [
        {
          name: "The Local",
          slug: "the-local",
          broadcasts: [{ name: "Rugby", slug: "rugby" }],
          upcoming_screenings: [
            {
              title: "Springboks vs All Blacks",
              startsAt: "2026-09-06T16:00:00.000Z",
            },
          ],
        },
        {
          name: "Fan Zone CPT",
          slug: "fan-zone-cpt",
          broadcasts: [{ name: "Rugby", slug: "rugby" }],
          upcoming_screenings: [
            {
              title: "Springboks vs All Blacks",
              startsAt: "2026-09-06T16:00:00.000Z",
            },
          ],
        },
      ],
      SPORT_CATALOG,
      { now },
    );

    assert.equal(fixtures.length, 1);
    assert.equal(fixtures[0]?.slug, "springboks-vs-all-blacks");
    assert.equal(fixtures[0]?.sportSlug, "rugby");
    assert.equal(fixtures[0]?.venues.length, 2);
    assert.equal(fixtures[0]?.kind, "screening");
  });

  it("drops screenings that already kicked off", () => {
    const fixtures = groupScreeningsIntoFixtures(
      [
        {
          name: "Old Bar",
          slug: "old-bar",
          broadcasts: [],
          upcoming_screenings: [
            {
              title: "Yesterday's derby",
              startsAt: "2026-09-04T12:00:00.000Z",
            },
          ],
        },
      ],
      SPORT_CATALOG,
      { now },
    );
    assert.equal(fixtures.length, 0);
  });
});

describe("cmsEventsToFixtures", () => {
  it("maps F1-style CMS events to fixture rows with event pages", () => {
    const fixtures = cmsEventsToFixtures(
      [
        {
          id: "e1",
          title: "Italian Grand Prix",
          slug: "italian-grand-prix",
          series: "f1",
          dateTime: "2026-09-07T13:00:00.000Z",
          track: "Monza",
        },
      ],
      SPORT_CATALOG,
      { now: new Date("2026-09-05T10:00:00.000Z") },
    );

    assert.equal(fixtures.length, 1);
    assert.equal(fixtures[0]?.sportSlug, "motorsport");
    assert.equal(
      fixtures[0]?.eventPageHref,
      "/motorsport/f1/italian-grand-prix",
    );
    assert.equal(fixtures[0]?.venues.length, 0);
  });
});

describe("mergeUpcomingFixtures + buildUpcomingFixtures", () => {
  const now = new Date("2026-09-05T10:00:00.000Z");

  it("merges a CMS event into a screening when titles match", () => {
    const screenings = groupScreeningsIntoFixtures(
      [
        {
          name: "Pit Stop",
          slug: "pit-stop",
          broadcasts: [{ slug: "motorsport" }],
          upcoming_screenings: [
            {
              title: "Italian Grand Prix",
              startsAt: "2026-09-07T13:00:00.000Z",
            },
          ],
        },
      ],
      SPORT_CATALOG,
      { now },
    );
    const events = cmsEventsToFixtures(
      [
        {
          title: "Italian Grand Prix",
          slug: "italian-grand-prix",
          series: "f1",
          dateTime: "2026-09-07T13:00:00.000Z",
        },
      ],
      SPORT_CATALOG,
      { now },
    );

    const merged = mergeUpcomingFixtures(screenings, events);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.kind, "both");
    assert.equal(merged[0]?.venues.length, 1);
    assert.ok(merged[0]?.eventPageHref);
  });

  it("orders soonest fixtures with venues first on equal kickoff", () => {
    const fixtures = buildUpcomingFixtures(
      [
        {
          name: "A",
          slug: "a",
          broadcasts: [{ slug: "rugby" }],
          upcoming_screenings: [
            { title: "Boks vs All Blacks", startsAt: "2026-09-06T16:00:00.000Z" },
          ],
        },
      ],
      [
        {
          title: "Quiet CMS race",
          slug: "quiet-cms-race",
          series: "f1",
          dateTime: "2026-09-06T16:00:00.000Z",
        },
      ],
      SPORT_CATALOG,
      { now, limit: 10 },
    );

    assert.equal(fixtures[0]?.title, "Boks vs All Blacks");
    assert.ok(fixtures[0]!.venues.length > 0);
  });
});

describe("findFixtureBySlug + fixtureWatchHref", () => {
  it("resolves detail URLs for screening-backed fixtures", () => {
    const fixtures = buildUpcomingFixtures(
      [
        {
          name: "The Local",
          slug: "the-local",
          broadcasts: [{ slug: "rugby" }],
          upcoming_screenings: [
            {
              title: "Springboks vs All Blacks",
              startsAt: "2026-09-06T16:00:00.000Z",
            },
          ],
        },
      ],
      [],
      SPORT_CATALOG,
      { now: new Date("2026-09-05T10:00:00.000Z") },
    );

    const found = findFixtureBySlug(fixtures, "springboks-vs-all-blacks");
    assert.ok(found);
    assert.equal(fixtureWatchHref(found!), "/events/springboks-vs-all-blacks");
  });
});

describe("formatFixtureWhen", () => {
  it("formats today/tomorrow in en-ZA", () => {
    const now = new Date("2026-09-05T08:00:00.000Z");
    const label = formatFixtureWhen("2026-09-05T16:00:00.000Z", now);
    assert.ok(label?.startsWith("Today"));
  });
});
