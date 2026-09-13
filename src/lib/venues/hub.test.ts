import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  VENUE_HUB_EVENT_TILE_LIMIT,
  VENUE_HUB_FAVOURITES_EMPTY,
  VENUE_HUB_FAVOURITES_LIMIT,
  VENUE_HUB_FIXTURE_FETCH_LIMIT,
  VENUE_HUB_ON_NOW_LIMIT,
  VENUE_HUB_PLAY_SEO_CITY,
  VENUE_HUB_RECOMMENDED_LIMIT,
  VENUE_HUB_SEARCH_LIMIT,
  VENUE_HUB_SEARCH_MIN,
  buildOnNowCards,
  capVenueHubFavourites,
  capVenueHubSearchResults,
  favouritesSection,
  filterHubEventTiles,
  isVenueHubDirectoryHref,
  resolveRecommendedCity,
  shouldLoadVenueHubSession,
  venueHubDirectoryLinks,
  venueHubMatchTerm,
} from "./hub.ts";
import { isHubPlayDashboardSport } from "../sports/hub-ia.ts";
import type { UpcomingFixture } from "../sports/events-feed.ts";

const hubPageSource = readFileSync(
  new URL("../../app/venues/page.tsx", import.meta.url),
  "utf8",
);

const hubServiceSource = readFileSync(
  new URL("../../services/venueHub.ts", import.meta.url),
  "utf8",
);

function fixture(
  partial: Partial<UpcomingFixture> &
    Pick<UpcomingFixture, "slug" | "title">,
): UpcomingFixture {
  return {
    sportSlug: null,
    startsAt: null,
    venues: [],
    kind: "event",
    ...partial,
  };
}

describe("venueHubMatchTerm", () => {
  it("returns null below the minimum character count", () => {
    assert.ok(VENUE_HUB_SEARCH_MIN >= 2);
    assert.equal(venueHubMatchTerm(""), null);
    assert.equal(venueHubMatchTerm("a"), null);
    assert.equal(venueHubMatchTerm("  b  "), null);
  });

  it("builds a name/slug prefix token once the minimum is met", () => {
    assert.equal(venueHubMatchTerm("Mo"), "mo*");
    assert.equal(venueHubMatchTerm("  Molly's  "), "molly's*");
  });
});

describe("capVenueHubSearchResults", () => {
  it("caps typeahead hits so the client never receives a catalog", () => {
    const rows = Array.from({ length: 40 }, (_, index) => ({ id: String(index) }));
    assert.equal(capVenueHubSearchResults(rows).length, VENUE_HUB_SEARCH_LIMIT);
    assert.ok(VENUE_HUB_SEARCH_LIMIT <= 10);
  });
});

