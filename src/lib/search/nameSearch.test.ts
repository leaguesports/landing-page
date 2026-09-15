import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VENUE_NAME_SEARCH_DEBOUNCE_MS,
  VENUE_NAME_SEARCH_EMPTY,
  VENUE_NAME_SEARCH_ERROR,
  VENUE_NAME_SEARCH_FETCH_LIMIT,
  VENUE_NAME_SEARCH_HAYSTACK,
  VENUE_NAME_SEARCH_LIMIT,
  VENUE_NAME_SEARCH_MAX,
  VENUE_NAME_SEARCH_MIN,
  capVenueNameSearchResults,
  clampVenueNameQuery,
  matchesVenueNameQuery,
  normalizeVenueNameQuery,
  rankVenueNameHits,
  venueNameHaystack,
  venueNameMatchTerm,
  venueNameQueryTokens,
  venueNameSearchHint,
  venueNameSearchHref,
  venueNameSearchShouldFetch,
} from "./nameSearch.ts";

describe("venue name search contract", () => {
  it("requires at least two characters before a fetch", () => {
    assert.equal(VENUE_NAME_SEARCH_MIN, 2);
    assert.equal(venueNameMatchTerm(""), null);
    assert.equal(venueNameMatchTerm("a"), null);
    assert.equal(venueNameMatchTerm("  b  "), null);
    assert.equal(venueNameSearchShouldFetch("a"), false);
    assert.equal(venueNameSearchShouldFetch("Mo"), true);
  });

  it("caps queries so leftover-regex and GROQ $term stay bounded", () => {
    assert.equal(VENUE_NAME_SEARCH_MAX, 80);
    const long = `Africa Padel ${"x".repeat(200)}`;
    const clamped = clampVenueNameQuery(long);
    assert.equal(clamped.length, VENUE_NAME_SEARCH_MAX);
    assert.ok(clamped.startsWith("Africa Padel"));
    const term = venueNameMatchTerm(long);
    assert.ok(term);
    assert.ok(term.length <= VENUE_NAME_SEARCH_MAX + 1);
    assert.equal(term?.endsWith("*"), true);
  });

  it("exports a 250ms debounce contract for typeahead fetches", () => {
    assert.equal(VENUE_NAME_SEARCH_DEBOUNCE_MS, 250);
  });

  it("builds a Sanity prefix match token (GROQ query shape)", () => {
    assert.equal(venueNameMatchTerm("Mo"), "mo*");
    assert.equal(venueNameMatchTerm("  Molly's  "), "molly's*");
    assert.equal(venueNameMatchTerm("The Grid Sandton"), "the grid sandton*");
    assert.equal(venueNameMatchTerm("club #1"), "club 1*");
    assert.match(VENUE_NAME_SEARCH_HAYSTACK, /name/);
    assert.match(VENUE_NAME_SEARCH_HAYSTACK, /address\.city->title/);
    assert.match(VENUE_NAME_SEARCH_HAYSTACK, /address\.suburb->title/);
    assert.match(VENUE_NAME_SEARCH_HAYSTACK, /slug\.current/);
    assert.ok(VENUE_NAME_SEARCH_FETCH_LIMIT >= VENUE_NAME_SEARCH_LIMIT);
    assert.equal(VENUE_NAME_SEARCH_LIMIT, 10);
  });

  it("caps results so clients never receive a catalog", () => {
    const rows = Array.from({ length: 40 }, (_, index) => ({ id: String(index) }));
    assert.equal(capVenueNameSearchResults(rows).length, VENUE_NAME_SEARCH_LIMIT);
  });

  it("exposes a sensible empty and error state", () => {
    assert.match(VENUE_NAME_SEARCH_EMPTY, /no venues matched/i);
    assert.match(VENUE_NAME_SEARCH_ERROR, /try again/i);
    assert.equal(
      venueNameSearchHint(),
      "Type at least 2 characters to search by name.",
    );
  });
});

describe("normalizeVenueNameQuery", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizeVenueNameQuery("  The   Grid  "), "the grid");
  });
});

describe("matchesVenueNameQuery", () => {
  const grid = {
    name: "The Grid",
    slug: "the-grid",
    city: "Sandton",
    suburb: "Sandton",
  };

  it("matches a full venue name", () => {
    assert.equal(matchesVenueNameQuery(grid, "The Grid"), true);
  });

  it("matches a partial name", () => {
    assert.equal(matchesVenueNameQuery(grid, "grid"), true);
    assert.equal(matchesVenueNameQuery(grid, "Gri"), true);
  });

  it("matches name + city tokens spread across fields", () => {
    assert.equal(matchesVenueNameQuery(grid, "The Grid Sandton"), true);
    assert.deepEqual(venueNameQueryTokens("The Grid Sandton"), [
      "the",
      "grid",
      "sandton",
    ]);
    assert.match(venueNameHaystack(grid), /sandton/);
  });

  it("rejects unrelated queries", () => {
    assert.equal(matchesVenueNameQuery(grid, "Wanderers"), false);
  });

  it("treats an empty query as a match so pickers can show the list", () => {
    assert.equal(matchesVenueNameQuery(grid, "   "), true);
  });
});

describe("rankVenueNameHits", () => {
  it("ranks exact name matches ahead of partial hits", () => {
    const ranked = rankVenueNameHits(
      [
        { name: "Africa Padel Sandton", slug: "africa-padel-sandton" },
        { name: "Africa Padel", slug: "africa-padel" },
        { name: "Padel Africa Club", slug: "padel-africa-club" },
      ],
      "Africa Padel",
    );
    assert.equal(ranked[0]?.name, "Africa Padel");
    assert.equal(ranked[1]?.name, "Africa Padel Sandton");
  });
});

describe("venueNameSearchHref", () => {
  it("keeps Find Venue hub as the name-search home", () => {
    assert.equal(venueNameSearchHref(""), "/venues");
    assert.equal(
      venueNameSearchHref("  Africa Padel  "),
      "/venues?q=Africa%20Padel",
    );
  });
});
