import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  eventToFeedItem,
  filterFeedByVenueSlugs,
  formatHubWhen,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_FOLLOWED_SCREENINGS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  MAX_FOLLOWED_VENUE_SLUGS,
  mergeHubFeedItems,
  screeningsToFeedItems,
  sortHubFeed,
  uniqueFollowedVenueSlugs,
  type HubFeedItem,
} from "./hub-feed.ts";
import { SPORT_CATALOG } from "./catalog.ts";

describe("hub feed queries", () => {
  it("reads CMS events, screenings, and guides — not hardcoded races", () => {
    assert.match(HUB_EVENTS_QUERY, /_type == "event"/);
    assert.match(HUB_EVENTS_QUERY, /f1Details\.dateTime/);
    assert.match(HUB_SCREENINGS_QUERY, /upcoming_screenings/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /slug\.current in \$slugs/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /count\(upcoming_screenings\) > 0/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /order\(_updatedAt desc\)/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /\[0\.\.\.24\]/);
    assert.match(HUB_FOLLOWED_SCREENINGS_QUERY, /upcoming_screenings\[0\.\.\.12\]/);
    assert.match(HUB_GUIDES_QUERY, /_type == "guide"/);
    assert.doesNotMatch(HUB_EVENTS_QUERY, /Monaco|Verstappen/);
  });
});

describe("uniqueFollowedVenueSlugs", () => {
  it("dedupes, trims, and caps length", () => {
    assert.deepEqual(uniqueFollowedVenueSlugs([" a ", "a", "b", ""]), ["a", "b"]);
    const many = Array.from({ length: MAX_FOLLOWED_VENUE_SLUGS + 5 }, (_, i) =>
      `v${i}`,
    );
    assert.equal(uniqueFollowedVenueSlugs(many).length, MAX_FOLLOWED_VENUE_SLUGS);
  });
});

describe("eventToFeedItem", () => {
  it("maps an F1 row onto motorsport with a native race href", () => {
    const item = eventToFeedItem(
      {
        id: "evt-1",
        title: "Monaco Grand Prix",
        slug: "monaco-grand-prix",
        series: "f1",
        dateTime: "2026-05-24T13:00:00.000Z",
        track: "Circuit de Monaco",
      },
      SPORT_CATALOG,
    );
    assert.ok(item);
    assert.equal(item.kind, "event");
    assert.equal(item.sportSlug, "motorsport");
    assert.equal(item.href, "/motorsport/f1/monaco-grand-prix");
    assert.equal(item.subtitle, "Circuit de Monaco");
  });

  it("drops rows without an id or title", () => {
    assert.equal(eventToFeedItem({ id: "x" }, SPORT_CATALOG), null);
    assert.equal(eventToFeedItem({ title: "Race" }, SPORT_CATALOG), null);
  });

  it("leaves untagged events unscoped instead of defaulting to motorsport", () => {
    const item = eventToFeedItem(
      {
        id: "evt-2",
        title: "Community open day",
        slug: "open-day",
        series: "",
      },
      SPORT_CATALOG,
    );
    assert.ok(item);
    assert.equal(item.sportSlug, null);
  });
});

describe("screeningsToFeedItems", () => {
  it("infers sport from the fixture title and links to the venue", () => {
    const items = screeningsToFeedItems(
      [
        {
          name: "The Local",
          slug: "the-local",
          broadcasts: [{ name: "Rugby", slug: "rugby" }],
          upcoming_screenings: [
            { title: "Springboks vs All Blacks", startsAt: "2026-09-05T16:00:00.000Z" },
            { title: "", startsAt: "2026-09-06T16:00:00.000Z" },
          ],
        },
      ],
      SPORT_CATALOG,
    );
    assert.equal(items.length, 1);
    assert.equal(items[0]?.sportSlug, "rugby");
    assert.equal(items[0]?.href, "/venues/the-local");
    assert.equal(items[0]?.subtitle, "The Local");
  });

  it("does not force rugby when the title and broadcasts are untagged", () => {
    const items = screeningsToFeedItems(
      [
        {
          name: "Town Hall",
          slug: "town-hall",
          broadcasts: [],
          upcoming_screenings: [
            { title: "Live on the big screen", startsAt: "2026-09-05T16:00:00.000Z" },
          ],
        },
      ],
      SPORT_CATALOG,
    );
    assert.equal(items[0]?.sportSlug, null);
  });

  it("tags screening items with venueSlug for followed-venue filtering", () => {
    const items = screeningsToFeedItems(
      [
        {
          name: "The Local",
          slug: "the-local",
          broadcasts: [],
          upcoming_screenings: [
            { title: "Derby day", startsAt: "2026-09-05T16:00:00.000Z" },
          ],
        },
      ],
      SPORT_CATALOG,
    );
    assert.equal(items[0]?.venueSlug, "the-local");
  });

  it("preferSoonest keeps the nearest fixture when capping across venues", () => {
    const now = new Date("2026-09-04T12:00:00.000Z");
    const items = screeningsToFeedItems(
      [
        {
          name: "Later Bar",
          slug: "later-bar",
          upcoming_screenings: [
            { title: "Far out", startsAt: "2026-10-01T16:00:00.000Z" },
          ],
        },
        {
          name: "Soon Bar",
          slug: "soon-bar",
          upcoming_screenings: [
            { title: "Tomorrow", startsAt: "2026-09-05T16:00:00.000Z" },
          ],
        },
      ],
      SPORT_CATALOG,
      1,
      { preferSoonest: true, now },
    );
    assert.equal(items.length, 1);
    assert.equal(items[0]?.venueSlug, "soon-bar");
  });
});