describe("venues hub does not fetch the full catalog", () => {
  it("does not call searchVenues or render an All venues dump", () => {
    assert.doesNotMatch(hubPageSource, /\bsearchVenues\b/);
    assert.doesNotMatch(hubPageSource, /All venues/);
    assert.match(hubPageSource, /VenueNameSearch/);
    assert.match(hubPageSource, /venueHubDirectoryLinks/);
  });

  it("does not run cookies or Railway auth on the public hub page", () => {
    assert.doesNotMatch(hubPageSource, /cookies\(/);
    assert.doesNotMatch(hubPageSource, /getServerAuthState/);
    assert.doesNotMatch(hubPageSource, /listFollowedVenues/);
    assert.match(hubPageSource, /VENUE_HUB_FIXTURE_FETCH_LIMIT/);
    assert.match(hubPageSource, /Suspense/);
    assert.equal(VENUE_HUB_FIXTURE_FETCH_LIMIT, 48);
  });

  it("keeps Sanity reads sliced to hub caps", () => {
    assert.match(hubServiceSource, /\[0\.\.\.10\]/);
    assert.match(
      hubServiceSource,
      new RegExp(`\\[0\\.\\.\\.${VENUE_HUB_RECOMMENDED_LIMIT}\\]`),
    );
    assert.match(hubServiceSource, /name match \$term/);
    assert.match(hubServiceSource, /slug\.current match \$term/);
    assert.doesNotMatch(hubServiceSource, /order\(_createdAt desc\)/);
  });

  it("projects recommended cards without golfCourse or Portable Text", () => {
    assert.match(hubServiceSource, /VENUE_HUB_CARD_PROJECTION/);
    assert.doesNotMatch(hubServiceSource, /\$\{VENUE_PROJECTION\}/);
    assert.doesNotMatch(hubServiceSource, /\$\{GOLF_COURSE_PROJECTION\}/);
    const cardProjection = hubServiceSource.slice(
      hubServiceSource.indexOf("export const VENUE_HUB_CARD_PROJECTION"),
      hubServiceSource.indexOf("export const VENUE_HUB_SEARCH_QUERY"),
    );
    assert.match(cardProjection, /hero_image/);
    assert.doesNotMatch(cardProjection, /golfCourse/);
    assert.doesNotMatch(cardProjection, /\bdescription\b/);
  });
});

describe("favouritesSection", () => {
  it("hides the block when the visitor is anonymous", () => {
    assert.deepEqual(favouritesSection({ signedIn: false, followedCount: 3 }), {
      visible: false,
    });
  });

  it("shows the follow empty copy for a signed-in user with no pins", () => {
    assert.deepEqual(favouritesSection({ signedIn: true, followedCount: 0 }), {
      visible: true,
      empty: true,
      copy: VENUE_HUB_FAVOURITES_EMPTY,
    });
    assert.equal(
      VENUE_HUB_FAVOURITES_EMPTY,
      "Follow a venue to pin it here.",
    );
  });
});

describe("venueHubDirectoryLinks", () => {
  it("rejects noindex Play dashboards even when the path starts with /play", () => {
    assert.equal(isVenueHubDirectoryHref("/play/golf"), false);
    assert.equal(isVenueHubDirectoryHref("/play/darts"), false);
    assert.equal(isVenueHubDirectoryHref("/play/padel"), false);
    assert.equal(
      isVenueHubDirectoryHref(`/play/golf/${VENUE_HUB_PLAY_SEO_CITY}`),
      true,
    );
    assert.equal(isVenueHubDirectoryHref("/play/tennis"), true);
    assert.equal(isVenueHubDirectoryHref("/watch/soccer"), true);
  });

  it("only links to crawlable Watch / Play / city / sport SEO routes", () => {
    const links = venueHubDirectoryLinks();
    assert.ok(links.some((link) => link.href === "/watch"));
    assert.ok(links.some((link) => link.href === "/play"));
    assert.ok(links.some((link) => link.group === "cities"));
    assert.ok(links.some((link) => link.group === "sports"));

    const dashboardHrefs = ["/play/golf", "/play/darts", "/play/padel"];
    for (const href of dashboardHrefs) {
      assert.ok(
        !links.some((link) => link.href === href),
        `${href} is a noindex Play dashboard`,
      );
    }

    const golf = links.find((link) => link.label === "Golf");
    const darts = links.find((link) => link.label === "Darts");
    assert.ok(golf);
    assert.ok(darts);
    assert.equal(golf.href, `/play/golf/${VENUE_HUB_PLAY_SEO_CITY}`);
    assert.equal(darts.href, `/play/darts/${VENUE_HUB_PLAY_SEO_CITY}`);
    assert.ok(isHubPlayDashboardSport("golf"));
    assert.ok(isHubPlayDashboardSport("darts"));

    for (const link of links) {
      assert.ok(
        isVenueHubDirectoryHref(link.href),
        `${link.href} is not a crawlable Watch/Play SEO route`,
      );
      assert.doesNotMatch(link.href, /^\/venues(\?|$)/);
    }
  });
});

describe("filterHubEventTiles", () => {
  const fixtures = [
    fixture({
      slug: "boks",
      title: "Springboks",
      sportSlug: "rugby",
      startsAt: "2026-09-14T16:00:00.000Z",
    }),
    fixture({
      slug: "derby",
      title: "Soweto derby",
      sportSlug: "soccer",
      startsAt: "2026-09-14T18:00:00.000Z",
    }),
    fixture({
      slug: "padel-final",
      title: "Padel final",
      sportSlug: "padel",
      startsAt: "2026-09-15T10:00:00.000Z",
    }),
  ];

  it("respects ?sport= including football → soccer aliases", () => {
    const soccer = filterHubEventTiles(fixtures, "football");
    assert.deepEqual(
      soccer.map((item) => item.slug),
      ["derby"],
    );
  });

  it("caps tiles and keeps the unfiltered list when sport is absent", () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      fixture({ slug: `f-${index}`, title: `Fixture ${index}` }),
    );
    assert.equal(
      filterHubEventTiles(many, null).length,
      VENUE_HUB_EVENT_TILE_LIMIT,
    );
  });

  it("still finds soccer when it sits after the old limit-12 window", () => {
    const rugby = Array.from({ length: 12 }, (_, index) =>
      fixture({
        slug: `r-${index}`,
        title: `Rugby ${index}`,
        sportSlug: "rugby",
      }),
    );
    const fetched = [
      ...rugby,
      fixture({
        slug: "derby",
        title: "Soweto derby",
        sportSlug: "soccer",
      }),
    ];
    assert.ok(fetched.length <= VENUE_HUB_FIXTURE_FETCH_LIMIT);
    assert.deepEqual(
      filterHubEventTiles(fetched, "soccer").map((item) => item.slug),
      ["derby"],
    );
  });
});

