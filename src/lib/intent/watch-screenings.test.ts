import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPORT_CATALOG } from "../sports/catalog.ts";
import { buildUpcomingFixtures } from "../sports/events-feed.ts";
import { mergeVenueUpcomingScreenings } from "../sports/events-path.ts";
import {
  dedupeVenuesBySlug,
  venueBroadcastSportSlugs,
  watchCalendarScreenings,
  watchCalendarSideLinks,
  watchEventsHref,
  watchRelatedGuideLink,
  watchRelatedGuides,
  watchScreeningEmptyBody,
  watchScreeningEmptyCopy,
  watchVenueMetaLine,
  WATCH_CITY_CALENDAR_LIMIT,
} from "./watch-screenings.ts";

const now = new Date("2026-09-26T08:00:00.000Z");

const pirates = {
  title: "Orlando Pirates vs Kaizer Chiefs",
  startsAt: "2026-10-31T13:30:00.000Z",
};

const sharks = {
  title: "Sharks vs Lions",
  startsAt: "2026-09-27T13:00:00.000Z",
};

const cesco = {
  name: "Cesco's Randburg",
  slug: "cescos-randburg",
  broadcasts: [{ slug: "rugby" }, { slug: "soccer" }, { slug: "cricket" }],
  upcoming_screenings: [pirates, pirates],
};

const cescoDuplicateDoc = {
  name: "Cesco's Randburg",
  slug: "cescos-randburg",
  broadcasts: [{ slug: "soccer" }, { slug: "rugby" }],
  upcoming_screenings: [pirates],
};

const beerPark = {
  name: "Beer Park Sandton",
  slug: "beer-park-sandton",
  broadcasts: [
    { slug: "rugby" },
    { slug: "soccer" },
    { slug: "cricket" },
    { slug: "motorsport" },
  ],
  upcoming_screenings: [pirates, sharks],
};

const venues = [cesco, cescoDuplicateDoc, beerPark];

function fixtures() {
  return buildUpcomingFixtures(
    venues.map((venue) => ({
      name: venue.name,
      slug: venue.slug,
      broadcasts: venue.broadcasts,
      upcoming_screenings: venue.upcoming_screenings,
    })),
    [
      {
        title: pirates.title,
        sport: "soccer",
        series: "premier-soccer-league",
        startDateTime: pirates.startsAt,
        relatedGuide: {
          title: "Where to Watch Premier League in Johannesburg",
          slug: "premier-league-sports-bars-joburg",
        },
      },
      {
        title: sharks.title,
        sport: "rugby",
        series: "urc",
        startDateTime: sharks.startsAt,
        relatedGuide: {
          title: "Where to Watch Springboks & Rugby in Johannesburg",
          slug: "where-to-watch-rugby-johannesburg",
        },
      },
      {
        title: "Azerbaijan Grand Prix",
        sport: "motorsport",
        series: "f1",
        startDateTime: "2026-09-26T11:00:00.000Z",
      },
      {
        title: "Proteas vs India (ODI)",
        sport: "cricket",
        series: "proteas",
        startDateTime: "2026-10-05T09:00:00.000Z",
        relatedGuide: {
          title: "Where to Watch Cricket in Johannesburg",
          slug: "where-to-watch-cricket-johannesburg",
        },
      },
    ],
    SPORT_CATALOG,
    { now, limit: 48 },
  );
}

