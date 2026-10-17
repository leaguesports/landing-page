import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectIndexedIntentPairs,
  locationSlugsFromIntentVenueRow,
  mergeMetroPageLastmods,
} from "./indexed-pairs.ts";

const UPDATED = "2026-09-01T00:00:00.000Z";

const golfInSandton = {
  activitySlugs: ["golf"],
  locationSlug: "sandton",
  parentSlug: "johannesburg",
  suburbSlug: "sandton",
  citySlug: "johannesburg",
  updatedAt: UPDATED,
};

describe("locationSlugsFromIntentVenueRow", () => {
  it("includes suburb and parent/city slugs a venue actually matches", () => {
    assert.deepEqual(locationSlugsFromIntentVenueRow(golfInSandton), [
      "sandton",
      "johannesburg",
    ]);
  });

  it("does not invent a city when CMS never referenced one", () => {
    assert.deepEqual(
      locationSlugsFromIntentVenueRow({
        locationSlug: "sandton",
        suburbSlug: "sandton",
      }),
      ["sandton"],
    );
  });
});

describe("collectIndexedIntentPairs", () => {
  it("emits /play/golf/johannesburg from a Sandton golf venue with city parent", () => {
    const pairs = collectIndexedIntentPairs("play", [golfInSandton]);
    const keys = pairs.map((pair) => `${pair.activitySlug}/${pair.locationSlug}`);
    assert.ok(keys.includes("golf/sandton"));
    assert.ok(keys.includes("golf/johannesburg"));
    assert.equal(
      pairs.find((pair) => pair.locationSlug === "johannesburg")?.updatedAt,
      UPDATED,
    );
  });

  it("does not invent a city or sport the venue does not cover", () => {
    const pairs = collectIndexedIntentPairs("play", [golfInSandton]);
    const keys = new Set(
      pairs.map((pair) => `${pair.activitySlug}/${pair.locationSlug}`),
    );
    assert.equal(keys.has("golf/cape-town"), false);
    assert.equal(keys.has("tennis/johannesburg"), false);
    assert.equal(keys.has("golf/midrand"), false);
  });

  it("includes watch city peers and series URLs, but not play-only golf", () => {
    const pairs = collectIndexedIntentPairs(
      "watch",
      [
        {
          activitySlugs: ["rugby", "golf"],
          locationSlug: "sandton",
          parentSlug: "johannesburg",
          citySlug: "johannesburg",
          updatedAt: UPDATED,
        },
        {
          activitySlugs: ["motorsport"],
          locationSlug: "midrand",
          parentSlug: "johannesburg",
          citySlug: "johannesburg",
          updatedAt: UPDATED,
        },
      ],
      [{ slug: "f1", sportSlug: "motorsport" }],
    );
    const keys = new Set(
      pairs.map((pair) => `${pair.activitySlug}/${pair.locationSlug}`),
    );

    assert.equal(keys.has("rugby/johannesburg"), true);
    assert.equal(keys.has("rugby/sandton"), true);
    assert.equal(keys.has("motorsport/johannesburg"), true);
    assert.equal(keys.has("f1/midrand"), true);
    assert.equal(keys.has("f1/johannesburg"), true);
    assert.equal(keys.has("golf/johannesburg"), false);
    assert.equal(keys.has("golf/sandton"), false);
  });

  it("skips blank activity and location slugs", () => {
    const pairs = collectIndexedIntentPairs("play", [
      {
        activitySlugs: ["", "  ", null, "padel"],
        locationSlug: "  ",
        parentSlug: null,
        citySlug: "fourways",
      },
    ]);
    assert.deepEqual(
      pairs.map((pair) => `${pair.activitySlug}/${pair.locationSlug}`),
      ["padel/fourways"],
    );
  });
});

describe("mergeMetroPageLastmods", () => {
  it("keeps the newer of venue coverage and the metroPage _updatedAt", () => {
    const pairs = collectIndexedIntentPairs("play", [golfInSandton]);
    const merged = mergeMetroPageLastmods("play", pairs, [
      {
        intent: "play",
        activitySlug: "golf",
        citySlug: "johannesburg",
        updatedAt: "2026-09-04T00:00:00.000Z",
      },
      {
        intent: "play",
        activitySlug: "golf",
        citySlug: "sandton",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        intent: "watch",
        activitySlug: "rugby",
        citySlug: "johannesburg",
        updatedAt: "2026-09-09T00:00:00.000Z",
      },
      {
        intent: "play",
        activitySlug: "padel",
        citySlug: "cape-town",
        updatedAt: "2026-09-03T12:00:00.000Z",
      },
    ]);

    const byKey = new Map(
      merged.map((pair) => [`${pair.activitySlug}/${pair.locationSlug}`, pair.updatedAt]),
    );
    assert.equal(byKey.get("golf/johannesburg"), "2026-09-04T00:00:00.000Z");
    assert.equal(byKey.get("golf/sandton"), UPDATED);
    assert.equal(byKey.get("padel/cape-town"), "2026-09-03T12:00:00.000Z");
    assert.equal(byKey.has("rugby/johannesburg"), false);
  });
});
