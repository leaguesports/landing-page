import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildVenueDirectoryPath,
  parseVenueSearch,
  venueSearchSummary,
} from "./venueSearch.ts";
import { filterSuggestions } from "../../data/cities.ts";

describe("parseVenueSearch", () => {
  it("parses Watch soccer in Claremont", () => {
    const parsed = parseVenueSearch("Watch soccer in Claremont", "play");
    assert.equal(parsed.intent, "watch");
    assert.equal(parsed.sportSlug, "soccer");
    assert.equal(parsed.locationSlug, "claremont");
    assert.equal(parsed.locationKind, "suburb");
    assert.equal(parsed.citySlug, "cape-town");
  });

  it("parses Play padel in Sandton", () => {
    const parsed = parseVenueSearch("Play padel in Sandton", "watch");
    assert.equal(parsed.intent, "play");
    assert.equal(parsed.sportSlug, "padel");
    assert.equal(parsed.locationSlug, "sandton");
    assert.equal(parsed.citySlug, "johannesburg");
  });

  it("uses the Watch/Play toggle when the query has no verb", () => {
    const parsed = parseVenueSearch("soccer in Claremont", "watch");
    assert.equal(parsed.intent, "watch");
    assert.equal(parsed.sportSlug, "soccer");
    assert.equal(parsed.locationSlug, "claremont");
  });

  it("maps football to soccer", () => {
    const parsed = parseVenueSearch("watch football in claremont", "play");
    assert.equal(parsed.sportSlug, "soccer");
  });

  it("maps go-karting aliases onto karting play search", () => {
    const parsed = parseVenueSearch("Play go karting in Rosebank", "watch");
    assert.equal(parsed.intent, "play");
    assert.equal(parsed.sportSlug, "karting");
    assert.equal(parsed.sportName, "Karting");
    assert.equal(parsed.locationSlug, "rosebank");
    assert.equal(parsed.citySlug, "johannesburg");
  });

  it("builds a Sanity directory URL", () => {
    const parsed = parseVenueSearch("Watch soccer in Claremont", "watch");
    assert.equal(
      buildVenueDirectoryPath(parsed),
      "/venues?intent=watch&sport=soccer&location=claremont",
    );
    assert.equal(venueSearchSummary(parsed), "Watch Soccer in Claremont");
  });
});

describe("filterSuggestions", () => {
  it("surfaces sport and suburb from Watch soccer in Claremont", () => {
    const labels = filterSuggestions("Watch soccer in Claremont", 12).map(
      (item) => item.label,
    );
    assert.ok(labels.includes("Soccer"));
    assert.ok(labels.includes("Claremont"));
  });
});
