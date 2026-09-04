import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDemoGuestSlots,
  findVenueBySlug,
  playerFromInitialSelf,
  resolveInitialQuickStartSlots,
  seatSelfInA1IfNeeded,
  selectDefaultPadelVenue,
} from "./quick-start-defaults.ts";
import { makeGuestPlayer, makeUserPlayer } from "./recent-players.ts";
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

describe("findVenueBySlug", () => {
  const venues = [court({ slug: "Alpha-Court" }), court({ slug: "beta" })];

  it("matches case-insensitively and trims", () => {
    assert.equal(findVenueBySlug(venues, "  alpha-court  ")?.slug, "Alpha-Court");
  });

  it("returns null for missing or blank slug", () => {
    assert.equal(findVenueBySlug(venues, "missing"), null);
    assert.equal(findVenueBySlug(venues, "  "), null);
    assert.equal(findVenueBySlug(venues, null), null);
  });
});

describe("selectDefaultPadelVenue", () => {
  const venues = [
    court({ slug: "first-court" }),
    court({ slug: "last-used-court" }),
    court({ slug: "locked-court" }),
  ];

  it("returns null when the directory is empty", () => {
    assert.equal(
      selectDefaultPadelVenue([], {
        initialVenueSlug: "anything",
        lastUsedSlug: "anything",
      }),
      null,
    );
  });

  it("prefers the locked/initial venue slug", () => {
    assert.equal(
      selectDefaultPadelVenue(venues, {
        initialVenueSlug: "locked-court",
        lastUsedSlug: "last-used-court",
      })?.slug,
      "locked-court",
    );
  });

  it("prefers last-used when present in the directory", () => {
    assert.equal(
      selectDefaultPadelVenue(venues, {
        lastUsedSlug: "last-used-court",
      })?.slug,
      "last-used-court",
    );
  });

  it("falls back to the first court when last-used is missing", () => {
    assert.equal(
      selectDefaultPadelVenue(venues, {
        lastUsedSlug: "retired-court",
      })?.slug,
      "first-court",
    );
    assert.equal(selectDefaultPadelVenue(venues)?.slug, "first-court");
  });
});

describe("buildDemoGuestSlots", () => {
  it("fills all four seats with guests when signed out", () => {
    const slots = buildDemoGuestSlots(null);
    assert.equal(slots.a1.isGuest, true);
    assert.match(slots.a1.displayName, /Alex/i);
    assert.match(slots.a2.displayName, /Sam/i);
    assert.match(slots.b1.displayName, /Jordan/i);
    assert.match(slots.b2.displayName, /Riley/i);
  });

  it("seats the signed-in user in A1 and guests elsewhere", () => {
    const self = makeUserPlayer({
      id: "u1",
      displayName: "Pat",
      userId: "u1",
    });
    const slots = buildDemoGuestSlots(self);
    assert.equal(slots.a1.userId, "u1");
    assert.equal(slots.a1.isGuest, false);
    assert.equal(slots.a2.isGuest, true);
    assert.equal(slots.b1.isGuest, true);
    assert.equal(slots.b2.isGuest, true);
  });
});

describe("seatSelfInA1IfNeeded", () => {
  it("puts self in A1 when not already seated", () => {
    const self = makeUserPlayer({
      id: "u1",
      displayName: "Pat",
      userId: "u1",
    });
    const slots = {
      a1: makeGuestPlayer("Alex"),
      a2: makeGuestPlayer("Sam"),
      b1: makeGuestPlayer("Jordan"),
      b2: makeGuestPlayer("Riley"),
    };
    const next = seatSelfInA1IfNeeded(slots, self);
    assert.equal(next.a1?.userId, "u1");
    assert.equal(next.a2?.displayName, slots.a2.displayName);
  });

  it("does not move self when already seated in another slot", () => {
    const self = makeUserPlayer({
      id: "u1",
      displayName: "Pat",
      userId: "u1",
    });
    const slots = {
      a1: makeGuestPlayer("Alex"),
      a2: self,
      b1: makeGuestPlayer("Jordan"),
      b2: makeGuestPlayer("Riley"),
    };
    assert.equal(seatSelfInA1IfNeeded(slots, self), slots);
  });
});

describe("playerFromInitialSelf", () => {
  it("returns null when signed out or missing id", () => {
    assert.equal(playerFromInitialSelf(null), null);
    assert.equal(playerFromInitialSelf(undefined), null);
    assert.equal(playerFromInitialSelf({ id: "  ", displayName: "Pat" }), null);
  });

  it("builds a bound user player with fallback display name", () => {
    const player = playerFromInitialSelf({ id: "u1", displayName: "  " });
    assert.ok(player);
    assert.equal(player.userId, "u1");
    assert.equal(player.isGuest, false);
    assert.equal(player.displayName, "You");
  });
});

describe("resolveInitialQuickStartSlots", () => {
  it("fills four guests when there is no server self", () => {
    const slots = resolveInitialQuickStartSlots(null);
    assert.equal(slots.a1.isGuest, true);
    assert.match(slots.a1.displayName, /Alex/i);
    assert.equal(slots.a2.isGuest, true);
    assert.equal(slots.b1.isGuest, true);
    assert.equal(slots.b2.isGuest, true);
  });

  it("seats server self in A1 on first paint with guests elsewhere", () => {
    const slots = resolveInitialQuickStartSlots({
      id: "u42",
      displayName: "Pat Rivera",
    });
    assert.equal(slots.a1.userId, "u42");
    assert.equal(slots.a1.isGuest, false);
    assert.equal(slots.a1.displayName, "Pat Rivera");
    assert.equal(slots.a2.isGuest, true);
    assert.equal(slots.b1.isGuest, true);
    assert.equal(slots.b2.isGuest, true);
  });
});
