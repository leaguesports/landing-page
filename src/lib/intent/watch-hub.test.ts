import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UpcomingFixture } from "../sports/events-feed.ts";
import { isWatchCityHubLocation } from "./routes.ts";
import {
  buildWatchHubModel,
  filterWatchHubCards,
  isWatchHubSport,
  formatWatchDistanceKm,
  orderWatchSports,
  resolveWatchFixtureSelection,
  sortWatchHubCards,
  watchCityEventsHref,
  watchCityHubHeading,
  watchCueLabels,
  watchFixtureBucket,
  watchHubHook,
  watchHubPromise,
  watchLivingCount,
  watchPlaceLine,
  watchShowingLabel,
  watchSiblingSportLinks,
  watchSportChipHref,
  watchSuburbChips,
  watchWeekendDays,
  type WatchHubVenueInput,
} from "./watch-hub.ts";

const saturday = new Date("2026-09-26T08:00:00.000Z");
const monday = new Date("2026-09-28T08:00:00.000Z");

const derby: UpcomingFixture = {
  slug: "orlando-pirates-vs-kaizer-chiefs-2026-10-31",
  title: "Orlando Pirates vs Kaizer Chiefs",
  sportSlug: "soccer",
  startsAt: "2026-10-31T13:30:00.000Z",
  venues: [
    { name: "Beer Park Sandton", slug: "beer-park-sandton" },
    { name: "Cesco's Randburg", slug: "cescos-randburg" },
  ],
  series: "premier-soccer-league",
  competition: "Soweto Derby",
  kind: "both",
};

const sharks: UpcomingFixture = {
  slug: "sharks-vs-lions-2026-09-27",
  title: "Sharks vs Lions",
  sportSlug: "rugby",
  startsAt: "2026-09-27T13:00:00.000Z",
  venues: [{ name: "Beer Park Sandton", slug: "beer-park-sandton" }],
  series: "urc",
  competition: null,
  kind: "screening",
};

const grandPrix: UpcomingFixture = {
  slug: "azerbaijan-grand-prix-2026-09-26",
  title: "Azerbaijan Grand Prix",
  sportSlug: "motorsport",
  startsAt: "2026-09-26T11:00:00.000Z",
  venues: [{ name: "Beer Park Sandton", slug: "beer-park-sandton" }],
  series: "f1",
  competition: null,
  kind: "event",
};

function venue(partial: Partial<WatchHubVenueInput> & Pick<WatchHubVenueInput, "id" | "name" | "slug">): WatchHubVenueInput {
  return {
    suburb: "",
    latitude: null,
    longitude: null,
    photoSrc: null,
    hasScreens: false,
    hasLiveAudio: false,
    hasOutdoor: false,
    setupTags: [],
    cmsHook: null,
    broadcasts: [],
    upcoming_screenings: [],
    ...partial,
  };
}

const beer = venue({
  id: "beer",
  name: "Beer Park Sandton",
  slug: "beer-park-sandton",
  suburb: "Sandton",
  latitude: -26.107,
  longitude: 28.056,
  hasScreens: true,
  hasLiveAudio: true,
  broadcasts: [
    { slug: "soccer", name: "Soccer" },
    { slug: "rugby", name: "Rugby" },
    { slug: "motorsport", name: "Motorsport" },
  ],
  upcoming_screenings: [
    { title: derby.title, startsAt: derby.startsAt! },
    { title: sharks.title, startsAt: sharks.startsAt! },
    { title: grandPrix.title, startsAt: grandPrix.startsAt! },
  ],
});

const cesco = venue({
  id: "cesco",
  name: "Cesco's Randburg",
  slug: "cescos-randburg",
  suburb: "Randburg",
  hasOutdoor: true,
  broadcasts: [{ slug: "soccer", name: "Soccer" }],
  upcoming_screenings: [{ title: derby.title, startsAt: derby.startsAt! }],
});

const troy = venue({
  id: "troy",
  name: "The Troyeville",
  slug: "the-troyeville",
  suburb: "Troyeville",
  hasOutdoor: true,
  setupTags: ["fan park"],
  broadcasts: [{ slug: "rugby", name: "Rugby" }],
  upcoming_screenings: [],
});

