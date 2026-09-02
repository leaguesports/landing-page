import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createImageUrlBuilder } from "@sanity/image-url";
import {
  isUsableSanityImageSource,
  safeSanityImageUrl,
  urlFor,
} from "./sanity-image.ts";

describe("isUsableSanityImageSource", () => {
  it("rejects null, undefined, and empty objects", () => {
    assert.equal(isUsableSanityImageSource(null), false);
    assert.equal(isUsableSanityImageSource(undefined), false);
    assert.equal(isUsableSanityImageSource({}), false);
    assert.equal(isUsableSanityImageSource({ _type: "image" }), false);
    assert.equal(isUsableSanityImageSource({ asset: null }), false);
  });

  it("accepts a Sanity image with an asset reference", () => {
    assert.equal(
      isUsableSanityImageSource({
        _type: "image",
        asset: { _type: "reference", _ref: "image-abc-1200x800-jpg" },
      }),
      true,
    );
  });
});

describe("safeSanityImageUrl", () => {
  it("does not throw when mainImage is empty", () => {
    assert.equal(safeSanityImageUrl(null), undefined);
    assert.equal(safeSanityImageUrl(undefined), undefined);
    assert.equal(safeSanityImageUrl({ _type: "image" }), undefined);
  });
});

describe("urlFor", () => {
  it("returns null instead of a builder when the source is missing", () => {
    assert.equal(urlFor(null), null);
    assert.equal(urlFor(undefined), null);
    assert.equal(urlFor(null)?.url(), undefined);
  });
});

describe("sanity image-url (root cause)", () => {
  it("throws on null source when .url() is called without a guard", () => {
    const builder = createImageUrlBuilder({
      projectId: "project",
      dataset: "production",
    });
    assert.throws(
      () => builder.image(null as never).url(),
      /Unable to resolve image URL from source/,
    );
  });
});
