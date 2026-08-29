import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPadelSportLabel,
  isPadelVenue,
  toVenueOption,
  type VenueOption,
} from "./venue-options.ts";

function option(partial: Partial<VenueOption> & Pick<VenueOption, "sports">): VenueOption {
  return {
    id: "v1",
    slug: "court",
    name: "Padel Court",
    suburb: "Sandton",
    city: "Johannesburg",
    latitude: null,
    longitude: null,
    ...partial,
  };
}

describe("isPadelSportLabel", () => {
  it("accepts padel and the paddle alias", () => {
    assert.equal(isPadelSportLabel("Padel"), true);
    assert.equal(isPadelSportLabel("paddle"), true);
  });

  it("rejects tennis, racket, and watch sports", () => {
    assert.equal(isPadelSportLabel("tennis"), false);
    assert.equal(isPadelSportLabel("racket"), false);
    assert.equal(isPadelSportLabel("rugby"), false);
    assert.equal(isPadelSportLabel("soccer"), false);
  });
});

describe("isPadelVenue", () => {
  it("is true only when Play sports include padel", () => {
    assert.equal(isPadelVenue(option({ sports: ["padel"] })), true);
    assert.equal(isPadelVenue(option({ sports: ["tennis", "padel"] })), true);
  });

  it("does not treat tennis or racket as padel", () => {
    assert.equal(isPadelVenue(option({ sports: ["tennis"] })), false);
    assert.equal(isPadelVenue(option({ sports: ["racket"] })), false);
    assert.equal(isPadelVenue(option({ sports: ["tennis", "racket"] })), false);
  });

  it("excludes sports bars that only watch sport (no padel in sports)", () => {
    const bars = [
      "Ridgeway",
      "Benchwarmers",
      "Golf Bar",
      "Tigers Milk",
      "Time Out",
    ];
    for (const name of bars) {
      assert.equal(
        isPadelVenue(option({ name, sports: ["rugby", "soccer"] })),
        false,
        name,
      );
    }
  });
});

describe("toVenueOption", () => {
  it("uses Sanity _id and Play sports names/slugs, not broadcasts", () => {
    const venue = {
      _id: "sanity-padel-1",
      name: "Padel Social Club",
      slug: "padel-social-club",
      address: {
        street: "",
        suburb: "Sandton",
        city: "Johannesburg",
        province: "",
        postcode: "",
        country: "",
      },
      sports: [
        { _id: "s1", name: "Padel", slug: "padel", image: undefined },
        { _id: "s2", name: "Tennis", slug: "tennis", image: undefined },
      ],
      broadcasts: [{ _id: "b1", name: "Rugby", slug: "rugby" }],
      description: [],
    };

    const mapped = toVenueOption(
      venue as Parameters<typeof toVenueOption>[0],
    );
    assert.equal(mapped.id, "sanity-padel-1");
    assert.equal(mapped.sports.includes("padel"), true);
    assert.equal(mapped.sports.includes("tennis"), true);
    assert.equal(mapped.sports.includes("rugby"), false);
    assert.equal(isPadelVenue(mapped), true);
  });
});
