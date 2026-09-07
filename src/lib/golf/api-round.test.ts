import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GolfApiError,
  parseApiGolfRound,
  parseGolfHistoryItem,
  toCreateGolfRoundBody,
} from "./api-round.ts";
import type { CreateGolfRoundInput, GolfRound } from "../../types/golf-round.ts";

const nineHoles = Array.from({ length: 9 }, (_, index) => ({
  number: index + 10,
  par: 4,
  strokeIndex: index + 1,
}));

const liveRound = {
  id: "round-legacy",
  venueCmsId: "7c735ceb-f881-4521-8f55-adf4ddd20d63",
  startsAt: "2026-09-07T08:00:00.000Z",
  holesPlayed: 9,
  startingHole: 10,
  teeName: null,
  status: "live",
  course: { name: "Kyalami Country Club", holes: nineHoles },
  players: [{ slot: 1, displayName: "Alex", isGuest: true, userId: null }],
  score: null,
  lockedAt: null,
};

const createInput: CreateGolfRoundInput = {
  venueCmsId: "7c735ceb-f881-4521-8f55-adf4ddd20d63",
  startsAt: "2026-09-07T08:00:00.000Z",
  holesPlayed: 9,
  startingHole: 10,
  teeName: "White",
  course: { name: "Kyalami Country Club", holes: nineHoles },
  players: [{ slot: 1, displayName: "Alex", isGuest: true, userId: null }],
};

describe("parseApiGolfRound", () => {
  it("maps legacy null teeName without breaking the round", () => {
    const round = parseApiGolfRound(liveRound);
    assert.ok(round);
    assert.equal(round?.id, "round-legacy");
    assert.equal(round?.teeName, null);
    assert.equal(round?.startingHole, 10);
    assert.equal(round?.holesPlayed, 9);
    assert.deepEqual(
      round?.course.holes.map((hole) => hole.number),
      [10, 11, 12, 13, 14, 15, 16, 17, 18],
    );
  });

  it("treats blank teeName as null so old rounds stay readable", () => {
    const round = parseApiGolfRound({ ...liveRound, teeName: "   " });
    assert.ok(round);
    assert.equal(round?.teeName, null);
    assert.equal((round as GolfRound).status, "live");
  });

  it("keeps a persisted tee name for scorecard highlight wiring", () => {
    const round = parseApiGolfRound({ ...liveRound, teeName: "Yellow" });
    assert.equal(round?.teeName, "Yellow");
  });

  it("reads optional shot logs on a locked score without requiring them", () => {
    const round = parseApiGolfRound({
      ...liveRound,
      status: "locked",
      score: {
        holes: [
          {
            number: 10,
            strokes: { "1": 4 },
            shots: {
              "1": [
                {
                  id: "s1",
                  sequence: 1,
                  meters: 220,
                  kind: "manual",
                  recordedAt: "2026-09-07T10:00:00.000Z",
                },
              ],
            },
          },
        ],
      },
    });
    assert.equal(round?.score?.holes[0]?.strokes["1"], 4);
    assert.equal(round?.score?.holes[0]?.shots?.["1"]?.[0]?.meters, 220);
  });

  it("still parses a score that has only strokes", () => {
    const round = parseApiGolfRound({
      ...liveRound,
      score: { holes: [{ number: 10, strokes: { "1": 5 } }] },
    });
    assert.equal(round?.score?.holes[0]?.strokes["1"], 5);
    assert.equal(round?.score?.holes[0]?.shots, undefined);
  });
});

describe("parseGolfHistoryItem", () => {
  it("maps history rows that still have a null teeName", () => {
    const item = parseGolfHistoryItem({
      ...liveRound,
      venueName: "Kyalami Country Club",
      venueSlug: "kyalami-country-club",
    });
    assert.ok(item);
    assert.equal(item?.teeName, null);
    assert.equal(item?.startingHole, 10);
  });
});

describe("toCreateGolfRoundBody", () => {
  it("sends required teeName, startingHole, and holesPlayed", () => {
    const body = toCreateGolfRoundBody(createInput);
    assert.equal(body.teeName, "White");
    assert.equal(body.startingHole, 10);
    assert.equal(body.holesPlayed, 9);
    assert.deepEqual(
      body.course.holes.map((hole) => hole.number),
      [10, 11, 12, 13, 14, 15, 16, 17, 18],
    );
  });

  it("rejects a missing teeName so Start cannot post null", () => {
    assert.throws(
      () => toCreateGolfRoundBody({ ...createInput, teeName: "  " }),
      (err: unknown) => {
        assert.ok(err instanceof GolfApiError);
        assert.equal(err.status, 400);
        assert.match(err.message, /teeName/);
        return true;
      },
    );
  });
});
