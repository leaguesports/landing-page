import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  VENUE_HUB_EVENT_TILE_LIMIT,
  VENUE_HUB_FAVOURITES_EMPTY,
  VENUE_HUB_ON_NOW_LIMIT,
  VENUE_HUB_RECOMMENDED_LIMIT,
  VENUE_HUB_SEARCH_LIMIT,
  VENUE_HUB_SEARCH_MIN,
  buildOnNowCards,
  capVenueHubSearchResults,
  favouritesSection,
  filterHubEventTiles,
  isVenueHubDirectoryHref,
  resolveRecommendedCity,
  venueHubDirectoryLinks,
  venueHubMatchTerm,
} from "./hub.ts";
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
  it("only links to existing Watch / Play / city / sport SEO routes", () => {
    const links = venueHubDirectoryLinks();
    assert.ok(links.some((link) => link.href === "/watch"));
    assert.ok(links.some((link) => link.href === "/play"));
    assert.ok(links.some((link) => link.group === "cities"));
    assert.ok(links.some((link) => link.group === "sports"));
    for (const link of links) {
      assert.ok(
        isVenueHubDirectoryHref(link.href),
        `${link.href} is not a Watch/Play SEO route`,
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
