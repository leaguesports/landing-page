import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasVenueCoordinates,
  mapVenueRow,
  resolveVenueImage,
  sportSlugVariants,
  VENUE_IN_LOCATION,
  VENUE_PLACEHOLDER_IMAGE,
  VENUE_PROJECTION,
  type VenueRow,
} from "./venueQuery.ts";

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
      "heroImage",
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

  it("projects sport slugs for Watch and Play chips", () => {
    assert.match(
      VENUE_PROJECTION,
      /"sports": sports\[\]-> \{[\s\S]*?"slug": slug\.current/,
    );
    assert.match(
      VENUE_PROJECTION,
      /"broadcasts": broadcasts\[\]-> \{[\s\S]*?"slug": slug\.current/,
    );
  });

  it("maps is_verified with defined() so false does not clobber isVerified", () => {
    assert.match(
      VENUE_PROJECTION,
      /select\(defined\(is_verified\) => is_verified, isVerified\)/,
    );
    assert.doesNotMatch(VENUE_PROJECTION, /coalesce\(is_verified/);
  });

  it("coalesces top-level whatsapp like phone (CMS fieldsets are not objects)", () => {
    assert.match(
      VENUE_PROJECTION,
      /"whatsapp": coalesce\(contact\.whatsapp, contactInfo\.whatsapp, whatsapp\)/,
    );
    assert.match(
      VENUE_PROJECTION,
      /"phone": coalesce\(contact\.phone, contactInfo\.phone, phone\)/,
    );
  });

  it("locks the venue photo field name to hero_image only", () => {
    assert.match(VENUE_PROJECTION, /\bhero_image\b/);
    assert.doesNotMatch(VENUE_PROJECTION, /heroImage/);
    assert.doesNotMatch(VENUE_PROJECTION, /coalesce\(hero_image/);
    assert.match(VENUE_PROJECTION, /"sports": sports\[\]-> \{[\s\S]*?\bimage\b/);
  });

  it("projects golfCourse scorecard fields for round start", () => {
    assert.match(VENUE_PROJECTION, /golfCourse\{/);
    assert.match(VENUE_PROJECTION, /courseName/);
    assert.match(VENUE_PROJECTION, /strokeIndex/);
    assert.match(VENUE_PROJECTION, /totalMeters/);
  });
});

describe("sportSlugVariants", () => {
  it("expands soccer/football for GROQ", () => {
    assert.deepEqual(sportSlugVariants("soccer"), ["soccer", "football"]);
    assert.deepEqual(sportSlugVariants("football"), ["soccer", "football"]);
    assert.deepEqual(sportSlugVariants("padel"), ["padel", "paddle"]);
    assert.deepEqual(sportSlugVariants("karting"), ["karting", "go-karting"]);
    assert.deepEqual(sportSlugVariants("go-karting"), ["karting", "go-karting"]);
    assert.deepEqual(sportSlugVariants("rugby"), ["rugby"]);
  });
});

describe("resolveVenueImage", () => {
  const hero = { _type: "image", asset: { _ref: "image-hero" } };
  const sportImage = { _type: "image", asset: { _ref: "image-padel" } };
  const padel = {
    _id: "sport-padel",
    name: "Padel",
    slug: "padel",
    image: sportImage,
  };

  it("returns hero_image and ignores other photo names", () => {
    assert.equal(resolveVenueImage({ hero_image: hero }), hero);
    assert.equal(resolveVenueImage({ hero_image: null }), undefined);
    assert.equal(resolveVenueImage({}), undefined);
  });

  it("falls back to the first Play sport image when hero_image is missing", () => {
    assert.equal(
      resolveVenueImage({ hero_image: null, sports: [padel] }),
      sportImage,
    );
    assert.equal(
      resolveVenueImage({ hero_image: hero, sports: [padel] }),
      hero,
    );
    assert.equal(
      resolveVenueImage({
        hero_image: null,
        sports: [{ ...padel, image: undefined }],
      }),
      undefined,
    );
  });

  it("skips empty image objects without an asset", () => {
    assert.equal(
      resolveVenueImage({
        hero_image: { _type: "image" },
        sports: [{ ...padel, image: { _type: "image" } }],
      }),
      undefined,
    );
  });

  it("uses a same-origin placeholder host, not Astratic or Unsplash", () => {
    assert.equal(VENUE_PLACEHOLDER_IMAGE.startsWith("/"), true);
    assert.doesNotMatch(VENUE_PLACEHOLDER_IMAGE, /astratic|unsplash/i);
  });
});

describe("VENUE_IN_LOCATION", () => {
  it("matches address suburb/city and the location reference", () => {
    assert.match(VENUE_IN_LOCATION, /address\.suburb->slug\.current == \$location/);
    assert.match(VENUE_IN_LOCATION, /address\.city->slug\.current == \$location/);
    assert.match(VENUE_IN_LOCATION, /location->slug\.current == \$location/);
  });
});

describe("hasVenueCoordinates", () => {
  it("is true only for finite venue lat/lng", () => {
    assert.equal(
      hasVenueCoordinates({ latitude: -33.98, longitude: 18.46 }),
      true,
    );
    assert.equal(hasVenueCoordinates({ latitude: -33.98, longitude: null }), false);
    assert.equal(hasVenueCoordinates({}), false);
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

  it("maps golfCourse when present", () => {
    const venue = mapVenueRow({
      ...base,
      golfCourse: {
        courseName: "East",
        holesTotal: 18,
        parTotal: 72,
        holes: [{ number: 1, par: 4, strokeIndex: 7 }],
        tees: [{ name: "Club" }],
      },
    });
    assert.equal(venue?.golfCourse?.courseName, "East");
    assert.equal(venue?.golfCourse?.holes?.[0]?.strokeIndex, 7);
  });
});
