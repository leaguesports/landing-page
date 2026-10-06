import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapVenueGallery, VENUE_GALLERY_LIMIT } from "./gallery.ts";

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