describe("filterFeedByVenueSlugs", () => {
  it("keeps only screenings from followed venue slugs", () => {
    const feed: HubFeedItem[] = [
      {
        id: "s1",
        kind: "screening",
        sportSlug: "rugby",
        title: "A",
        subtitle: "The Local",
        href: "/venues/the-local",
        startsAt: "2026-09-05T16:00:00.000Z",
        venueSlug: "the-local",
      },
      {
        id: "s2",
        kind: "screening",
        sportSlug: "soccer",
        title: "B",
        subtitle: "Other",
        href: "/venues/other",
        startsAt: "2026-09-06T16:00:00.000Z",
        venueSlug: "other",
      },
      {
        id: "e1",
        kind: "event",
        sportSlug: "motorsport",
        title: "Race",
        subtitle: "",
        href: "/motorsport",
        startsAt: "2026-09-10T12:00:00.000Z",
      },
    ];
    assert.deepEqual(
      filterFeedByVenueSlugs(feed, ["the-local"]).map((item) => item.id),
      ["s1"],
    );
    assert.deepEqual(filterFeedByVenueSlugs(feed, []), []);
  });
});

describe("mergeHubFeedItems", () => {
  it("dedupes by id preferring earlier groups", () => {
    const a: HubFeedItem = {
      id: "same",
      kind: "screening",
      sportSlug: null,
      title: "First",
      subtitle: "",
      href: "/venues/a",
      startsAt: null,
      venueSlug: "a",
    };
    const b: HubFeedItem = {
      ...a,
      title: "Second",
    };
    assert.deepEqual(
      mergeHubFeedItems([a], [b]).map((item) => item.title),
      ["First"],
    );
  });
});

describe("guidesToFeedItems", () => {
  it("tags a Joburg padel guide as padel", () => {
    const items = guidesToFeedItems(
      [
        {
          _id: "g1",
          title: "The Ultimate Guide to the Best Padel Courts in Johannesburg",
          slug: "joburg-padel",
          description: "Courts and gees in Jozi",
          keywords: ["padel", "johannesburg"],
        },
      ],
      SPORT_CATALOG,
    );
    assert.equal(items[0]?.sportSlug, "padel");
    assert.equal(items[0]?.href, "/guides/joburg-padel");
    assert.equal(items[0]?.kind, "guide");
    assert.equal(items[0]?.startsAt, null);
  });

  it("does not force padel when a guide mentions no sport", () => {
    const items = guidesToFeedItems(
      [
        {
          _id: "g2",
          title: "How to pick a Saturday venue",
          slug: "saturday-venue",
          description: "Vibe, screens, and parking.",
          keywords: ["venues"],
          _createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      SPORT_CATALOG,
    );
    assert.equal(items[0]?.sportSlug, null);
    assert.equal(items[0]?.startsAt, null);
  });
});

describe("sortHubFeed", () => {
  it("puts upcoming dated items first, then undated, then past", () => {
    const now = new Date("2026-09-04T12:00:00.000Z");
    const items: HubFeedItem[] = [
      {
        id: "past",
        kind: "event",
        sportSlug: "motorsport",
        title: "Past",
        subtitle: "",
        href: "/motorsport",
        startsAt: "2026-09-01T12:00:00.000Z",
      },
      {
        id: "guide",
        kind: "guide",
        sportSlug: "padel",
        title: "Guide",
        subtitle: "",
        href: "/guides/x",
        startsAt: null,
      },
      {
        id: "soon",
        kind: "event",
        sportSlug: "motorsport",
        title: "Soon",
        subtitle: "",
        href: "/motorsport",
        startsAt: "2026-09-10T12:00:00.000Z",
      },
    ];
    assert.deepEqual(
      sortHubFeed(items, now).map((item) => item.id),
      ["soon", "guide", "past"],
    );
  });
});

describe("formatHubWhen", () => {
  const now = new Date("2026-09-04T10:00:00.000Z");

  it("labels today and tomorrow, then a calendar date", () => {
    assert.match(
      formatHubWhen("2026-09-04T18:00:00.000Z", now) ?? "",
      /Today/,
    );
    assert.match(
      formatHubWhen("2026-09-05T18:00:00.000Z", now) ?? "",
      /Tomorrow/,
    );
    assert.match(
      formatHubWhen("2026-09-12T18:00:00.000Z", now) ?? "",
      /Sep/,
    );
  });

  it("returns null for missing values", () => {
    assert.equal(formatHubWhen(null, now), null);
    assert.equal(formatHubWhen("not-a-date", now), null);
  });
});
