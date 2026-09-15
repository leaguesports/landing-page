import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildVenueDirectoryPath,
  classifySiteSearch,
  leftoverVenueNameText,
  parseVenueSearch,
  parseVenueSearchParams,
  resolveVenuesLanding,
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

  it("maps social play aliases onto directory sports", () => {
    const cases = [
      {
        query: "Play AR darts in Sandton",
        sportSlug: "darts",
        sportName: "Darts",
        locationSlug: "sandton",
        citySlug: "johannesburg",
      },
      {
        query: "Play snooker in Claremont",
        sportSlug: "pool",
        sportName: "Pool",
        locationSlug: "claremont",
        citySlug: "cape-town",
      },
      {
        query: "Play hyper bowling in Rosebank",
        sportSlug: "bowling",
        sportName: "Bowling",
        locationSlug: "rosebank",
        citySlug: "johannesburg",
      },
      {
        query: "Play golf simulator in Sandton",
        sportSlug: "indoor-golf",
        sportName: "Indoor Golf",
        locationSlug: "sandton",
        citySlug: "johannesburg",
      },
      {
        query: "Play driving range in Rosebank",
        sportSlug: "driving-range",
        sportName: "Driving Range",
        locationSlug: "rosebank",
        citySlug: "johannesburg",
      },
      {
        query: "Play sim racing in Claremont",
        sportSlug: "sim-racing",
        sportName: "Sim Racing",
        locationSlug: "claremont",
        citySlug: "cape-town",
      },
    ] as const;

    for (const expected of cases) {
      const parsed = parseVenueSearch(expected.query, "watch");
      assert.equal(parsed.intent, "play", expected.query);
      assert.equal(parsed.sportSlug, expected.sportSlug, expected.query);
      assert.equal(parsed.sportName, expected.sportName, expected.query);
      assert.equal(parsed.locationSlug, expected.locationSlug, expected.query);
      assert.equal(parsed.citySlug, expected.citySlug, expected.query);
    }
  });

  it("builds a Sanity directory URL", () => {
    const parsed = parseVenueSearch("Watch soccer in Claremont", "watch");
    assert.equal(
      buildVenueDirectoryPath(parsed),
      "/watch/soccer/claremont",
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
  it("builds SEO landings when intent + sport are known", () => {
    assert.equal(
      venueDirectoryHref({ intent: "play", sport: "padel" }),
      "/play/padel",
    );
    assert.equal(venueDirectoryHref({ intent: "all" }), "/venues");
    assert.equal(venueDirectoryHref({}), "/venues");
  });
});

describe("venueDirectoryHrefFromQuery", () => {
  it("parses a full Watch query", () => {
    assert.equal(
      venueDirectoryHrefFromQuery("Watch soccer in Claremont", null),
      "/watch/soccer/claremont",
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

describe("classifySiteSearch", () => {
  it("treats a specific venue name as name search, not a sport landing", () => {
    const classified = classifySiteSearch("Africa Padel", "watch");
    assert.equal(classified.kind, "venue-name");
    if (classified.kind !== "venue-name") return;
    assert.equal(classified.href, "/venues?q=Africa%20Padel");
    assert.ok(leftoverVenueNameText("Africa Padel").length > 0);
  });

  it("keeps Watch soccer in Claremont on the directory", () => {
    const classified = classifySiteSearch("Watch soccer in Claremont", "play");
    assert.equal(classified.kind, "directory");
    if (classified.kind !== "directory") return;
    assert.equal(classified.href, "/watch/soccer/claremont");
    assert.equal(leftoverVenueNameText("Watch soccer in Claremont"), "");
  });

  it("keeps a sport-only query on the directory", () => {
    const classified = classifySiteSearch("padel", "play");
    assert.equal(classified.kind, "directory");
    if (classified.kind !== "directory") return;
    assert.equal(classified.href, "/play/padel");
  });

  it("keeps a city-only query on the directory", () => {
    const classified = classifySiteSearch("Sandton", null);
    assert.equal(classified.kind, "directory");
    if (classified.kind !== "directory") return;
    assert.equal(classified.parsed.locationSlug, "sandton");
  });

  it("keeps play + sport alias + suburb on the directory", () => {
    const classified = classifySiteSearch(
      "Play go karting in Rosebank",
      "watch",
    );
    assert.equal(classified.kind, "directory");
    if (classified.kind !== "directory") return;
    assert.equal(classified.href, "/play/karting/rosebank");
  });

  it("treats a partial unique name as name search", () => {
    const classified = classifySiteSearch("Wanderers", "watch");
    assert.equal(classified.kind, "venue-name");
  });
});

describe("resolveVenuesLanding", () => {
  it("does not redirect a venue name that contains a sport word", () => {
    const landing = resolveVenuesLanding({ q: "Africa Padel" });
    assert.equal(landing.kind, "name");
    assert.equal(landing.redirectTo, null);
    assert.equal(landing.nameQuery, "Africa Padel");
    assert.equal(landing.filters.sportSlug, null);
  });

  it("redirects a pure sport+place query to the SEO landing", () => {
    const landing = resolveVenuesLanding({ q: "Watch soccer in Claremont" });
    assert.equal(landing.kind, "directory");
    assert.equal(landing.redirectTo, "/watch/soccer/claremont");
  });

  it("still lets explicit sport/location params win over q", () => {
    const landing = resolveVenuesLanding({
      sport: "golf",
      location: "johannesburg",
      q: "Africa Padel",
    });
    assert.equal(landing.kind, "directory");
    assert.equal(landing.filters.sportSlug, "golf");
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
