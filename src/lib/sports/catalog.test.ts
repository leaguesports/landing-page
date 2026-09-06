import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALL_SPORTS_SLUG,
  defaultHubPreferences,
  eventHref,
  filterFeedBySport,
  inferSportSlug,
  mergeHubSports,
  parseHubPreferences,
  selectHubSport,
  SPORT_CATALOG,
  unfollowHubSport,
  utilitiesForActiveSport,
  utilitiesForSport,
} from "./catalog.ts";

describe("inferSportSlug", () => {
  it("maps series labels and aliases onto hub sports", () => {
    assert.equal(inferSportSlug("F1"), "motorsport");
    assert.equal(inferSportSlug("Formula 1 weekend in Joburg"), "motorsport");
    assert.equal(inferSportSlug("Watch football tonight"), "soccer");
    assert.equal(inferSportSlug("Padel courts in Sandton"), "padel");
    assert.equal(inferSportSlug("Springbok rugby at the pub"), "rugby");
    assert.equal(inferSportSlug("Go karting in Rosebank"), "karting");
    assert.equal(inferSportSlug("Indoor go-karting tracks"), "karting");
    assert.equal(inferSportSlug("AR darts night in Sandton"), "darts");
    assert.equal(inferSportSlug("Snooker and pool tables"), "pool");
    assert.equal(inferSportSlug("Hyper bowling in Fourways"), "bowling");
    assert.equal(inferSportSlug("Golf simulator bays in Joburg"), "golf");
    assert.equal(inferSportSlug("Driving range in Sandton"), "golf");
    assert.equal(inferSportSlug("Indoor golf near me"), "golf");
    assert.equal(inferSportSlug("Sim racing in Cape Town"), "sim-racing");
  });

  it("returns null when no sport is mentioned", () => {
    assert.equal(inferSportSlug("Weekend plans"), null);
    assert.equal(inferSportSlug(""), null);
  });
});

describe("eventHref", () => {
  it("keeps motorsport deep links sport-native", () => {
    assert.equal(eventHref("f1", "monaco-grand-prix"), "/motorsport/f1/monaco-grand-prix");
    assert.equal(eventHref("f2", "anything"), "/motorsport/f2");
    assert.equal(eventHref("motogp", "qatar"), "/motorsport");
  });

  it("sends unknown series to Watch SEO landings", () => {
    assert.equal(eventHref(null, null), "/watch");
    assert.equal(eventHref("rugby", "test"), "/watch/rugby");
  });
});

describe("mergeHubSports", () => {
  it("keeps catalog order and appends extra Sanity sports", () => {
    const merged = mergeHubSports(SPORT_CATALOG, [
      { name: "Padel Tennis", slug: "padel" },
      { name: "Netball", slug: "netball" },
    ]);
    assert.equal(merged[0]?.slug, "padel");
    assert.equal(merged[0]?.name, "Padel Tennis");
    assert.equal(merged.at(-1)?.slug, "netball");
    assert.deepEqual(merged.at(-1)?.capabilities, ["play", "watch"]);
  });
});

describe("utilities", () => {
  it("gives padel a scorecard start plus court and watch links", () => {
    const padel = SPORT_CATALOG.find((sport) => sport.slug === "padel");
    assert.ok(padel);
    const hrefs = utilitiesForSport(padel).map((item) => item.href);
    assert.ok(hrefs.includes("/padel/new"));
    assert.ok(hrefs.includes("/padel/history"));
    assert.ok(hrefs.includes("/training"));
    assert.ok(hrefs.includes("/play/padel"));
    assert.ok(hrefs.includes("/watch/padel"));
  });

  it("gives golf grouped activities: round, course, simulator, and driving range", () => {
    const golf = SPORT_CATALOG.find((sport) => sport.slug === "golf");
    assert.ok(golf);
    assert.ok(golf.capabilities.includes("scorecard"));
    assert.ok(golf.activities && golf.activities.length >= 5);
    const utilities = utilitiesForSport(golf);
    const hrefs = utilities.map((item) => item.href);
    assert.ok(hrefs.includes("/golf/new"));
    assert.ok(hrefs.includes("/golf/history"));
    assert.ok(hrefs.includes("/play/golf"));
    assert.ok(hrefs.includes("/play/indoor-golf"));
    assert.ok(hrefs.includes("/play/driving-range"));
    assert.equal(
      utilities.some((item) => item.href === "/padel/new"),
      false,
    );
    assert.equal(
      utilities.find((item) => item.kind === "scorecard")?.title,
      "Start a round",
    );
    assert.equal(
      utilities.find((item) => item.href === "/play/indoor-golf")?.title,
      "Find a simulator",
    );
    assert.equal(
      utilities.find((item) => item.href === "/play/driving-range")?.title,
      "Find a driving range",
    );
  });

  it("does not list indoor-golf as a top-level hub sport", () => {
    assert.equal(
      SPORT_CATALOG.some((sport) => sport.slug === "indoor-golf"),
      false,
    );
  });

  it("focuses karting on finding a track, not motorsport calendar or padel", () => {
    const karting = SPORT_CATALOG.find((sport) => sport.slug === "karting");
    assert.ok(karting);
    const utilities = utilitiesForSport(karting);
    const hrefs = utilities.map((item) => item.href);
    assert.ok(hrefs.includes("/play/karting"));
    assert.equal(
      utilities.find((item) => item.kind === "play")?.title,
      "Find a track",
    );
    assert.equal(
      utilities.some((item) => item.href === "/padel/new"),
      false,
    );
    assert.equal(
      utilities.some((item) => item.href === "/motorsport/f1/calendar"),
      false,
    );
  });

  it("focuses social play sports on finding a venue, not scorecards", () => {
    const cases = [
      { slug: "darts", title: "Find a board" },
      { slug: "pool", title: "Find a table" },
      { slug: "bowling", title: "Find a lane" },
      { slug: "sim-racing", title: "Find a sim" },
    ] as const;

    for (const expected of cases) {
      const sport = SPORT_CATALOG.find((item) => item.slug === expected.slug);
      assert.ok(sport, expected.slug);
      const utilities = utilitiesForSport(sport);
      const play = utilities.find((item) => item.kind === "play");
      assert.equal(play?.title, expected.title);
      assert.equal(play?.href, `/play/${expected.slug}`);
      assert.equal(
        utilities.some((item) => item.kind === "scorecard"),
        false,
      );
    }
  });

  it("focuses motorsport on calendar and watch, not a padel scorecard", () => {
    const utilities = utilitiesForActiveSport("motorsport", SPORT_CATALOG);
    const hrefs = utilities.map((item) => item.href);
    assert.ok(hrefs.includes("/motorsport/f1/calendar"));
    assert.equal(
      utilities.some((item) => item.href === "/padel/new"),
      false,
    );
  });

  it("keeps the all-sports mix spanning play, watch, padel, and golf", () => {
    const utilities = utilitiesForActiveSport(ALL_SPORTS_SLUG, SPORT_CATALOG);
    const hrefs = utilities.map((item) => item.href);
    assert.ok(hrefs.includes("/padel/new"));
    assert.ok(hrefs.includes("/golf/new"));
    assert.ok(hrefs.includes("/training"));
    assert.ok(hrefs.includes("/play"));
    assert.ok(hrefs.includes("/watch"));
  });
});

