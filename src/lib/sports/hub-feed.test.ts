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

describe("uniqueFollowedFixtureSlugs", () => {
  it("lowercases, dedupes, and caps", () => {
    assert.deepEqual(
      uniqueFollowedFixtureSlugs([" Springboks-vs-All-Blacks-2026-09-06 ", "springboks-vs-all-blacks-2026-09-06", ""]),
      ["springboks-vs-all-blacks-2026-09-06"],
    );
    const many = Array.from(
      { length: MAX_FOLLOWED_FIXTURE_SLUGS + 3 },
      (_, i) => `fix-${i}`,
    );
    assert.equal(
      uniqueFollowedFixtureSlugs(many).length,
      MAX_FOLLOWED_FIXTURE_SLUGS,
    );
  });
});

describe("fixtureToFeedItem + fixturesToFollowedFeedItems", () => {
  const base: UpcomingFixture = {
    slug: "springboks-vs-all-blacks-2026-09-06",
    title: "Springboks vs All Blacks",
    sportSlug: "rugby",
    startsAt: "2026-09-06T15:00:00.000Z",
    venues: [
      { name: "The Local", slug: "the-local" },
      { name: "Obs Bar", slug: "obs-bar" },
    ],
    series: "rugby",
    kind: "both",
  };

  it("maps a followed fixture onto /events with venue count", () => {
    const item = fixtureToFeedItem(base);
    assert.ok(item);
    assert.equal(item.id, "followed-fixture-springboks-vs-all-blacks-2026-09-06");
    assert.equal(item.kind, "event");
    assert.equal(item.sportSlug, "rugby");
    assert.equal(item.href, "/events/springboks-vs-all-blacks-2026-09-06");
    assert.equal(item.subtitle, "2 venues screening");
    assert.equal(item.followedFixture, true);
  });

  it("maps a preference match without the followed flag", () => {
    const item = fixtureToFeedItem(base, { followed: false });
    assert.ok(item);
    assert.equal(item.id, "fixture-springboks-vs-all-blacks-2026-09-06");
    assert.equal(item.followedFixture, undefined);
    assert.equal(item.subtitle, "2 venues screening");
  });

  it("falls back to series when no venues are listed", () => {
    const item = fixtureToFeedItem({ ...base, venues: [], series: "f1" });
    assert.ok(item);
    assert.equal(item.subtitle, "f1");
  });

  it("falls back to preference copy when no venues or series", () => {
    const item = fixtureToFeedItem(
      { ...base, venues: [], series: null },
      { followed: false },
    );
    assert.ok(item);
    assert.equal(item.subtitle, "Matches your sports");
  });

  it("orders soonest first when building the calendar strip", () => {
    const now = new Date("2026-09-04T12:00:00.000Z");
    const items = fixturesToFollowedFeedItems(
      [
        {
          ...base,
          slug: "later-test",
          title: "Later",
          startsAt: "2026-10-01T15:00:00.000Z",
          venues: [],
        },
        {
          ...base,
          slug: "sooner-test",
          title: "Sooner",
          startsAt: "2026-09-05T15:00:00.000Z",
          venues: [],
        },
      ],
      { now, limit: 1 },
    );
    assert.equal(items.length, 1);
    assert.equal(items[0]?.title, "Sooner");
  });
});

