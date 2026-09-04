import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  eventToFeedItem,
  formatHubWhen,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  screeningsToFeedItems,
  sortHubFeed,
  type HubFeedItem,
} from "./hub-feed.ts";
import { SPORT_CATALOG } from "./catalog.ts";

describe("hub feed queries", () => {
  it("reads CMS events, screenings, and guides — not hardcoded races", () => {
    assert.match(HUB_EVENTS_QUERY, /_type == "event"/);
    assert.match(HUB_EVENTS_QUERY, /f1Details\.dateTime/);
    assert.match(HUB_SCREENINGS_QUERY, /upcoming_screenings/);
    assert.match(HUB_GUIDES_QUERY, /_type == "guide"/);
    assert.doesNotMatch(HUB_EVENTS_QUERY, /Monaco|Verstappen/);
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
