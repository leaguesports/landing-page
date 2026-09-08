import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canManageVenueScreenings,
  isEmptyOwnerId,
  screeningDocumentItems,
  validateScreeningsPayload,
} from "./screening-editor.ts";

describe("canManageVenueScreenings", () => {
  it("is true only for the matching owner on claimed or claim_pending", () => {
    assert.equal(
      canManageVenueScreenings({
        claim_status: "claimed",
        claimedByUserId: "user-1",
        sessionUserId: "user-1",
      }),
      true,
    );
    assert.equal(
      canManageVenueScreenings({
        claim_status: "claim_pending",
        claimedByUserId: "user-1",
        sessionUserId: "user-1",
      }),
      true,
    );
  });

  it("is false when unsigned, mismatched, or unclaimed", () => {
    assert.equal(
      canManageVenueScreenings({
        claim_status: "claimed",
        claimedByUserId: "user-1",
        sessionUserId: "",
      }),
      false,
    );
    assert.equal(
      canManageVenueScreenings({
        claim_status: "claimed",
        claimedByUserId: "user-1",
        sessionUserId: null,
      }),
      false,
    );
    assert.equal(
      canManageVenueScreenings({
        claim_status: "claimed",
        claimedByUserId: "owner",
        sessionUserId: "other",
      }),
      false,
    );
    assert.equal(
      canManageVenueScreenings({
        claim_status: "unclaimed",
        claimedByUserId: "user-1",
        sessionUserId: "user-1",
      }),
      false,
    );
    assert.equal(
      canManageVenueScreenings({
        claim_status: "claimed",
        claimedByUserId: "",
        sessionUserId: "user-1",
      }),
      false,
    );
    assert.equal(
      canManageVenueScreenings({
        claim_status: null,
        claimedByUserId: "user-1",
        sessionUserId: "user-1",
      }),
      false,
    );
  });
});

describe("isEmptyOwnerId", () => {
  it("treats blank claimedByUserId as empty so claim can stamp the session user", () => {
    assert.equal(isEmptyOwnerId(null), true);
    assert.equal(isEmptyOwnerId(""), true);
    assert.equal(isEmptyOwnerId("  "), true);
    assert.equal(isEmptyOwnerId("user-1"), false);
  });
});

describe("validateScreeningsPayload", () => {
  it("accepts a valid screening list and normalizes ISO startsAt", () => {
    const result = validateScreeningsPayload({
      screenings: [
        {
          title: "Springboks vs All Blacks",
          startsAt: "2026-09-06T16:00:00.000Z",
          fixtureSlug: "springboks-vs-all-blacks-2026-09-06",
          setupTags: ["Big screen", "Specials"],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.screenings.length, 1);
    assert.equal(result.screenings[0]?.title, "Springboks vs All Blacks");
    assert.equal(result.screenings[0]?.startsAt, "2026-09-06T16:00:00.000Z");
    assert.equal(
      result.screenings[0]?.fixtureSlug,
      "springboks-vs-all-blacks-2026-09-06",
    );
    assert.deepEqual(result.screenings[0]?.setupTags, ["Big screen", "Specials"]);
  });

  it("accepts an empty screenings array", () => {
    const result = validateScreeningsPayload({ screenings: [] });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.screenings, []);
  });

  it("rejects short titles, unparseable kickoff, and bad fixture slugs", () => {
    assert.equal(
      validateScreeningsPayload({
        screenings: [{ title: "A", startsAt: "2026-09-06T16:00:00.000Z" }],
      }).ok,
      false,
    );
    assert.equal(
      validateScreeningsPayload({
        screenings: [
          { title: "Springboks vs All Blacks", startsAt: "kickoff Saturday" },
        ],
      }).ok,
      false,
    );
    assert.equal(
      validateScreeningsPayload({
        screenings: [
          {
            title: "Springboks vs All Blacks",
            startsAt: "2026-09-06T16:00:00.000Z",
            fixtureSlug: "Springboks vs All Blacks",
          },
        ],
      }).ok,
      false,
    );
    assert.equal(
      validateScreeningsPayload({
        screenings: [
          {
            title: "Springboks vs All Blacks",
            startsAt: "2026-09-06T16:00:00.000Z",
            fixtureSlug: "not_a_slug",
          },
        ],
      }).ok,
      false,
    );
  });

  it("treats empty fixtureSlug as omitted and lowercases a valid slug", () => {
    const mixed = validateScreeningsPayload({
      screenings: [
        {
          title: "Italian Grand Prix",
          startsAt: "2026-09-07T13:00:00.000Z",
          fixtureSlug: "  Italian-Grand-Prix  ",
        },
      ],
    });
    assert.equal(mixed.ok, true);
    if (!mixed.ok) return;
    assert.equal(mixed.screenings[0]?.fixtureSlug, "italian-grand-prix");

    const emptySlug = validateScreeningsPayload({
      screenings: [
        {
          title: "Italian Grand Prix",
          startsAt: "2026-09-07T13:00:00.000Z",
          fixtureSlug: "   ",
        },
      ],
    });
    assert.equal(emptySlug.ok, true);
    if (!emptySlug.ok) return;
    assert.equal(emptySlug.screenings[0]?.fixtureSlug, undefined);
  });

  it("caps setup tags at 8 items and 32 chars each", () => {
    assert.equal(
      validateScreeningsPayload({
        screenings: [
          {
            title: "Derby",
            startsAt: "2026-09-06T16:00:00.000Z",
            setupTags: Array.from({ length: 9 }, (_, i) => `tag-${i}`),
          },
        ],
      }).ok,
      false,
    );
    assert.equal(
      validateScreeningsPayload({
        screenings: [
          {
            title: "Derby",
            startsAt: "2026-09-06T16:00:00.000Z",
            setupTags: ["x".repeat(33)],
          },
        ],
      }).ok,
      false,
    );
    const ok = validateScreeningsPayload({
      screenings: [
        {
          title: "Derby",
          startsAt: "2026-09-06T16:00:00.000Z",
          setupTags: ["Big screen", "  ", "Specials"],
        },
      ],
    });
    assert.equal(ok.ok, true);
    if (!ok.ok) return;
    assert.deepEqual(ok.screenings[0]?.setupTags, ["Big screen", "Specials"]);
  });

  it("rejects a missing screenings array", () => {
    assert.equal(validateScreeningsPayload({}).ok, false);
    assert.equal(validateScreeningsPayload(null).ok, false);
  });
});

describe("screeningDocumentItems", () => {
  it("assigns Sanity _key/_type for a replace patch", () => {
    const items = screeningDocumentItems([
      {
        title: "Springboks vs All Blacks",
        startsAt: "2026-09-06T16:00:00.000Z",
        fixtureSlug: "springboks-vs-all-blacks-2026-09-06",
      },
    ]);
    assert.equal(items.length, 1);
    assert.equal(items[0]?._type, "screening");
    assert.equal(typeof items[0]?._key, "string");
    assert.ok((items[0]?._key ?? "").length >= 8);
    assert.equal(items[0]?.title, "Springboks vs All Blacks");
    assert.equal(
      items[0]?.fixtureSlug,
      "springboks-vs-all-blacks-2026-09-06",
    );
  });
});
