import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPORT_CATALOG } from "./catalog.ts";
import {
  buildUpcomingFixtures,
  cmsEventsToFixtures,
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
  upcomingNotBeforeIso,
} from "./events-feed.ts";

describe("events feed queries", () => {
  it("filters and orders by upcoming kickoff in GROQ", () => {
    assert.match(EVENTS_SCREENINGS_QUERY, /_type == "venue"/);
    assert.match(EVENTS_SCREENINGS_QUERY, /startsAt >= \$notBefore/);
    assert.match(EVENTS_SCREENINGS_QUERY, /order\(startsAt asc\)/);
    assert.match(EVENTS_SCREENINGS_QUERY, /order\(nextKickoff asc\)/);
    assert.doesNotMatch(EVENTS_SCREENINGS_QUERY, /order\(_updatedAt/);
    assert.match(EVENTS_CMS_QUERY, /_type == "event"/);
    assert.match(EVENTS_CMS_QUERY, /f1Details\.dateTime >= \$notBefore/);
    assert.match(EVENTS_CMS_QUERY, /order\(f1Details\.dateTime asc\)/);
    assert.match(EVENTS_SCREENINGS_ON_DAY_QUERY, /\$dayStart/);
    assert.match(EVENTS_SCREENINGS_ON_DAY_QUERY, /order\(nextKickoff asc\)/);
    assert.doesNotMatch(EVENTS_SCREENINGS_ON_DAY_QUERY, /order\(_updatedAt/);
    assert.match(EVENTS_CMS_ON_DAY_QUERY, /\$dayEnd/);
  });
});

describe("fixtureCalendarDay + saDayBounds", () => {
  it("maps kickoffs to Africa/Johannesburg calendar days", () => {
    // 16:00 UTC on 6 Sep = 18:00 SAST same day
    assert.equal(
      fixtureCalendarDay("2026-09-06T16:00:00.000Z"),
      "2026-09-06",
    );
    // 22:00 UTC on 6 Sep = 00:00 SAST on 7 Sep
    assert.equal(
      fixtureCalendarDay("2026-09-06T22:00:00.000Z"),
      "2026-09-07",
    );
  });

  it("builds SAST day bounds in UTC", () => {
    const { dayStart, dayEnd } = saDayBounds("2026-09-06");
    assert.equal(dayStart, "2026-09-05T22:00:00.000Z");
    assert.equal(dayEnd, "2026-09-06T22:00:00.000Z");
  });
});

describe("fixtureSlugFromTitle + normalizeFixtureKey", () => {
  it("slugifies titles and appends the SA calendar day when known", () => {
    assert.equal(
      fixtureSlugFromTitle("Springboks vs All Blacks"),
      "springboks-vs-all-blacks",
    );
    assert.equal(
      fixtureSlugFromTitle(
        "Springboks vs All Blacks",
        "2026-09-06T16:00:00.000Z",
      ),
      "springboks-vs-all-blacks-2026-09-06",
    );
  });

  it("keys fixtures by title + day so recurring matches stay distinct", () => {
    assert.equal(
      normalizeFixtureKey("  Springboks   vs  All Blacks "),
      "springboks vs all blacks",
    );
    assert.equal(
      normalizeFixtureKey(
        "Springboks vs All Blacks",
        "2026-09-06T16:00:00.000Z",
      ),
      "springboks vs all blacks|2026-09-06",
    );
    assert.notEqual(
      normalizeFixtureKey(
        "Springboks vs All Blacks",
        "2026-09-06T16:00:00.000Z",
      ),
      normalizeFixtureKey(
        "Springboks vs All Blacks",
        "2026-09-13T16:00:00.000Z",
      ),
    );
  });

  it("aligns key and slug so punctuation variants merge onto one URL", () => {
    const startsAt = "2026-09-06T16:00:00.000Z";
    assert.equal(
      normalizeFixtureKey("Springboks vs All Blacks", startsAt),
      normalizeFixtureKey("Springboks vs All-Blacks", startsAt),
    );
    assert.equal(
      fixtureSlugFromTitle("Springboks vs All Blacks", startsAt),
      fixtureSlugFromTitle("Springboks vs All-Blacks", startsAt),
    );
    assert.equal(
      fixtureSlugFromTitle("Springboks vs All-Blacks", startsAt),
      "springboks-vs-all-blacks-2026-09-06",
    );
  });
});

describe("parseFixtureSlug", () => {
  it("splits a day-suffixed events URL slug", () => {
    assert.deepEqual(
      parseFixtureSlug("springboks-vs-all-blacks-2026-09-06"),
      { baseSlug: "springboks-vs-all-blacks", day: "2026-09-06" },
    );
    assert.deepEqual(parseFixtureSlug("italian-grand-prix"), {
      baseSlug: "italian-grand-prix",
      day: null,
    });
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
    assert.equal(fixtures[0]?.slug, "springboks-vs-all-blacks-2026-09-06");
    assert.equal(fixtures[0]?.sportSlug, "rugby");
    assert.equal(fixtures[0]?.venues.length, 2);
    assert.equal(fixtures[0]?.kind, "screening");
  });

  it("keeps two Springboks Tests on different days as separate fixtures", () => {
    const fixtures = groupScreeningsIntoFixtures(
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
            {
              title: "Springboks vs All Blacks",
              startsAt: "2026-09-13T16:00:00.000Z",
            },
          ],
        },
      ],
      SPORT_CATALOG,
      { now },
    );

    assert.equal(fixtures.length, 2);
    const slugs = fixtures.map((item) => item.slug).sort();
    assert.deepEqual(slugs, [
      "springboks-vs-all-blacks-2026-09-06",
      "springboks-vs-all-blacks-2026-09-13",
    ]);
  });

  it("merges punctuation variants of the same kickoff onto one slug", () => {
    const fixtures = groupScreeningsIntoFixtures(
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
        {
          name: "Fan Zone CPT",
          slug: "fan-zone-cpt",
          broadcasts: [{ slug: "rugby" }],
          upcoming_screenings: [
            {
              title: "Springboks vs All-Blacks",
              startsAt: "2026-09-06T16:00:00.000Z",
            },
          ],
        },
      ],
      SPORT_CATALOG,
      { now },
    );

    assert.equal(fixtures.length, 1);
    assert.equal(fixtures[0]?.slug, "springboks-vs-all-blacks-2026-09-06");
    assert.equal(fixtures[0]?.venues.length, 2);
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
    assert.equal(fixtures[0]?.slug, "italian-grand-prix-2026-09-07");
    assert.equal(
      fixtures[0]?.eventPageHref,
      "/motorsport/f1/italian-grand-prix",
    );
    assert.equal(fixtures[0]?.venues.length, 0);
  });
});

