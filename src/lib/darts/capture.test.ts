import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CaptureDartsMatchInput } from "../../types/darts-match.ts";
import { DartsApiError } from "./api-match.ts";
import {
  CAPTURE_DARTS_PATH,
  captureDartsMatchWith,
  playersFromNames,
  toCaptureDartsMatchBody,
} from "./capture.ts";

const captureInput: CaptureDartsMatchInput = {
  venueCmsId: null,
  playedAt: "2026-09-07T18:00:00.000Z",
  players: [
    { slot: 1, displayName: "Alex", isGuest: true, userId: null },
    { slot: 2, displayName: "Riley", isGuest: false, userId: "user-1" },
  ],
  turns: [
    { playerSlot: 2, score: 180 },
    { playerSlot: 2, score: 180 },
    { playerSlot: 2, score: 141, checkout: true },
  ],
};

const lockedSnapshot = {
  id: "darts-9",
  venueCmsId: null,
  startsAt: "2026-09-07T18:00:00.000Z",
  startingScore: 501,
  checkoutRule: "double_out",
  status: "locked",
  players: [
    { slot: 1, displayName: "Alex", isGuest: true, userId: null, remaining: 501 },
    {
      slot: 2,
      displayName: "Riley",
      isGuest: false,
      userId: "user-1",
      remaining: 0,
    },
  ],
  turns: [
    {
      turnNumber: 1,
      playerSlot: 2,
      score: 180,
      bust: false,
      checkout: false,
      remainingAfter: 321,
    },
    {
      turnNumber: 2,
      playerSlot: 2,
      score: 180,
      bust: false,
      checkout: false,
      remainingAfter: 141,
    },
    {
      turnNumber: 3,
      playerSlot: 2,
      score: 141,
      bust: false,
      checkout: true,
      remainingAfter: 0,
    },
  ],
  winnerSlot: 2,
  winnerUserId: "user-1",
  lockedAt: "2026-09-07T18:10:00.000Z",
  nextSuggestedSlot: null,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("toCaptureDartsMatchBody", () => {
  it("builds a turns-log capture with a finishing checkout", () => {
    const body = toCaptureDartsMatchBody(captureInput);
    assert.equal(body.venueCmsId, null);
    assert.equal(body.playedAt, "2026-09-07T18:00:00.000Z");
    assert.equal("startsAt" in body, false);
    assert.equal(body.players[1]?.userId, "user-1");
    assert.deepEqual(body.turns.at(-1), {
      playerSlot: 2,
      score: 141,
      checkout: true,
    });
  });

  it("rejects a log without a finishing checkout", () => {
    assert.throws(
      () =>
        toCaptureDartsMatchBody({
          ...captureInput,
          turns: [{ playerSlot: 1, score: 60 }],
        }),
      (err: unknown) => {
        assert.ok(err instanceof DartsApiError);
        assert.match(err.message, /finishing checkout/);
        return true;
      },
    );
  });
});

describe("playersFromNames", () => {
  it("seats the signed-in user in slot 1", () => {
    const players = playersFromNames(["Riley", "Alex"], {
      userId: "user-1",
      displayName: "Riley",
    });
    assert.equal(players[0]?.isGuest, false);
    assert.equal(players[0]?.userId, "user-1");
    assert.equal(players[1]?.isGuest, true);
  });
});

describe("captureDartsMatchWith", () => {
  it("POSTs /api/darts/capture without a venue ensure on a home game", async () => {
    const calls: string[] = [];
    const match = await captureDartsMatchWith(captureInput, null, {
      baseUrl: "https://api.example.test",
      fetch: async (input, init) => {
        calls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return jsonResponse(201, lockedSnapshot);
      },
    });
    assert.equal(match.id, "darts-9");
    assert.equal(match.status, "locked");
    assert.deepEqual(calls, [
      `POST https://api.example.test${CAPTURE_DARTS_PATH}`,
    ]);
  });
});