const fixtures = [derby, sharks, grandPrix];

describe("watch hub fixture buckets", () => {
  it("keeps Saturday in today, Sunday in this weekend, and a later derby out of both", () => {
    assert.equal(watchFixtureBucket(grandPrix.startsAt!, saturday), "today");
    assert.equal(watchFixtureBucket(sharks.startsAt!, saturday), "weekend");
    assert.equal(watchFixtureBucket(derby.startsAt!, saturday), "later");
    assert.deepEqual(watchWeekendDays(saturday), [
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
    ]);
  });

  it("treats Mon–Thu kickoffs before Friday as later, and Friday as this weekend", () => {
    assert.equal(watchFixtureBucket("2026-10-01T15:00:00.000Z", monday), "later");
    assert.equal(watchFixtureBucket("2026-10-02T15:00:00.000Z", monday), "weekend");
    assert.equal(watchFixtureBucket("2026-09-28T15:00:00.000Z", monday), "today");
  });

  it("scopes a sport hub and groups the derby under its competition", () => {
    const model = buildWatchHubModel({
      venues: [beer, cesco, troy],
      fixtures,
      sportSlug: "soccer",
      now: saturday,
    });
    assert.deepEqual(
      model.buckets.map((bucket) => bucket.id),
      ["later"],
    );
    assert.equal(model.buckets[0]?.groups[0]?.name, "Soweto Derby");
    assert.equal(model.fixtureRows[0]?.title, derby.title);
    assert.deepEqual(model.fixtureRows[0]?.venueSlugs, [
      "beer-park-sandton",
      "cescos-randburg",
    ]);
    assert.equal(
      model.fixtureRows.some((row) => /sharks|grand prix/i.test(row.title)),
      false,
    );
    assert.equal(model.weekendVenueCount, 0);
  });

  it("puts URC on the rugby strip and leaves the derby off it", () => {
    const model = buildWatchHubModel({
      venues: [beer, cesco, troy],
      fixtures,
      sportSlug: "rugby",
      now: saturday,
    });
    assert.deepEqual(
      model.buckets.map((bucket) => bucket.label),
      ["This weekend"],
    );
    assert.equal(model.buckets[0]?.groups[0]?.name, "URC");
    assert.equal(model.fixtureRows[0]?.venueSlugs.length, 1);
    assert.equal(model.weekendVenueCount, 1);
  });

  it("lists cross-sport buckets on the city hub and only shows buckets with rows", () => {
    const model = buildWatchHubModel({
      venues: [beer, cesco, troy],
      fixtures,
      sportSlug: null,
      now: saturday,
    });
    assert.deepEqual(
      model.buckets.map((bucket) => bucket.id),
      ["today", "weekend", "later"],
    );
    assert.equal(model.buckets[0]?.groups[0]?.name, "Formula 1");
    assert.equal(model.weekendVenueCount, 1);
    assert.deepEqual(
      model.sports.map((sport) => sport.slug),
      ["rugby", "soccer", "motorsport"],
    );
  });

  it("stays flat and chronological when no competition or series is present", () => {
    const plain: UpcomingFixture = {
      ...sharks,
      series: null,
      competition: null,
      slug: "sharks-vs-lions-2026-09-27",
    };
    const model = buildWatchHubModel({
      venues: [beer],
      fixtures: [plain],
      sportSlug: "rugby",
      now: saturday,
    });
    assert.equal(model.buckets[0]?.groups[0]?.name, null);
    assert.equal(model.fixtureRows.length, 1);
  });
});

