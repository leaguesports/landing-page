import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chooseGuideVenueMediaRows, guideVenueCardVisual } from "./venueMedia.ts";

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

describe("guideVenueCardVisual", () => {
  it("uses a quiet initial when the only media is coordinates", () => {
    const visual = guideVenueCardVisual({
      name: "Hog's Head",
      suburb: "Illovo",
      media: {
        photoUrl: null,
        latitude: -26.13,
        longitude: 28.05,
      },
    });
    assert.equal(visual.kind, "placeholder");
    assert.equal(visual.initial, "I");
  });

  it("keeps a real photo as a thumb and still ignores the pin", () => {
    const visual = guideVenueCardVisual({
      name: "Bench Warmers",
      suburb: "Rosebank",
      media: {
        photoUrl: "https://cdn.sanity.io/images/example/hero.jpg",
        latitude: -26.14,
        longitude: 28.04,
      },
    });
    assert.deepEqual(visual, {
      kind: "photo",
      src: "https://cdn.sanity.io/images/example/hero.jpg",
      initial: "R",
    });
  });

  it("falls back to the venue name when the suburb is blank", () => {
    const visual = guideVenueCardVisual({
      name: "Cesco's",
      suburb: "",
      media: null,
    });
    assert.equal(visual.kind, "placeholder");
    assert.equal(visual.initial, "C");
  });
});