describe("mergeUpcomingFixtures + buildUpcomingFixtures", () => {
  const now = new Date("2026-09-05T10:00:00.000Z");

  it("merges a CMS event into a screening when title and day match", () => {
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
    assert.equal(merged[0]?.slug, "italian-grand-prix-2026-09-07");
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
            {
              title: "Boks vs All Blacks",
              startsAt: "2026-09-06T16:00:00.000Z",
            },
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

    const found = findFixtureBySlug(
      fixtures,
      "springboks-vs-all-blacks-2026-09-06",
    );
    assert.ok(found);
    assert.equal(
      fixtureWatchHref(found!),
      "/events/springboks-vs-all-blacks-2026-09-06",
    );
  });
});

describe("formatFixtureWhen + upcomingNotBeforeIso", () => {
  it("formats today/tomorrow in en-ZA", () => {
    const now = new Date("2026-09-05T08:00:00.000Z");
    const label = formatFixtureWhen("2026-09-05T16:00:00.000Z", now);
    assert.ok(label?.startsWith("Today"));
  });

  it("computes the GROQ notBefore watermark from grace", () => {
    const now = new Date("2026-09-05T12:00:00.000Z");
    assert.equal(upcomingNotBeforeIso(now), "2026-09-05T06:00:00.000Z");
  });
});