describe("filterFeedBySport", () => {
  const feed = [
    { id: "1", sportSlug: "padel" },
    { id: "2", sportSlug: "rugby" },
    { id: "3", sportSlug: "motorsport" },
  ];

  it("returns everything for all", () => {
    assert.equal(filterFeedBySport(feed, ALL_SPORTS_SLUG).length, 3);
  });

  it("keeps only the focused sport", () => {
    assert.deepEqual(
      filterFeedBySport(feed, "rugby").map((item) => item.id),
      ["2"],
    );
  });

  it("keeps untagged items on All and hides them from a focused sport", () => {
    const mixed = [...feed, { id: "4", sportSlug: null }];
    assert.equal(filterFeedBySport(mixed, ALL_SPORTS_SLUG).length, 4);
    assert.deepEqual(
      filterFeedBySport(mixed, "padel").map((item) => item.id),
      ["1"],
    );
  });

  it("includes nested golf venue sports when Golf is focused", () => {
    const golfFeed = [
      { id: "g", sportSlug: "golf" },
      { id: "i", sportSlug: "indoor-golf" },
      { id: "r", sportSlug: "driving-range" },
      { id: "p", sportSlug: "padel" },
    ];
    assert.deepEqual(
      filterFeedBySport(golfFeed, "golf").map((item) => item.id),
      ["g", "i", "r"],
    );
  });
});

describe("hub preferences", () => {
  const known = ["padel", "rugby", "soccer"];

  it("seeds a single sport as the active filter", () => {
    assert.deepEqual(defaultHubPreferences(["padel"], known), {
      followed: ["padel"],
      active: "padel",
    });
  });

  it("defaults to all when nothing is seeded", () => {
    assert.deepEqual(defaultHubPreferences([], known), {
      followed: [],
      active: ALL_SPORTS_SLUG,
    });
  });

  it("follows a sport when it is selected", () => {
    const next = selectHubSport(
      { followed: ["padel"], active: "padel" },
      "rugby",
      known,
    );
    assert.deepEqual(next, { followed: ["padel", "rugby"], active: "rugby" });
  });

  it("falls back to all after unfollowing the active sport", () => {
    const next = unfollowHubSport(
      { followed: ["padel"], active: "padel" },
      "padel",
      known,
    );
    assert.deepEqual(next, { followed: [], active: ALL_SPORTS_SLUG });
  });

  it("ignores corrupt storage and unknown slugs", () => {
    const parsed = parseHubPreferences("{not-json", {
      knownSlugs: known,
      seedFollowed: ["padel"],
    });
    assert.equal(parsed.active, "padel");

    const stored = parseHubPreferences(
      JSON.stringify({ followed: ["padel", "chess"], active: "chess" }),
      { knownSlugs: known, seedFollowed: [] },
    );
    assert.deepEqual(stored.followed, ["padel"]);
    assert.equal(stored.active, ALL_SPORTS_SLUG);
  });

  it("migrates legacy indoor-golf follows onto golf", () => {
    const golfKnown = ["padel", "golf", "rugby"];
    const stored = parseHubPreferences(
      JSON.stringify({ followed: ["indoor-golf", "padel"], active: "indoor-golf" }),
      { knownSlugs: golfKnown, seedFollowed: [] },
    );
    assert.deepEqual(stored.followed, ["golf", "padel"]);
    assert.equal(stored.active, "golf");

    const selected = selectHubSport(
      { followed: ["padel"], active: "padel" },
      "indoor-golf",
      golfKnown,
    );
    assert.deepEqual(selected, { followed: ["padel", "golf"], active: "golf" });
  });
});