describe("watch hub venue list", () => {
  const model = buildWatchHubModel({
    venues: [beer, cesco, troy],
    fixtures,
    sportSlug: null,
    now: saturday,
  });

  it("filters suburb ∩ fixture and restores when the fixture is cleared", () => {
    const derbyRow = model.fixtureRows.find((row) => row.title === derby.title);
    assert.ok(derbyRow);
    const sandtonDerby = filterWatchHubCards(model.cards, {
      suburb: "Sandton",
      fixtureVenueSlugs: derbyRow.venueSlugs,
    });
    assert.deepEqual(
      sandtonDerby.map((card) => card.slug),
      ["beer-park-sandton"],
    );
    const sandtonAll = filterWatchHubCards(model.cards, {
      suburb: "Sandton",
      fixtureVenueSlugs: null,
    });
    assert.deepEqual(
      sandtonAll.map((card) => card.slug),
      ["beer-park-sandton"],
    );
    const allDerby = filterWatchHubCards(model.cards, {
      suburb: null,
      fixtureVenueSlugs: derbyRow.venueSlugs,
    });
    assert.deepEqual(allDerby.map((card) => card.slug).sort(), [
      "beer-park-sandton",
      "cescos-randburg",
    ]);
  });

  it("boosts venues with an upcoming screening, then sorts suburb A–Z", () => {
    const sorted = sortWatchHubCards(
      model.cards.map((card) => ({
        ...card,
        hasUpcoming: card.screenings.length > 0,
        distanceKm: null,
      })),
      { fixtureSelected: false, hasAnyDistance: false },
    );
    assert.deepEqual(
      sorted.map((card) => card.slug),
      ["cescos-randburg", "beer-park-sandton", "the-troyeville"],
    );
  });

  it("sorts by distance when a measurement exists and skips the boost under a fixture filter", () => {
    const rows = [
      { name: "Far", suburb: "Sandton", hasUpcoming: true, distanceKm: 12 },
      { name: "Near", suburb: "Illovo", hasUpcoming: false, distanceKm: 1.2 },
    ];
    const open = sortWatchHubCards(rows, {
      fixtureSelected: false,
      hasAnyDistance: true,
    });
    assert.deepEqual(
      open.map((row) => row.name),
      ["Far", "Near"],
    );
    const filtered = sortWatchHubCards(rows, {
      fixtureSelected: true,
      hasAnyDistance: true,
    });
    assert.deepEqual(
      filtered.map((row) => row.name),
      ["Near", "Far"],
    );
  });

  it("orders suburb chips by density", () => {
    assert.deepEqual(watchSuburbChips(["Sandton", "Illovo", "Sandton", ""]), [
      "Sandton",
      "Illovo",
    ]);
  });
});

describe("watch hub card copy", () => {
  it("maps watch cues and drops food, parking, and missing tags", () => {
    assert.deepEqual(
      watchCueLabels({
        hasScreens: true,
        hasLiveAudio: true,
        hasOutdoor: true,
        setupTags: ["fan park", "food", "parking"],
      }),
      ["Screens", "Sound on", "Outdoor", "Fan park"],
    );
    assert.deepEqual(watchCueLabels({ setupTags: ["parking"] }), []);
    assert.deepEqual(watchCueLabels({}), []);
  });

  it("prefers a short CMS hook, otherwise templates from cues and suburb", () => {
    assert.equal(
      watchHubHook({
        cmsHook: "Hardcore rugby local near Ellis Park",
        suburb: "Troyeville",
        cues: ["Outdoor"],
      }),
      "Hardcore rugby local near Ellis Park",
    );
    assert.equal(
      watchHubHook({
        cmsHook: "x".repeat(141),
        suburb: "Illovo",
        cues: ["Screens"],
      }),
      "Multi-screen Illovo local",
    );
    assert.equal(
      watchHubHook({
        suburb: "Troyeville",
        cues: ["Outdoor", "Fan park"],
      }),
      "Outdoor fan-park Troyeville local",
    );
    assert.equal(watchHubHook({ suburb: "", cues: [] }), null);
  });

  it("labels centre distance and omits a fake precise km", () => {
    assert.equal(
      watchPlaceLine({
        suburb: "Rosebank",
        distanceKm: 4.24,
        origin: "user",
        cityTitle: "Johannesburg",
      }),
      "Rosebank · 4.2 km",
    );
    assert.equal(
      watchPlaceLine({
        suburb: "Rosebank",
        distanceKm: 4.24,
        origin: "centre",
        cityTitle: "Johannesburg",
      }),
      "Rosebank · 4.2 km from Johannesburg centre",
    );
    assert.equal(
      watchPlaceLine({
        suburb: "Illovo",
        distanceKm: null,
        origin: null,
        cityTitle: "Johannesburg",
      }),
      "Illovo",
    );
    assert.equal(formatWatchDistanceKm(12.4), "12 km");
  });

  it("shows the selected fixture, otherwise a today count or the next title", () => {
    assert.equal(
      watchShowingLabel({
        screenings: [{ title: derby.title, startsAt: derby.startsAt! }],
        selectedTitle: "Soweto Derby",
        todayYmd: "2026-09-26",
      }),
      "Showing · Soweto Derby",
    );
    assert.equal(
      watchShowingLabel({
        screenings: [
          { title: "A", startsAt: "2026-09-26T11:00:00.000Z" },
          { title: "B", startsAt: "2026-09-26T15:00:00.000Z" },
        ],
        todayYmd: "2026-09-26",
      }),
      "2 games today",
    );
    assert.equal(
      watchShowingLabel({
        screenings: [{ title: sharks.title, startsAt: sharks.startsAt! }],
        todayYmd: "2026-09-26",
      }),
      sharks.title,
    );
  });
});

