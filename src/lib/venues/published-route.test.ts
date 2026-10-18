import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  metadataForMissingVenue,
  resolvePublishedVenueRoute,
} from "./published-route.ts";

describe("published venue notFound path", () => {
  it("selects not-found when Sanity returns no published venue", () => {
    assert.deepEqual(resolvePublishedVenueRoute(null), { kind: "not-found" });
    assert.deepEqual(resolvePublishedVenueRoute(undefined), {
      kind: "not-found",
    });
    assert.deepEqual(resolvePublishedVenueRoute({ slug: "" }), {
      kind: "not-found",
    });
  });

  it("keeps a published venue on the render path", () => {
    const venue = { slug: "bryanston-sports-club", name: "Bryanston Sports Club" };
    assert.deepEqual(resolvePublishedVenueRoute(venue), {
      kind: "found",
      venue,
    });
  });

  it("generateMetadata can describe a missing venue without throwing", () => {
    for (const slug of [
      "not-a-real-venue",
      "bryanston-sports-club-bowls",
      "drafts.unpublished-venue",
    ]) {
      const metadata = metadataForMissingVenue(slug);
      assert.equal(typeof metadata.title, "string");
      assert.ok(metadata.title.length > 0);
      assert.deepEqual(metadata.robots, { index: false, follow: false });
    }
  });
});
