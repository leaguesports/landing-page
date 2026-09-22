import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chooseGuideVenueMediaRows } from "./venueMedia.ts";

describe("chooseGuideVenueMediaRows", () => {
  it("dedupes a slug and prefers a row with coordinates", () => {
    const chosen = chooseGuideVenueMediaRows([
      { slug: "cescos-randburg", suburb: "Strydompark" },
      {
        slug: "cescos-randburg",
        suburb: "Strydompark",
        latitude: -26.1,
        longitude: 28.0,
      },
      { slug: "the-troyeville", latitude: -26.2, longitude: 28.06, suburb: "Troyeville" },
    ]);
    assert.equal(chosen.size, 2);
    assert.equal(chosen.get("cescos-randburg")?.latitude, -26.1);
    assert.equal(chosen.get("the-troyeville")?.suburb, "Troyeville");
  });

  it("keeps the first row when neither duplicate has a photo or a pin", () => {
    const chosen = chooseGuideVenueMediaRows([
      { slug: "the-baron-sandton", suburb: "Glenadrienne" },
      { slug: "the-baron-sandton", suburb: "Other" },
    ]);
    assert.equal(chosen.get("the-baron-sandton")?.suburb, "Glenadrienne");
  });
});