describe("buildOnNowCards", () => {
  it("caps unique venues tied to screenings inside the window", () => {
    const now = new Date("2026-09-13T10:00:00.000Z");
    const fixtures = Array.from({ length: 12 }, (_, index) =>
      fixture({
        slug: `game-${index}`,
        title: `Game ${index}`,
        startsAt: new Date(now.getTime() + (index + 1) * 60 * 60 * 1000).toISOString(),
        venues: [
          {
            name: `Venue ${index}`,
            slug: `venue-${index}`,
            city: "Cape Town",
          },
        ],
      }),
    );
    const cards = buildOnNowCards(fixtures, now);
    assert.equal(cards.length, VENUE_HUB_ON_NOW_LIMIT);
    assert.equal(cards[0]?.venueSlug, "venue-0");
    assert.equal(cards[0]?.fixtureTitle, "Game 0");
  });
});

describe("shouldLoadVenueHubSession", () => {
  it("skips Railway auth when the cookie jar is empty", () => {
    assert.equal(shouldLoadVenueHubSession(""), false);
    assert.equal(shouldLoadVenueHubSession("   "), false);
    assert.equal(shouldLoadVenueHubSession("sid=abc"), true);
  });
});

describe("capVenueHubFavourites", () => {
  it("caps the follow list so the hub never hydrates the full pin set", () => {
    const rows = Array.from({ length: 20 }, (_, index) => ({ id: String(index) }));
    assert.equal(capVenueHubFavourites(rows).length, VENUE_HUB_FAVOURITES_LIMIT);
    assert.ok(VENUE_HUB_FAVOURITES_LIMIT <= 8);
  });
});

describe("resolveRecommendedCity", () => {
  it("prefers the query location, then the most common followed city", () => {
    assert.equal(
      resolveRecommendedCity({
        locationSlug: "claremont",
        followedVenueCities: [{ citySlug: "johannesburg" }],
      }),
      "claremont",
    );
    assert.equal(
      resolveRecommendedCity({
        followedVenueCities: [
          { citySlug: "johannesburg" },
          { citySlug: "cape-town" },
          { citySlug: "johannesburg" },
        ],
      }),
      "johannesburg",
    );
    assert.equal(resolveRecommendedCity({}), null);
  });
});
