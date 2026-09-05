import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { venueChipLocationSlug, venueIntentChipHref } from "./chips.ts";

const claremont = { suburb: "Claremont", city: "Cape Town" };

describe("venueChipLocationSlug", () => {
  it("prefers suburb over city", () => {
    assert.equal(venueChipLocationSlug(claremont), "claremont");
  });

  it("uses the city when suburb is missing", () => {
    assert.equal(
      venueChipLocationSlug({ suburb: "", city: "Cape Town" }),
      "cape-town",
    );
  });
});

describe("venueIntentChipHref", () => {
  it("builds Watch chips as /venues?intent=watch&sport=&location=", () => {
    assert.equal(
      venueIntentChipHref("watch", "soccer", claremont),
      "/venues?intent=watch&sport=soccer&location=claremont",
    );
  });

  it("builds Play chips as /venues?intent=play&sport=&location=", () => {
    assert.equal(
      venueIntentChipHref("play", "padel", {
        suburb: "Sandton",
        city: "Johannesburg",
      }),
      "/venues?intent=play&sport=padel&location=sandton",
    );
  });

  it("falls back to the sport filter when there is no location", () => {
    assert.equal(
      venueIntentChipHref("watch", "soccer", { suburb: "", city: "" }),
      "/venues?intent=watch&sport=soccer",
    );
  });

  it("returns null when the sport has no slug", () => {
    assert.equal(venueIntentChipHref("play", "", claremont), null);
    assert.equal(venueIntentChipHref("play", undefined, claremont), null);
  });
});
