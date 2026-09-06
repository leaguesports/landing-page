import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPORT_CATALOG } from "./catalog.ts";
import { buildUpcomingFixtures } from "./events-feed.ts";
import {
  EVENTS_CMS_BY_SLUG_QUERY,
  findFixtureBySlug,
  fixturePublicSlugs,
  fixtureWatchHref,
  mergeVenueUpcomingScreenings,
  tonightFixtureTeasers,
} from "./events-path.ts";

const now = new Date("2026-09-05T10:00:00.000Z");

describe("events path slug resolution", () => {
  it("looks up CMS events by slug.current", () => {
    assert.match(EVENTS_CMS_BY_SLUG_QUERY, /slug\.current == \$slug/);
    assert.match(EVENTS_CMS_BY_SLUG_QUERY, /_type == "event"/);
  });

  it("resolves CMS and title slugs without a day suffix to /events detail", () => {
    const fixtures = buildUpcomingFixtures(
      [],
      [
        {
          title: "Italian Grand Prix",
          slug: "italian-grand-prix",
          series: "f1",
          dateTime: "2026-09-06T13:00:00.000Z",
          featured: true,
        },
        {
          title: "Springboks vs All Blacks",
          slug: "springboks-vs-all-blacks-2026",
          series: "rugby",
          startsAt: "2026-09-13T15:00:00.000Z",
        },
      ],
      SPORT_CATALOG,
      { now },
    );

    const italian = findFixtureBySlug(fixtures, "italian-grand-prix", now);
    assert.equal(italian?.slug, "italian-grand-prix-2026-09-06");
    assert.equal(
      fixtureWatchHref(italian!),
      "/events/italian-grand-prix-2026-09-06",
    );
    assert.ok(fixturePublicSlugs(italian!).includes("italian-grand-prix"));

    const boks = findFixtureBySlug(fixtures, "springboks-vs-all-blacks", now);
    assert.equal(boks?.slug, "springboks-vs-all-blacks-2026-09-13");
    assert.equal(
      fixtureWatchHref(boks!),
      "/events/springboks-vs-all-blacks-2026-09-13",
    );
  });

  it("Tonight teasers only use Events-path fixtures, never invented titles", () => {
    const fixtures = buildUpcomingFixtures(
      [],
      [
        {
          title: "Italian Grand Prix",
          slug: "italian-grand-prix",
          series: "f1",
          dateTime: "2026-09-06T13:00:00.000Z",
          featured: true,
        },
        {
          title: "Springboks vs All Blacks",
          slug: "springboks-vs-all-blacks-2026",
          series: "rugby",
          startsAt: "2026-09-13T15:00:00.000Z",
        },
      ],
      SPORT_CATALOG,
      { now },
    );
    const saturday = tonightFixtureTeasers(
      fixtures,
      new Date("2026-09-06T10:00:00.000Z"),
    );
    assert.equal(saturday.heading, "Tonight");
    assert.equal(saturday.items.length, 1);
    assert.equal(saturday.items[0]?.title, "Italian Grand Prix");
    assert.equal(
      saturday.items[0] ? fixtureWatchHref(saturday.items[0]) : null,
      "/events/italian-grand-prix-2026-09-06",
    );

    const monday = tonightFixtureTeasers(
      fixtures,
      new Date("2026-09-07T10:00:00.000Z"),
    );
    assert.equal(monday.heading, "Coming up");
    assert.ok(monday.items.every((item) => item.slug.includes("2026-09-")));
  });

  it("always sends list/hero links to the Events path, even without venues", () => {
    const fixtures = buildUpcomingFixtures(
      [],
      [
        {
          title: "Italian Grand Prix",
          slug: "italian-grand-prix",
          series: "f1",
          dateTime: "2026-09-06T13:00:00.000Z",
        },
      ],
      SPORT_CATALOG,
      { now },
    );
    assert.equal(fixtures[0]?.venues.length, 0);
    assert.equal(
      fixtureWatchHref(fixtures[0]!),
      "/events/italian-grand-prix-2026-09-06",
    );
  });
});

describe("mergeVenueUpcomingScreenings", () => {
  it("links CMS screenings to the matching Events fixture", () => {
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
      { now },
    );

    const merged = mergeVenueUpcomingScreenings(
      {
        slug: "the-local",
        upcoming_screenings: [
          {
            title: "Springboks vs All Blacks",
            startsAt: "2026-09-06T16:00:00.000Z",
          },
        ],
      },
      fixtures,
      now,
    );

    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.href, "/events/springboks-vs-all-blacks-2026-09-06");
  });
});
