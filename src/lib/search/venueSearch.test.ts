import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildVenueDirectoryPath,
  parseVenueSearch,
  parseVenueSearchParams,
  venueDirectoryHref,
  venueDirectoryHrefFromQuery,
  venueResultCountLabel,
  venueSearchQueryText,
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

  it("omits a trailing question mark when there are no filters", () => {
    assert.equal(
      buildVenueDirectoryPath({
        intent: null,
        sportSlug: null,
        sportName: null,
        locationSlug: null,
        locationLabel: null,
        locationKind: null,
        citySlug: null,
      }),
      "/venues",
    );
  });
});

describe("venueDirectoryHref", () => {
  it("builds filter URLs and drops empty params", () => {
    assert.equal(
      venueDirectoryHref({ intent: "play", sport: "padel" }),
      "/venues?intent=play&sport=padel",
    );
    assert.equal(venueDirectoryHref({ intent: "all" }), "/venues");
    assert.equal(venueDirectoryHref({}), "/venues");
  });
});

describe("venueDirectoryHrefFromQuery", () => {
  it("parses a full Watch query", () => {
    assert.equal(
      venueDirectoryHrefFromQuery("Watch soccer in Claremont", null),
      "/venues?intent=watch&sport=soccer&location=claremont",
    );
  });

  it("keeps All when the query has no Watch/Play verb", () => {
    assert.equal(
      venueDirectoryHrefFromQuery("padel in Sandton", null),
      "/venues?sport=padel&location=sandton",
    );
  });

  it("keeps the current intent when the query has no verb", () => {
    assert.equal(
      venueDirectoryHrefFromQuery("Claremont", "play"),
      "/venues?intent=play&location=claremont",
    );
  });
});

describe("venueResultCountLabel", () => {
  it("pluralizes venue counts", () => {
    assert.equal(venueResultCountLabel(0), "0 venues");
    assert.equal(venueResultCountLabel(1), "1 venue");
    assert.equal(venueResultCountLabel(12), "12 venues");
  });
});

describe("venueSearchQueryText", () => {
  it("prefills sport and place without a Watch/Play verb", () => {
    assert.equal(
      venueSearchQueryText({
        intent: "watch",
        sportSlug: "soccer",
        sportName: "Soccer",
        locationSlug: "claremont",
        locationLabel: "Claremont",
        locationKind: "suburb",
        citySlug: "cape-town",
      }),
      "Soccer in Claremont",
    );
  });

  it("returns an empty string when nothing is selected", () => {
    assert.equal(
      venueSearchQueryText({
        intent: "play",
        sportSlug: null,
        sportName: null,
        locationSlug: null,
        locationLabel: null,
        locationKind: null,
        citySlug: null,
      }),
      "",
    );
  });
});

describe("parseVenueSearchParams", () => {
  it("maps free-text q into sport and location filters", () => {
    const parsed = parseVenueSearchParams({
      intent: "play",
      q: "padel in Cape Town",
    });
    assert.equal(parsed.intent, "play");
    assert.equal(parsed.sportSlug, "padel");
    assert.equal(parsed.locationSlug, "cape-town");
  });

  it("lets explicit sport and location win over q", () => {
    const parsed = parseVenueSearchParams({
      intent: "play",
      sport: "golf",
      location: "johannesburg",
      q: "padel in Cape Town",
    });
    assert.equal(parsed.sportSlug, "golf");
    assert.equal(parsed.locationSlug, "johannesburg");
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