describe("watch city calendar sport scope", () => {
  const upcoming = fixtures();

  it("keeps rugby Joburg on rugby and drops the Soweto derby", () => {
    const rows = watchCalendarScreenings(venues, upcoming, "rugby", now, 6);
    assert.deepEqual(
      rows.map((row) => `${row.title} @ ${row.venueSlug}`),
      ["Sharks vs Lions @ beer-park-sandton"],
    );
    assert.equal(
      rows.some((row) => /pirates|chiefs/i.test(row.title)),
      false,
    );
  });

  it("shows the derby on soccer and dedupes the same fixture at one venue", () => {
    const rows = watchCalendarScreenings(venues, upcoming, "soccer", now, 6);
    assert.deepEqual(
      rows.map((row) => row.venueSlug),
      ["beer-park-sandton", "cescos-randburg"],
    );
    assert.ok(rows.every((row) => row.title === pirates.title));
  });

  it("does not leak the derby onto cricket or motorsport", () => {
    assert.equal(
      watchCalendarScreenings(venues, upcoming, "cricket", now).length,
      0,
    );
    assert.equal(
      watchCalendarScreenings(venues, upcoming, "motorsport", now).length,
      0,
    );
  });

  it("scopes the venue next-screening line and hides another sport", () => {
    const broadcasts = venueBroadcastSportSlugs(beerPark.broadcasts);
    const rugbyNext = mergeVenueUpcomingScreenings(
      beerPark,
      upcoming,
      now,
      { sportSlug: "rugby", broadcastSlugs: broadcasts },
    );
    const soccerNext = mergeVenueUpcomingScreenings(
      beerPark,
      upcoming,
      now,
      { sportSlug: "soccer", broadcastSlugs: broadcasts },
    );
    const cricketNext = mergeVenueUpcomingScreenings(
      beerPark,
      upcoming,
      now,
      { sportSlug: "cricket", broadcastSlugs: broadcasts },
    );

    assert.equal(rugbyNext[0]?.title, sharks.title);
    assert.equal(soccerNext[0]?.title, pirates.title);
    assert.equal(cricketNext.length, 0);
  });

  it("empty copy names the page sport, keeps the venue list honest, and links mapped guides only", () => {
    assert.equal(
      watchScreeningEmptyCopy("Rugby"),
      "No upcoming rugby screenings listed yet",
    );
    assert.equal(
      watchScreeningEmptyCopy("Cricket"),
      "No upcoming cricket screenings listed yet",
    );
    assert.doesNotMatch(watchScreeningEmptyCopy("Rugby"), /coming soon/i);
    assert.equal(
      watchScreeningEmptyBody("Rugby", "Johannesburg", 12),
      "We still list 12 venues in Johannesburg tagged for rugby. Open a venue for address and amenities, or check Events for other fixtures.",
    );
    assert.match(watchScreeningEmptyBody("Rugby", "Johannesburg", 12), /Events/);
    assert.doesNotMatch(
      watchScreeningEmptyBody("Rugby", "Johannesburg", 12),
      /coming soon|soccer|pirates/i,
    );
    assert.equal(watchEventsHref("rugby"), "/events?sport=rugby");
    assert.equal(WATCH_CITY_CALENDAR_LIMIT >= 5 && WATCH_CITY_CALENDAR_LIMIT <= 8, true);

    assert.deepEqual(watchRelatedGuideLink("rugby", "johannesburg"), {
      href: "/guides/where-to-watch-rugby-johannesburg",
      label: "Where to Watch Rugby & the Springboks in Johannesburg",
    });
    assert.deepEqual(
      watchRelatedGuides("rugby", "johannesburg").map((link) => link.href),
      [
        "/guides/where-to-watch-rugby-johannesburg",
        "/guides/best-sports-bars-johannesburg",
      ],
    );
    assert.deepEqual(watchCalendarSideLinks("rugby", "joburg"), {
      guide: {
        href: "/guides/where-to-watch-rugby-johannesburg",
        label: "Where to Watch Rugby & the Springboks in Johannesburg",
      },
      crossSport: {
        href: "/guides/best-sports-bars-johannesburg",
        label: "The 7 Best Sports Bars in Johannesburg for Every Fan",
      },
    });
    assert.deepEqual(
      watchRelatedGuides("soccer", "johannesburg").map((link) => link.href),
      ["/guides/best-sports-bars-johannesburg"],
    );
    assert.equal(watchCalendarSideLinks("soccer", "johannesburg").crossSport, null);
    assert.deepEqual(watchRelatedGuides("motorsport", "johannesburg").map((link) => link.href), [
      "/guides/where-to-watch-f1-johannesburg",
      "/guides/best-sports-bars-johannesburg",
    ]);
    assert.equal(watchRelatedGuideLink("rugby", "durban"), null);
    assert.deepEqual(watchRelatedGuides("soccer", "durban"), []);
  });

  it("puts the next screening on the meta line and falls back to Screens · Parking", () => {
    assert.match(
      watchVenueMetaLine({
        sportName: "Soccer",
        nextTitle: pirates.title,
        nextStartsAt: pirates.startsAt,
        hasScreens: true,
        hasParking: true,
        now,
      }) ?? "",
      /^Next soccer screening · Orlando Pirates vs Kaizer Chiefs · /,
    );
    assert.equal(
      watchVenueMetaLine({
        sportName: "Rugby",
        hasScreens: true,
        hasParking: true,
        hasLiveAudio: true,
      }),
      "Screens · Parking · Live audio",
    );
    assert.equal(
      watchVenueMetaLine({ sportName: "Rugby", hasScreens: true }),
      "Screens",
    );
    assert.equal(watchVenueMetaLine({ sportName: "Rugby" }), null);
  });

  it("dedupes venue cards by slug and keeps a photo without replacing the record", () => {
    const rows = dedupeVenuesBySlug([
      {
        slug: "cescos-randburg",
        name: "A",
        hero_image: null,
        upcoming_screenings: [pirates],
        has_big_screens: true,
      },
      {
        slug: "cescos-randburg",
        name: "B",
        hero_image: { asset: { _ref: "image-abc" } },
        upcoming_screenings: [],
        has_big_screens: false,
      },
      { slug: "beer-park-sandton", name: "C", hero_image: null },
    ]);
    assert.deepEqual(
      rows.map((row) => row.name),
      ["A", "C"],
    );
    assert.deepEqual(rows[0]?.hero_image, { asset: { _ref: "image-abc" } });
    assert.equal(rows[0]?.upcoming_screenings?.[0]?.title, pirates.title);
    assert.equal(rows[0]?.has_big_screens, true);
  });

  it("does not let a photo-only duplicate hide the other doc's screening", () => {
    const photoOnly = {
      name: "Cesco's Randburg",
      slug: "cescos-randburg",
      broadcasts: [] as { slug: string }[],
      upcoming_screenings: [] as { title: string; startsAt: string }[],
      hero_image: { asset: { _ref: "image-photo-only" } },
      has_big_screens: false,
      has_parking: false,
    };
    const withScreening = {
      ...cesco,
      hero_image: null,
      has_big_screens: true,
      has_parking: true,
    };

    for (const listed of [
      [withScreening, photoOnly],
      [photoOnly, withScreening],
    ]) {
      const deduped = dedupeVenuesBySlug(listed);
      assert.equal(deduped.length, 1);
      assert.deepEqual(deduped[0]?.hero_image, photoOnly.hero_image);
      assert.equal(deduped[0]?.has_big_screens, true);
      assert.equal(deduped[0]?.has_parking, true);
      assert.ok(
        (deduped[0]?.broadcasts ?? []).some((item) => item.slug === "soccer"),
      );
      const rows = watchCalendarScreenings(deduped, upcoming, "soccer", now, 6);
      assert.deepEqual(
        rows.map((row) => `${row.title} @ ${row.venueSlug}`),
        [`${pirates.title} @ cescos-randburg`],
      );
    }
  });

  it("links a matched fixture and does not invent a calendar href", () => {
    const rows = watchCalendarScreenings(venues, upcoming, "soccer", now);
    assert.ok(rows.length > 0);
    assert.ok(rows.length <= WATCH_CITY_CALENDAR_LIMIT);
    assert.ok(rows.every((row) => row.href?.startsWith("/events/")));
    const cricket = watchCalendarScreenings(venues, upcoming, "cricket", now);
    assert.equal(cricket.length, 0);
  });
});
