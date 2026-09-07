import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attachShotsToScoreHoles,
  appendShot,
  clampShotMeters,
  distanceMeters,
  formatShotMeters,
  hasAnyShots,
  measuredShotCount,
  parseLiveShots,
  parseShot,
  remainingHoleMeters,
  removeLastShot,
  requestHighAccuracyPosition,
  selectedTeeMeters,
  shotFromGpsMark,
  shotFromManualMeters,
  shotsFromScore,
  totalShotMeters,
} from "./shots.ts";
import type { GolfLiveShots, ScorecardHole } from "../../types/golf-round.ts";

describe("distanceMeters / clamp / format", () => {
  it("measures a ~100 m north-south carry", () => {
    const start = { latitude: -25.968, longitude: 28.07 };
    const north = { latitude: -25.967101, longitude: 28.07 };
    const meters = distanceMeters(start, north);
    assert.ok(meters > 90 && meters < 110, `got ${meters}`);
  });

  it("clamps manual meters to 1–600", () => {
    assert.equal(clampShotMeters(0), 1);
    assert.equal(clampShotMeters(900), 600);
    assert.equal(clampShotMeters(237.4), 237);
  });

  it("formats meters and blanks", () => {
    assert.equal(formatShotMeters(238), "238 m");
    assert.equal(formatShotMeters(null), "—");
  });
});

describe("selectedTeeMeters / remaining", () => {
  const hole: ScorecardHole = {
    number: 1,
    par: 4,
    strokeIndex: 9,
    tees: [
      { teeName: "Yellow", color: "Yellow", meters: 343, selected: false },
      { teeName: "White", color: "White", meters: 338, selected: true },
    ],
  };

  it("reads the highlighted tee", () => {
    assert.equal(selectedTeeMeters(hole), 338);
    assert.equal(selectedTeeMeters({ ...hole, tees: [] }), null);
  });

  it("subtracts measured carries from hole length", () => {
    const list = [
      shotFromGpsMark(null, { latitude: 0, longitude: 0 }),
      shotFromManualMeters(238),
      shotFromManualMeters(87),
    ];
    assert.equal(measuredShotCount(list), 2);
    assert.equal(totalShotMeters(list), 325);
    assert.equal(remainingHoleMeters(338, list), 13);
    assert.equal(remainingHoleMeters(null, list), null);
  });
});

describe("GPS mark chaining", () => {
  it("records the first fix as a start mark with no meters", () => {
    const start = shotFromGpsMark(null, {
      latitude: -25.968,
      longitude: 28.07,
      accuracyMeters: 8.2,
    });
    assert.equal(start.kind, "gps");
    assert.equal(start.meters, null);
    assert.equal(start.accuracyMeters, 8);
  });

  it("uses haversine from the previous GPS fix", () => {
    const start = shotFromGpsMark(null, {
      latitude: -25.968,
      longitude: 28.07,
    });
    const next = shotFromGpsMark(start, {
      latitude: -25.967101,
      longitude: 28.07,
    });
    assert.equal(next.kind, "gps");
    assert.ok((next.meters ?? 0) > 90 && (next.meters ?? 0) < 110);
  });

  it("starts a new GPS origin after a manual shot (no coordinates)", () => {
    const manual = shotFromManualMeters(150);
    const next = shotFromGpsMark(manual, {
      latitude: -25.968,
      longitude: 28.07,
    });
    assert.equal(next.meters, null);
  });
});

describe("live shot map", () => {
  it("appends and undoes per player per hole", () => {
    let shots: GolfLiveShots = {};
    shots = appendShot(shots, 1, 1, shotFromManualMeters(220));
    shots = appendShot(shots, 1, 1, shotFromManualMeters(90));
    shots = appendShot(shots, 1, 2, shotFromManualMeters(180));
    assert.equal(shots[1]?.["1"]?.length, 2);
    assert.equal(shots[1]?.["1"]?.[0]?.sequence, 1);
    assert.equal(shots[1]?.["1"]?.[1]?.sequence, 2);
    assert.equal(shots[1]?.["2"]?.length, 1);
    shots = removeLastShot(shots, 1, 1);
    assert.equal(shots[1]?.["1"]?.length, 1);
    assert.equal(hasAnyShots(shots), true);
    assert.equal(hasAnyShots({}), false);
  });
});

describe("parse / score round-trip", () => {
  it("drops malformed shots and keeps valid GPS + manual rows", () => {
    const parsed = parseLiveShots({
      "1": {
        "1": [
          {
            id: "a",
            sequence: 1,
            meters: null,
            kind: "gps",
            latitude: -25.9,
            longitude: 28.1,
            recordedAt: "2026-09-07T10:00:00.000Z",
          },
          { id: "bad", kind: "laser" },
          {
            id: "b",
            sequence: 2,
            meters: 214,
            kind: "manual",
            recordedAt: "2026-09-07T10:02:00.000Z",
          },
        ],
      },
    });
    assert.equal(parsed[1]?.["1"]?.length, 2);
    assert.equal(parsed[1]?.["1"]?.[0]?.meters, null);
    assert.equal(parsed[1]?.["1"]?.[1]?.meters, 214);
    assert.equal(parseShot({ kind: "gps" }), null);
  });

  it("reads optional shots off a locked score without requiring them", () => {
    const fromScore = shotsFromScore({
      holes: [
        {
          number: 3,
          strokes: { "1": 4 },
          shots: {
            "1": [shotFromManualMeters(140)],
          },
        },
        { number: 4, strokes: { "1": 3 } },
      ],
    });
    assert.equal(fromScore[3]?.["1"]?.length, 1);
    assert.equal(fromScore[4], undefined);
    assert.deepEqual(shotsFromScore({ holes: [{ number: 1, strokes: { "1": 4 } }] }), {});
  });

  it("attaches a shot log onto lock-shaped score holes without dropping strokes", () => {
    const holes = attachShotsToScoreHoles(
      [{ number: 1, strokes: { "1": 4, "2": 5 } }],
      { 1: { "1": [shotFromManualMeters(210)] } },
    );
    assert.equal(holes[0]?.strokes["1"], 4);
    assert.equal(holes[0]?.shots?.["1"]?.[0]?.meters, 210);
  });
});

describe("requestHighAccuracyPosition", () => {
  it("resolves coords from a mock geolocation API", async () => {
    const coords = await requestHighAccuracyPosition({
      getCurrentPosition(success) {
        success({
          coords: {
            latitude: -25.9684,
            longitude: 28.072,
            accuracy: 6,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      },
    });
    assert.equal(coords.latitude, -25.9684);
    assert.equal(coords.accuracyMeters, 6);
  });

  it("rejects when geolocation is missing", async () => {
    await assert.rejects(
      () => requestHighAccuracyPosition(null),
      /not supported/,
    );
  });
});
