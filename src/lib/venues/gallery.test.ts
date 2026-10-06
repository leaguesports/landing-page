import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapVenueGallery,
  scoreboardHeroImage,
  VENUE_GALLERY_LIMIT,
} from "./gallery.ts";

describe("mapVenueGallery", () => {
  it("keeps alt and credit and drops tiles without them", () => {
    const items = mapVenueGallery([
      {
        alt: "Centre court",
        credit: "RB Club",
        asset: { _id: "image-court-1600x1000-jpg" },
      },
      { alt: "   ", asset: { _id: "image-blank" } },
      { alt: "No asset" },
      { credit: "Missing alt", asset: { _id: "image-no-alt" } },
      null,
    ]);
    assert.deepEqual(items, [
      {
        image: { _id: "image-court-1600x1000-jpg" },
        alt: "Centre court",
        credit: "RB Club",
      },
    ]);
  });

  it("caps the strip at eight tiles", () => {
    const items = mapVenueGallery(
      Array.from({ length: 10 }, (_, index) => ({
        alt: `Frame ${index + 1}`,
        asset: { _id: `image-${index}` },
      })),
    );
    assert.equal(items.length, VENUE_GALLERY_LIMIT);
    assert.equal(items[0]?.alt, "Frame 1");
    assert.equal(items[7]?.alt, "Frame 8");
  });

  it("returns nothing when gallery is missing", () => {
    assert.deepEqual(mapVenueGallery(undefined), []);
    assert.deepEqual(mapVenueGallery(null), []);
  });
});

describe("scoreboardHeroImage", () => {
  const hero = { asset: { _ref: "image-hero-1600x900-jpg" } };
  const gallery = [{ image: { _id: "image-gallery-1600x900-jpg" }, alt: "Club" }];
  const sports = [{ image: { asset: { _ref: "image-sport-800x800-jpg" } } }];

  it("uses hero_image ahead of the gallery", () => {
    assert.equal(
      scoreboardHeroImage({ hero_image: hero, gallery, sports }),
      hero,
    );
  });

  it("falls back to gallery[0] and ignores sport art", () => {
    assert.deepEqual(
      scoreboardHeroImage({ hero_image: null, gallery, sports }),
      gallery[0]?.image,
    );
    assert.equal(
      scoreboardHeroImage({ hero_image: {}, gallery: [], sports }),
      null,
    );
  });
});
