import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapVenueRow,
  VENUE_PROJECTION,
  type VenueRow,
} from "./venueQuery";

describe("VENUE_PROJECTION", () => {
  it("requests the targeted schema fields the site uses", () => {
    const required = [
      "hero_image",
      "latitude",
      "longitude",
      "amenities.has_generator_backup",
      "contact.phone",
      "contactInfo.phone",
      "claim_status",
      "upcoming_screenings",
      "broadcasts",
      "sports",
      "isVerified",
      "is_verified",
    ];
    for (const field of required) {
      assert.match(VENUE_PROJECTION, new RegExp(field.replace(".", "\\.")));
    }
  });

  it("does not request unused or undeclared CMS fields", () => {
    const forbidden = [
      "crowdLevel",
      "metadata",
      "ogImage",
      "ogTitle",
      "updated_at",
      "claim_request",
    ];
    for (const field of forbidden) {
      assert.doesNotMatch(
        VENUE_PROJECTION,
        new RegExp(`\\b${field}\\b`),
        `GROQ should not request ${field}`,
      );
    }
  });

  it("keeps watch/play as broadcasts/sports in the data layer", () => {
    assert.match(VENUE_PROJECTION, /"broadcasts": broadcasts\[\]->/);
    assert.match(VENUE_PROJECTION, /"sports": sports\[\]->/);
    assert.match(VENUE_PROJECTION, /"slug": slug\.current/);
  });
});

describe("mapVenueRow", () => {
  const base: VenueRow = {
    _id: "v1",
    name: "Test Bar",
    slug: "test-bar",
    description: [{ _type: "block" }],
    address: {
      street: "1 Main",
      suburb: "Claremont",
      city: "Cape Town",
      province: "WC",
      postcode: "7708",
      country: "ZA",
    },
    sports: [],
    broadcasts: [{ _id: "s1", name: "Football", slug: "football" }],
  };

  it("drops rows without a slug", () => {
    assert.equal(mapVenueRow({ ...base, slug: null }), null);
  });

  it("prefers WhatsApp over phone for the contact CTA", () => {
    const venue = mapVenueRow({
      ...base,
      phone: "0211234567",
      whatsapp: "0820000000",
    });
    assert.equal(venue?.phone, "0820000000");
  });

  it("normalizes missing portable-text description to an empty array", () => {
    const venue = mapVenueRow({ ...base, description: null });
    assert.deepEqual(venue?.description, []);
  });
});
