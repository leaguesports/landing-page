import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { highlightFixtureVenues, withFeaturedVenueCards } from "./highlight-venues.ts";

const venues = [
  { slug: "zeta", name: "Zeta Bar" },
  { slug: "alpha", name: "Alpha Bar" },
  { slug: "ellis-park", name: "Ellis Park" },
  { slug: "midrand", name: "Midrand Fan Zone" },
  { slug: "cape", name: "Cape Town Bar" },
];

describe("highlightFixtureVenues", () => {
  it("keeps four venues and puts the host first", () => {
    const shown = highlightFixtureVenues(venues, "ellis-park");
    assert.deepEqual(
      shown.map((venue) => venue.slug),
      ["ellis-park", "alpha", "cape", "midrand"],
    );
  });

  it("keeps highlight order and fills a home card when the photo is missing", () => {
    const cards = withFeaturedVenueCards(
      venues.slice(0, 2),
      [
        {
          slug: "zeta",
          name: "Zeta Bar",
          place: "Sandton, Johannesburg",
          sports: [{ slug: "soccer", name: "Soccer" }],
          imageUrl: "https://cdn.example/zeta.jpg",
          imageAlt: "Zeta",
        },
      ],
      { slug: "soccer", name: "Soccer" },
    );
    assert.equal(cards[0]?.imageUrl, "https://cdn.example/zeta.jpg");
    assert.equal(cards[0]?.sports[0]?.slug, "soccer");
    assert.equal(cards[1]?.slug, "alpha");
    assert.equal(cards[1]?.sports[0]?.name, "Soccer");
    assert.equal(cards[1]?.imageUrl, "");
  });

  it("returns every venue when there are four or fewer", () => {
    const shown = highlightFixtureVenues(venues.slice(0, 3), null);
    assert.equal(shown.length, 3);
    assert.equal(shown[0]?.slug, "alpha");
  });
});