describe("fixturesToPreferredFeedItems", () => {
  const now = new Date("2026-09-04T12:00:00.000Z");
  const fixtures: UpcomingFixture[] = [
    {
      slug: "springboks-vs-all-blacks-2026-09-06",
      title: "Springboks vs All Blacks",
      sportSlug: "rugby",
      startsAt: "2026-09-06T15:00:00.000Z",
      venues: [{ name: "The Local", slug: "the-local" }],
      kind: "both",
    },
    {
      slug: "chiefs-vs-pirates-2026-09-07",
      title: "Chiefs vs Pirates",
      sportSlug: "soccer",
      startsAt: "2026-09-07T15:00:00.000Z",
      venues: [],
      kind: "event",
    },
    {
      slug: "monaco-gp-2026-05-24",
      title: "Monaco GP",
      sportSlug: "motorsport",
      startsAt: "2026-05-24T13:00:00.000Z",
      venues: [],
      kind: "event",
    },
    {
      slug: "untagged-derby",
      title: "Mystery Derby",
      sportSlug: null,
      startsAt: "2026-09-08T15:00:00.000Z",
      venues: [],
      kind: "event",
    },
  ];

  it("returns nothing when the user has no preferred sports", () => {
    assert.deepEqual(fixturesToPreferredFeedItems(fixtures, []), []);
    assert.deepEqual(fixturesToPreferredFeedItems(fixtures, null), []);
  });

  it("keeps only fixtures matching preferred sports", () => {
    const items = fixturesToPreferredFeedItems(fixtures, ["rugby", "soccer"], {
      now,
    });
    assert.deepEqual(
      items.map((item) => item.title),
      ["Springboks vs All Blacks", "Chiefs vs Pirates"],
    );
    assert.ok(items.every((item) => item.followedFixture !== true));
    assert.ok(items.every((item) => item.id.startsWith("fixture-")));
  });

  it("skips fixtures already shown in the followed calendar strip", () => {
    const items = fixturesToPreferredFeedItems(fixtures, ["rugby", "soccer"], {
      now,
      excludeSlugs: ["springboks-vs-all-blacks-2026-09-06"],
    });
    assert.deepEqual(
      items.map((item) => item.title),
      ["Chiefs vs Pirates"],
    );
  });

  it("caps preference matches", () => {
    const many = Array.from({ length: MAX_PREFERRED_FIXTURE_SLUGS + 4 }, (_, i) => ({
      ...fixtures[0]!,
      slug: `rugby-fixture-${i}`,
      title: `Rugby ${i}`,
      startsAt: `2026-09-${String(5 + (i % 20)).padStart(2, "0")}T15:00:00.000Z`,
    }));
    const items = fixturesToPreferredFeedItems(many, ["rugby"], { now });
    assert.equal(items.length, MAX_PREFERRED_FIXTURE_SLUGS);
  });
});

describe("normalizePreferredSportSlugs + sortHubFeedPreferringSports", () => {
  it("normalizes hub parents and dedupes", () => {
    assert.deepEqual(
      normalizePreferredSportSlugs([" Rugby ", "indoor-golf", "golf", ""]),
      ["rugby", "golf"],
    );
  });

  it("elevates preferred sports within the upcoming bucket", () => {
    const now = new Date("2026-09-04T12:00:00.000Z");
    const feed: HubFeedItem[] = [
      {
        id: "f1",
        kind: "event",
        sportSlug: "motorsport",
        title: "Soon F1",
        subtitle: "",
        href: "/events/f1",
        startsAt: "2026-09-05T12:00:00.000Z",
      },
      {
        id: "rugby",
        kind: "event",
        sportSlug: "rugby",
        title: "Later Rugby",
        subtitle: "",
        href: "/events/rugby",
        startsAt: "2026-09-06T12:00:00.000Z",
      },
      {
        id: "soccer",
        kind: "event",
        sportSlug: "soccer",
        title: "Mid Soccer",
        subtitle: "",
        href: "/events/soccer",
        startsAt: "2026-09-05T18:00:00.000Z",
      },
    ];

    const ranked = sortHubFeedPreferringSports(feed, ["rugby", "soccer"], now);
    assert.deepEqual(
      ranked.map((item) => item.title),
      ["Mid Soccer", "Later Rugby", "Soon F1"],
    );
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

  it("drops guides that cannot become a /guides/{slug} href", () => {
    const items = guidesToFeedItems(
      [
        {
          _id: "ok",
          title: "The Ultimate Guide to the Best Padel Courts in Johannesburg",
          slug: "best-padel-courts-joburg",
        },
        { _id: "empty", title: "Missing slug", slug: "" },
        { _id: "bad", title: "Unlistable", slug: "undefined" },
      ],
      SPORT_CATALOG,
    );
    assert.deepEqual(
      items.map((item) => item.href),
      ["/guides/best-padel-courts-joburg"],
    );
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
