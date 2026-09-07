import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildQuickStartPlayerSeed,
  consumeQuickStartPlayerSeed,
  formatDistanceKm,
  pickQuickStartActivity,
  quickStartCompanionLimit,
  rankQuickStartVenues,
  resolveQuickStart,
  suggestQuickStartPlayers,
  type QuickStartVenue,
} from "./quick-start.ts";
import type { Friend } from "../friends/friends.ts";

const JOBURG: QuickStartVenue = {
  id: "v1",
  slug: "padel-hub-sandton",
  name: "Padel Hub Sandton",
  suburb: "Sandton",
  city: "Johannesburg",
  latitude: -26.1076,
  longitude: 28.0567,
  sports: ["padel"],
};

const GOLF_NEAR: QuickStartVenue = {
  id: "v2",
  slug: "wanderers-golf",
  name: "Wanderers Golf Club",
  suburb: "Illovo",
  city: "Johannesburg",
  latitude: -26.131,
  longitude: 28.05,
  sports: ["golf"],
  golfCourse: {
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      strokeIndex: i + 1,
    })),
  },
};

const CAPE_TOWN: QuickStartVenue = {
  id: "v3",
  slug: "padel-cape",
  name: "Cape Padel",
  suburb: "Sea Point",
  city: "Cape Town",
  latitude: -33.91,
  longitude: 18.39,
  sports: ["padel"],
};

const NO_COORDS: QuickStartVenue = {
  id: "v4",
  slug: "mystery-court",
  name: "Mystery Court",
  suburb: "Somewhere",
  city: "Nowhere",
  latitude: null,
  longitude: null,
  sports: ["padel"],
};

const MULTI: QuickStartVenue = {
  id: "v5",
  slug: "multi-sport-club",
  name: "Multi Sport Club",
  suburb: "Rosebank",
  city: "Johannesburg",
  latitude: -26.146,
  longitude: 28.043,
  sports: ["padel", "darts", "dart"],
};

const HERE = { latitude: -26.11, longitude: 28.055 };

describe("formatDistanceKm", () => {
  it("formats metres under 1 km and rounded km above", () => {
    assert.equal(formatDistanceKm(0.24), "240 m");
    assert.equal(formatDistanceKm(2.35), "2.4 km");
    assert.equal(formatDistanceKm(12.4), "12 km");
  });
});

describe("rankQuickStartVenues", () => {
  it("orders by distance and skips venues without coords or activities", () => {
    const ranked = rankQuickStartVenues(
      [CAPE_TOWN, NO_COORDS, GOLF_NEAR, JOBURG],
      HERE,
      { maxKm: 50 },
    );
    assert.deepEqual(
      ranked.map((row) => row.venue.slug),
      ["padel-hub-sandton", "wanderers-golf"],
    );
    assert.ok(ranked[0]!.distanceKm < ranked[1]!.distanceKm);
  });

  it("drops venues beyond maxKm", () => {
    const ranked = rankQuickStartVenues([JOBURG, CAPE_TOWN], HERE, {
      maxKm: 50,
    });
    assert.deepEqual(
      ranked.map((row) => row.venue.slug),
      ["padel-hub-sandton"],
    );
  });
});

describe("pickQuickStartActivity", () => {
  const activities = [
    {
      id: "padel",
      sportSlug: "padel",
      name: "Padel",
      href: "/padel/new?venue=x",
      cta: "Start padel",
      description: "Padel",
    },
    {
      id: "darts",
      sportSlug: "darts",
      name: "Darts",
      href: "/darts/new?venue=x",
      cta: "Start darts",
      description: "Darts",
    },
  ];

  it("prefers override, then active, then preferred, then first", () => {
    assert.equal(
      pickQuickStartActivity(activities, { overrideSport: "darts" })?.sportSlug,
      "darts",
    );
    assert.equal(
      pickQuickStartActivity(activities, { activeSport: "darts" })?.sportSlug,
      "darts",
    );
    assert.equal(
      pickQuickStartActivity(activities, {
        preferredSports: ["golf", "darts"],
      })?.sportSlug,
      "darts",
    );
    assert.equal(pickQuickStartActivity(activities)?.sportSlug, "padel");
  });
});

describe("resolveQuickStart", () => {
  it("resolves nearest venue and preferred sport", () => {
    const result = resolveQuickStart([MULTI, JOBURG, GOLF_NEAR], HERE, {
      preferredSports: ["darts", "golf"],
    });
    assert.ok(result);
    assert.equal(result!.venue.slug, "padel-hub-sandton");
    assert.equal(result!.activity.sportSlug, "padel");
    assert.equal(result!.far, false);
  });

  it("honours venue override and active sport on multi venues", () => {
    const result = resolveQuickStart([MULTI, JOBURG], HERE, {
      overrideVenueSlug: "multi-sport-club",
      activeSport: "darts",
    });
    assert.ok(result);
    assert.equal(result!.venue.slug, "multi-sport-club");
    assert.equal(result!.activity.sportSlug, "darts");
    assert.match(result!.activity.href, /darts\/new\?venue=multi-sport-club/);
  });

  it("returns null when nothing is in range", () => {
    assert.equal(
      resolveQuickStart([CAPE_TOWN], HERE, { maxKm: 50 }),
      null,
    );
  });
});

describe("suggestQuickStartPlayers", () => {
  const friends: Friend[] = [
    {
      id: "f1",
      displayName: "Alex",
      handle: "alex",
      avatarUrl: null,
      since: "2026-01-01",
    },
    {
      id: "f2",
      displayName: "Sam",
      handle: "sam",
      avatarUrl: null,
      since: "2026-01-02",
    },
    {
      id: "f3",
      displayName: "Jordan",
      handle: "jordan",
      avatarUrl: null,
      since: "2026-01-03",
    },
    {
      id: "f4",
      displayName: "Riley",
      handle: "riley",
      avatarUrl: null,
      since: "2026-01-04",
    },
  ];

  it("suggests up to sport companion limit from friends", () => {
    assert.equal(quickStartCompanionLimit("padel"), 3);
    const players = suggestQuickStartPlayers({
      sportSlug: "padel",
      friends,
      excludeUserIds: ["f1"],
    });
    assert.deepEqual(
      players.map((p) => p.displayName),
      ["Sam", "Jordan", "Riley"],
    );
  });

  it("fills remaining slots from recent players", () => {
    const players = suggestQuickStartPlayers({
      sportSlug: "darts",
      friends: friends.slice(0, 0),
      recent: [
        {
          id: "g1",
          displayName: "Guest Pat",
          userId: null,
          isGuest: true,
        },
      ],
    });
    assert.equal(players.length, 1);
    assert.equal(players[0]!.displayName, "Guest Pat");
  });
});

describe("quick-start player seed", () => {
  it("builds a seed for the create flow", () => {
    const resolution = resolveQuickStart([JOBURG], HERE)!;
    const seed = buildQuickStartPlayerSeed(resolution, [
      {
        id: "f1",
        displayName: "Alex",
        userId: "f1",
        isGuest: false,
      },
    ]);
    assert.equal(seed.sportSlug, "padel");
    assert.equal(seed.venueSlug, "padel-hub-sandton");
    assert.equal(seed.players.length, 1);
  });

  it("consume returns empty without session storage", () => {
    assert.deepEqual(consumeQuickStartPlayerSeed("padel", "padel-hub-sandton"), []);
  });
});
