import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectFeaturedHomeVenues } from "./featured-home.ts";

const hero = { asset: { _ref: "image-hero-1600x900-jpg" } };
const gallery = [{ image: { _id: "image-gallery-1600x900-jpg" }, alt: "Courts" }];
const sports = [{ image: { asset: { _ref: "image-sport-800x800-jpg" } } }];

function venue(
  slug: string,
  photo: "hero" | "gallery" | "sport" | "none",
) {
  return {
    slug,
    hero_image: photo === "hero" ? hero : null,
    gallery: photo === "gallery" ? gallery : [],
    sports: photo === "sport" ? sports : [],
  };
}

describe("selectFeaturedHomeVenues", () => {
  it("keeps hero and gallery photos and drops sport artwork", () => {
    const selected = selectFeaturedHomeVenues([
      venue("with-hero", "hero"),
      venue("sport-only", "sport"),
      venue("with-gallery", "gallery"),
      venue("plain", "none"),
      venue("another", "hero"),
    ]);
    assert.deepEqual(
      selected.map((item) => item.slug),
      ["with-hero", "with-gallery", "another"],
    );
  });

  it("returns nothing when fewer than three venues have a photo", () => {
    assert.deepEqual(
      selectFeaturedHomeVenues([
        venue("a", "hero"),
        venue("b", "gallery"),
        venue("c", "sport"),
      ]),
      [],
    );
  });

  it("caps the row at eight and skips a repeated slug", () => {
    const rows = [
      venue("a", "hero"),
      venue("a", "gallery"),
      ...["b", "c", "d", "e", "f", "g", "h", "i"].map((slug) =>
        venue(slug, "hero"),
      ),
    ];
    const selected = selectFeaturedHomeVenues(rows);
    assert.equal(selected.length, 8);
    assert.equal(selected[0]?.slug, "a");
    assert.equal(selected.filter((item) => item.slug === "a").length, 1);
    assert.equal(selected.some((item) => item.slug === "i"), false);
  });
});