describe("watch hub page copy and links", () => {
  it("uses the locked promise and living count", () => {
    assert.equal(
      watchHubPromise({ sportName: "Soccer", hasFixtures: true }),
      "Pick a kickoff, then open a bar that's actually showing it.",
    );
    assert.equal(
      watchHubPromise({ sportName: "Rugby", hasFixtures: false }),
      "Bars tagged for live rugby — open a venue before you go.",
    );
    assert.equal(watchLivingCount(28, 0), "28 venues tagged · 0 this weekend");
    assert.equal(
      watchLivingCount(29, 6),
      "29 venues tagged · 6 screening this weekend",
    );
    assert.equal(watchCityHubHeading("Johannesburg"), "Watch sport in Johannesburg");
  });

  it("deep-links sport chips and keeps the current sport out of sibling links", () => {
    assert.equal(
      watchSportChipHref("rugby", "johannesburg"),
      "/watch/rugby/johannesburg",
    );
    assert.deepEqual(
      watchSiblingSportLinks({
        citySlug: "johannesburg",
        cityTitle: "Johannesburg",
        currentSportSlug: "rugby",
        sports: [
          { slug: "motorsport", name: "Motorsport" },
          { slug: "soccer", name: "Soccer" },
          { slug: "rugby", name: "Rugby" },
        ],
      }).map((link) => link.href),
      ["/watch/soccer/johannesburg", "/watch/motorsport/johannesburg"],
    );
    assert.equal(isWatchHubSport("golf"), false);
    assert.equal(isWatchHubSport("rugby"), true);
    assert.deepEqual(
      orderWatchSports([
        { slug: "motorsport", name: "Motorsport" },
        { slug: "cricket", name: "Cricket" },
        { slug: "soccer", name: "Soccer" },
      ]).map((sport) => sport.slug),
      ["soccer", "cricket", "motorsport"],
    );
  });

  it("resolves a fixture query and recognises a city hub location", () => {
    const model = buildWatchHubModel({
      venues: [beer],
      fixtures,
      sportSlug: "soccer",
      now: saturday,
    });
    assert.equal(
      resolveWatchFixtureSelection(model.fixtureRows, derby.slug),
      model.fixtureRows[0]?.key,
    );
    assert.equal(resolveWatchFixtureSelection(model.fixtureRows, "missing"), null);
    assert.equal(isWatchCityHubLocation({ type: "city", parentSlug: null }), true);
    assert.equal(
      isWatchCityHubLocation({ type: "suburb", parentSlug: "johannesburg" }),
      false,
    );
    assert.equal(isWatchCityHubLocation({ type: null, parentSlug: null }), true);
    assert.equal(isWatchCityHubLocation({ type: "province", parentSlug: null }), false);
    assert.equal(watchCityEventsHref("johannesburg"), "/events?city=jhb");
  });
});
