import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPORT_CATALOG } from "../sports/catalog.ts";
import { buildUpcomingFixtures } from "../sports/events-feed.ts";
import { mergeVenueUpcomingScreenings } from "../sports/events-path.ts";
import {
  venueBroadcastSportSlugs,
  watchCalendarScreenings,
  watchEventsHref,
  watchRelatedGuideLink,
  watchScreeningEmptyCopy,
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

  it("empty copy names the page sport and links events plus a city guide", () => {
    assert.equal(
      watchScreeningEmptyCopy("Rugby"),
      "No upcoming rugby screenings listed yet",
    );
    assert.equal(
      watchScreeningEmptyCopy("Cricket"),
      "No upcoming cricket screenings listed yet",
    );
    assert.equal(watchEventsHref("rugby"), "/events?sport=rugby");
    assert.deepEqual(
      watchRelatedGuideLink(upcoming, "rugby", "johannesburg"),
      {
        href: "/guides/where-to-watch-rugby-johannesburg",
        label: "Where to Watch Springboks & Rugby in Johannesburg",
      },
    );
    const withGeneric = [
      {
        ...upcoming[0]!,
        sportSlug: "rugby",
        relatedGuide: {
          title: "Best Sports Bars in Johannesburg",
          slug: "best-sports-bars-johannesburg",
        },
      },
      ...upcoming,
    ];
    assert.equal(
      watchRelatedGuideLink(withGeneric, "rugby", "johannesburg").href,
      "/guides/where-to-watch-rugby-johannesburg",
    );
    assert.equal(
      watchRelatedGuideLink([], "motorsport", "johannesburg").href,
      "/guides",
    );
  });
});
