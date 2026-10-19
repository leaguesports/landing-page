import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LAST_PADEL_VENUE_SLUG_KEY } from "./quick-start-defaults.ts";
import {
  CAPTURE_VENUE_LIST_LIMIT,
  orderCaptureVenues,
} from "./venue-select.ts";
import type { VenueOption } from "./venue-options.ts";

function court(
  partial: Partial<VenueOption> & Pick<VenueOption, "slug">,
): VenueOption {
  return {
    id: partial.id ?? `id-${partial.slug}`,
    slug: partial.slug,
    name: partial.name ?? partial.slug,
    suburb: partial.suburb ?? "",
    city: partial.city ?? "",
    latitude: partial.latitude ?? null,
    longitude: partial.longitude ?? null,
    sports: partial.sports ?? ["padel"],
  };
}

describe("orderCaptureVenues", () => {
  it("keeps directory order and caps the list like the inline picker", () => {
    const venues = Array.from({ length: 30 }, (_, index) =>
      court({ slug: `court-${index}`, name: `Court ${index}` }),
    );
    const ordered = orderCaptureVenues(venues);
    assert.equal(CAPTURE_VENUE_LIST_LIMIT, 24);
    assert.equal(ordered.length, 24);
    assert.equal(ordered[0]?.slug, "court-0");
    assert.equal(ordered[23]?.slug, "court-23");
    assert.deepEqual(
      venues.map((venue) => venue.slug),
      Array.from({ length: 30 }, (_, index) => `court-${index}`),
    );
  });

  it("filters with the shared venue name query", () => {
    const venues = [
      court({
        slug: "jozi-padel",
        name: "Jozi Padel",
        suburb: "Magaliessig",
        city: "Johannesburg",
      }),
      court({
        slug: "old-park",
        name: "Old Parktonian",
        suburb: "Bordeaux",
        city: "Johannesburg",
      }),
    ];
    const ordered = orderCaptureVenues(venues, { query: "magaliessig" });
    assert.deepEqual(
      ordered.map((venue) => venue.slug),
      ["jozi-padel"],
    );
  });

  it("sorts by distance when coordinates are available", () => {
    const near = court({
      slug: "near",
      latitude: -26.2,
      longitude: 28.05,
    });
    const far = court({
      slug: "far",
      latitude: -33.9,
      longitude: 18.4,
    });
    const unknown = court({ slug: "unknown" });
    const ordered = orderCaptureVenues([far, unknown, near], {
      coords: { latitude: -26.2, longitude: 28.04 },
    });
    assert.deepEqual(
      ordered.map((venue) => venue.slug),
      ["near", "far", "unknown"],
    );
  });

  it(`pins ${LAST_PADEL_VENUE_SLUG_KEY} at the top when that court is in the directory`, () => {
    const venues = [
      court({ slug: "first", latitude: -26.2, longitude: 28.04 }),
      court({ slug: "last-played", latitude: -33.9, longitude: 18.4 }),
      court({ slug: "other", latitude: -26.21, longitude: 28.05 }),
    ];
    const ordered = orderCaptureVenues(venues, {
      coords: { latitude: -26.2, longitude: 28.04 },
      pinnedSlug: "Last-Played",
    });
    assert.deepEqual(
      ordered.map((venue) => venue.slug),
      ["last-played", "first", "other"],
    );
  });

  it("does not invent a pinned court that the search filtered out", () => {
    const venues = [
      court({ slug: "last-played", name: "Last Club", city: "Pretoria" }),
      court({ slug: "jozi", name: "Jozi Padel", city: "Johannesburg" }),
    ];
    const ordered = orderCaptureVenues(venues, {
      query: "johannesburg",
      pinnedSlug: "last-played",
    });
    assert.deepEqual(
      ordered.map((venue) => venue.slug),
      ["jozi"],
    );
  });

  it("keeps a pinned court inside the cap even when distance would drop it", () => {
    const venues = Array.from({ length: 25 }, (_, index) =>
      court({
        slug: `court-${index}`,
        latitude: -26.2,
        longitude: 28 + index * 0.2,
      }),
    );
    const ordered = orderCaptureVenues(venues, {
      coords: { latitude: -26.2, longitude: 28 },
      pinnedSlug: "court-24",
    });
    assert.equal(ordered.length, 24);
    assert.equal(ordered[0]?.slug, "court-24");
    assert.equal(
      ordered.some((venue) => venue.slug === "court-23"),
      false,
    );
  });
});
