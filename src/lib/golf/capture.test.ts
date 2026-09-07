import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CaptureGolfRoundInput } from "../../types/golf-round.ts";
import { GolfApiError } from "./api-round.ts";
import {
  captureGolfRoundWith,
  playersFromNames,
  toCaptureGolfRoundBody,
} from "./capture.ts";

const nineHoles = Array.from({ length: 9 }, (_, index) => ({
  number: index + 1,
  par: 4,
  strokeIndex: index + 1,
}));

const captureInput: CaptureGolfRoundInput = {
  venueCmsId: "sanity-course-1",
  playedAt: "2026-09-04T10:00:00.000Z",
  holesPlayed: 9,
  startingHole: 1,
  teeName: "White",
  course: { name: "Links Nine", holes: nineHoles },
  players: [
    { slot: 1, displayName: "Alex", isGuest: true, userId: null },
    { slot: 2, displayName: "Riley", isGuest: false, userId: "user-1" },
  ],
  score: {
    holes: nineHoles.map((hole) => ({
      number: hole.number,
      strokes: { "1": 4, "2": 5 },
    })),
  },
};

const lockedSnapshot = {
  id: "round-9",
  venueCmsId: "sanity-course-1",
  startsAt: "2026-09-04T10:00:00.000Z",
  holesPlayed: 9,
  startingHole: 1,
  teeName: "White",
  status: "locked",
  course: { name: "Links Nine", holes: nineHoles },
  players: [
    { slot: 1, displayName: "Alex", isGuest: true, userId: null },
    { slot: 2, displayName: "Riley", isGuest: false, userId: "user-1" },
  ],
  score: captureInput.score,
  lockedAt: "2026-09-07T04:30:00.000Z",
};

const appVenue = {
  id: "app-1",
  cmsId: "sanity-course-1",
  name: "Test Links",
  slug: "test-links",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("toCaptureGolfRoundBody", () => {
  it("builds the capture contract with slot-keyed strokes", () => {
    const body = toCaptureGolfRoundBody(captureInput);
    assert.equal(body.venueCmsId, "sanity-course-1");
    assert.equal(body.playedAt, "2026-09-04T10:00:00.000Z");
    assert.equal("startsAt" in body, false);
    assert.equal(body.holesPlayed, 9);
    assert.equal(body.startingHole, 1);
    assert.equal(body.teeName, "White");
    assert.equal(body.players.length, 2);
    assert.equal(body.players[1]?.userId, "user-1");
    assert.equal(body.score.holes.length, 9);
    assert.deepEqual(body.score.holes[0]?.strokes, { "1": 4, "2": 5 });
  });

  it("prefers startsAt when both times are sent", () => {
    const body = toCaptureGolfRoundBody({
      ...captureInput,
      startsAt: "2026-09-04T08:00:00.000Z",
    });
    assert.equal(body.startsAt, "2026-09-04T08:00:00.000Z");
    assert.equal("playedAt" in body, false);
  });

  it("rejects missing venue, time, hole count, or strokes", () => {
    assert.throws(
      () => toCaptureGolfRoundBody({ ...captureInput, venueCmsId: "" }),
      /Venue cmsId/,
    );
    assert.throws(
      () =>
        toCaptureGolfRoundBody({
          ...captureInput,
          playedAt: undefined,
          startsAt: undefined,
        }),
      /startsAt or playedAt is required/,
    );
    assert.throws(
      () =>
        toCaptureGolfRoundBody({
          ...captureInput,
          holesPlayed: 18,
        }),
      /course.holes length/,
    );
    assert.throws(
      () =>
        toCaptureGolfRoundBody({
          ...captureInput,
          score: { holes: [{ number: 1, strokes: { "1": 4 } }] },
        }),
      /score.holes must match/,
    );
    assert.throws(
      () =>
        toCaptureGolfRoundBody({
          ...captureInput,
          score: {
            holes: nineHoles.map((hole) => ({
              number: hole.number,
              strokes: { "1": 4 },
            })),
          },
        }),
      /strokes 1–15/,
    );
    assert.throws(
      () => toCaptureGolfRoundBody({ ...captureInput, teeName: "" }),
      /teeName must be 1–40/,
    );
  });
});

describe("playersFromNames", () => {
  it("binds slot 1 to the session user when the name matches", () => {
    const players = playersFromNames(["Riley", "Alex"], {
      userId: "user-1",
      displayName: "Riley",
    });
    assert.equal(players[0]?.isGuest, false);
    assert.equal(players[0]?.userId, "user-1");
    assert.equal(players[1]?.isGuest, true);
  });
});

describe("captureGolfRoundWith", () => {
  it("ensures the venue then POSTs /api/golf-rounds/capture", async () => {
    const calls: string[] = [];
    const round = await captureGolfRoundWith(
      captureInput,
      { name: "Test Links", slug: "test-links" },
      {
        baseUrl: "https://api.example.test",
        fetch: async (url, init = {}) => {
          calls.push(`${init.method ?? "GET"} ${String(url)}`);
          if (String(url).includes("/api/venues/")) {
            return jsonResponse(200, appVenue);
          }
          return jsonResponse(201, lockedSnapshot);
        },
      },
    );

    assert.equal(round.id, "round-9");
    assert.equal(round.status, "locked");
    assert.deepEqual(calls, [
      "GET https://api.example.test/api/venues/sanity-course-1",
      "POST https://api.example.test/api/golf-rounds/capture",
    ]);
  });

  it("surfaces 401 / 403 / 404 from the capture route", async () => {
    await assert.rejects(
      () =>
        captureGolfRoundWith(
          captureInput,
          { name: "Test Links", slug: "test-links" },
          {
            baseUrl: "https://api.example.test",
            fetch: async (url) => {
              if (String(url).includes("/api/venues/")) {
                return jsonResponse(200, appVenue);
              }
              return jsonResponse(401, { error: "Unauthorized" });
            },
          },
        ),
      (err: unknown) => {
        assert.ok(err instanceof GolfApiError);
        assert.equal(err.status, 401);
        return true;
      },
    );
  });
});
