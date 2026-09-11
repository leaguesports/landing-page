import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectEventsCityFromText,
  eventsCityLabel,
  filterFixturesByCity,
  parseEventsCityParam,
  venueMatchesEventsCity,
} from "./events-city.ts";

describe("parseEventsCityParam", () => {
  it("maps JHB / CPT / DBN / PTA and city-directory aliases", () => {
    assert.equal(parseEventsCityParam("cpt"), "cpt");
    assert.equal(parseEventsCityParam("CPT"), "cpt");
    assert.equal(parseEventsCityParam("cape-town"), "cpt");
    assert.equal(parseEventsCityParam("Cape Town"), "cpt");
    assert.equal(parseEventsCityParam("jhb"), "jhb");
    assert.equal(parseEventsCityParam("joburg"), "jhb");
    assert.equal(parseEventsCityParam("Johannesburg"), "jhb");
    assert.equal(parseEventsCityParam("dbn"), "dbn");
    assert.equal(parseEventsCityParam("durban"), "dbn");
    assert.equal(parseEventsCityParam("pta"), "pta");
    assert.equal(parseEventsCityParam("pretoria"), "pta");
    assert.equal(parseEventsCityParam("tshwane"), "pta");
  });

  it("treats unknown or empty values as All cities", () => {
    assert.equal(parseEventsCityParam(undefined), null);
    assert.equal(parseEventsCityParam(""), null);
    assert.equal(parseEventsCityParam("stellenbosch"), null);
    assert.equal(parseEventsCityParam(["", "cpt"]), null);
  });
});

describe("venueMatchesEventsCity", () => {
  it("matches venue city titles and slugs, including Joburg and suburbs", () => {
    assert.equal(
      venueMatchesEventsCity({ city: "Cape Town" }, "cpt"),
      true,
    );
    assert.equal(
      venueMatchesEventsCity({ citySlug: "cape-town" }, "cpt"),
      true,
    );
    assert.equal(
      venueMatchesEventsCity({ city: "Joburg" }, "jhb"),
      true,
    );
    assert.equal(
      venueMatchesEventsCity({ citySlug: "sandton" }, "jhb"),
      true,
    );
    assert.equal(
      venueMatchesEventsCity({ city: "Umhlanga" }, "dbn"),
      true,
    );
    assert.equal(
      venueMatchesEventsCity({ city: "Durban" }, "cpt"),
      false,
    );
  });
});

describe("filterFixturesByCity", () => {
  const nowSlug = "springboks-vs-all-blacks-2026-09-06";

  it("keeps metro venues plus CMS-only national fixtures", () => {
    const fixtures = [
      {
        slug: nowSlug,
        venues: [
          { name: "The Local", slug: "the-local", city: "Cape Town", citySlug: "cape-town" },
        ],
      },
      {
        slug: "soweto-derby-2026-09-07",
        venues: [
          { name: "Fan Zone JHB", slug: "fan-zone-jhb", city: "Johannesburg", citySlug: "johannesburg" },
        ],
      },
      {
        slug: "italian-grand-prix-2026-09-07",
        venues: [],
      },
    ];

    const cpt = filterFixturesByCity(fixtures, "cpt");
    assert.deepEqual(
      cpt.map((item) => item.slug),
      [nowSlug, "italian-grand-prix-2026-09-07"],
    );

    const all = filterFixturesByCity(fixtures, null);
    assert.equal(all.length, 3);
  });

  it("returns the unfiltered list for All cities", () => {
    const fixtures = [{ slug: "a", venues: [{ slug: "x", city: "Durban" }] }];
    assert.equal(filterFixturesByCity(fixtures, null).length, 1);
  });
});

describe("eventsCityLabel", () => {
  it("labels metro codes for UI copy", () => {
    assert.equal(eventsCityLabel("cpt"), "Cape Town");
    assert.equal(eventsCityLabel("jhb"), "Johannesburg");
    assert.equal(eventsCityLabel("dbn"), "Durban");
    assert.equal(eventsCityLabel("pta"), "Pretoria");
    assert.equal(eventsCityLabel(null), null);
  });
});

describe("detectEventsCityFromText", () => {
  it("reads the first metro named in copy", () => {
    assert.equal(
      detectEventsCityFromText("Where to Watch in Joburg"),
      "jhb",
    );
    assert.equal(
      detectEventsCityFromText("Springboks Test in Cape Town this Saturday"),
      "cpt",
    );
    assert.equal(detectEventsCityFromText("Durban night market"), "dbn");
    assert.equal(detectEventsCityFromText(""), null);
    assert.equal(detectEventsCityFromText("Sandton pubs fill early"), null);
  });
});
