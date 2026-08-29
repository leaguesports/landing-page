import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { venueChipLocationSlug, venueIntentChipHref } from "./chips";

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
  it("builds Watch chips as /watch/{sport}/{location}", () => {
    assert.equal(
      venueIntentChipHref("watch", "soccer", claremont),
      "/watch/soccer/claremont",
    );
  });

  it("builds Play chips as /play/{sport}/{location}", () => {
    assert.equal(
      venueIntentChipHref("play", "padel", {
        suburb: "Sandton",
        city: "Johannesburg",
      }),
      "/play/padel/sandton",
    );
  });

  it("falls back to the sport hub when there is no location", () => {
    assert.equal(
      venueIntentChipHref("watch", "soccer", { suburb: "", city: "" }),
      "/watch/soccer",
    );
  });

  it("returns null when the sport has no slug", () => {
    assert.equal(venueIntentChipHref("play", "", claremont), null);
    assert.equal(venueIntentChipHref("play", undefined, claremont), null);
  });
});
