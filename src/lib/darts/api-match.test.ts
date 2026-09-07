import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CreateDartsMatchInput } from "../../types/darts-match.ts";
import {
  CREATE_DARTS_PATH,
  DARTS_MATCH_PATH,
  DARTS_TURNS_PATH,
  DartsApiError,
  createDartsMatchWith,
  parseApiDartsMatch,
  parseDartsHistoryItem,
  toCreateDartsMatchBody,
} from "./api-match.ts";

const liveSnapshot = {
  id: "darts-1",
  venueCmsId: "sanity-pub-1",
  startsAt: "2026-09-07T18:00:00.000Z",
  startingScore: 501,
  checkoutRule: "double_out",
  status: "live",
  players: [
    { slot: 1, userId: null, displayName: "Alex", isGuest: true, remaining: 441 },
    {
      slot: 2,
      userId: "user-riley",
      displayName: "Riley",
      isGuest: false,
      remaining: 501,
    },
  ],
  turns: [
    {
      turnNumber: 1,
      playerSlot: 1,
      score: 60,
      bust: false,
      checkout: false,
      remainingAfter: 441,
    },
  ],
  winnerSlot: null,
  winnerUserId: null,
  lockedAt: null,
  nextSuggestedSlot: 2,
};

const createInput: CreateDartsMatchInput = {
  venueCmsId: "sanity-pub-1",
  startsAt: "2026-09-07T18:00:00.000Z",
  players: [
    { slot: 1, displayName: "Alex", isGuest: true, userId: null },
    { slot: 2, displayName: "Riley", isGuest: false, userId: "user-riley" },
  ],
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("toCreateDartsMatchBody", () => {
  it("sends optional venue, startsAt, and 2–8 slotted players", () => {
    const body = toCreateDartsMatchBody(createInput);
    assert.equal(body.venueCmsId, "sanity-pub-1");
    assert.equal(body.startsAt, "2026-09-07T18:00:00.000Z");
    assert.equal(body.players.length, 2);
    assert.equal(body.players[1]?.userId, "user-riley");
  });

  it("omits venueCmsId for a home game", () => {
    const body = toCreateDartsMatchBody({
      ...createInput,
      venueCmsId: null,
    });
    assert.equal("venueCmsId" in body, false);
  });

  it("rejects fewer than two players", () => {
    assert.throws(
      () =>
        toCreateDartsMatchBody({
          ...createInput,
          players: [createInput.players[0]!],
        }),
      (err: unknown) => {
        assert.ok(err instanceof DartsApiError);
        assert.equal(err.status, 400);
        assert.match(err.message, /2–8/);
        return true;
      },
    );
  });
});

describe("parseApiDartsMatch", () => {
  it("maps a live snapshot including remaining and nextSuggestedSlot", () => {
    const match = parseApiDartsMatch(liveSnapshot);
    assert.ok(match);
    assert.equal(match?.id, "darts-1");
    assert.equal(match?.sport, "darts");
    assert.equal(match?.startingScore, 501);
    assert.equal(match?.checkoutRule, "double_out");
    assert.equal(match?.status, "live");
    assert.equal(match?.players[0]?.remaining, 441);
    assert.equal(match?.turns[0]?.score, 60);
    assert.equal(match?.nextSuggestedSlot, 2);
  });

  it("maps a locked snapshot and clears the next-slot hint", () => {
    const match = parseApiDartsMatch({
      ...liveSnapshot,
      status: "locked",
      winnerSlot: 2,
      winnerUserId: "user-riley",
      lockedAt: "2026-09-07T19:00:00.000Z",
      nextSuggestedSlot: 1,
    });
    assert.equal(match?.status, "locked");
    assert.equal(match?.winnerSlot, 2);
    assert.equal(match?.lockedAt, "2026-09-07T19:00:00.000Z");
    assert.equal(match?.nextSuggestedSlot, null);
  });
});

describe("parseDartsHistoryItem", () => {
  it("accepts empty players/turns and a null home venue", () => {
    const item = parseDartsHistoryItem({
      id: "hist-1",
      startsAt: "2026-09-07T18:00:00.000Z",
      venueCmsId: null,
      venueName: null,
      venueSlug: null,
      startingScore: 501,
      checkoutRule: "double_out",
      players: [],
      turns: [],
      winnerSlot: 2,
      winnerUserId: "user-riley",
    });
    assert.ok(item);
    assert.equal(item?.venueCmsId, null);
    assert.equal(item?.winnerSlot, 2);
    assert.deepEqual(item?.players, []);
  });
});

describe("createDartsMatchWith", () => {
  it("POSTs /api/darts without ensuring a venue for a home game", async () => {
    const calls: string[] = [];
    const match = await createDartsMatchWith(
      { ...createInput, venueCmsId: null },
      null,
      {
        baseUrl: "https://api.example.test",
        fetch: async (input, init) => {
          const url = String(input);
          calls.push(`${init?.method ?? "GET"} ${url}`);
          return jsonResponse(201, {
            ...liveSnapshot,
            venueCmsId: null,
          });
        },
      },
    );
    assert.equal(match.id, "darts-1");
    assert.deepEqual(calls, ["POST https://api.example.test/api/darts"]);
  });
});

describe("darts proxy paths", () => {
  it("keeps capture and turns as dedicated helpers next to :id", () => {
    assert.equal(CREATE_DARTS_PATH, "/api/darts");
    assert.equal(DARTS_MATCH_PATH("abc"), "/api/darts/abc");
    assert.equal(DARTS_TURNS_PATH("abc"), "/api/darts/abc/turns");
    assert.notEqual(DARTS_TURNS_PATH("abc"), DARTS_MATCH_PATH("abc"));
  });
});
