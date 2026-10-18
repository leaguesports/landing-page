import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GameDayCard } from "../../types/golf-game-day.ts";
import {
  LOOKS_RIGHT_HEADER,
  looksRightPath,
  looksRightPill,
  overlayQueuedLooksRight,
  postLooksRight,
  withLooksRight,
} from "./looks-right.ts";

function card(): GameDayCard {
  return {
    id: "card-2",
    gameDayId: "day-1",
    number: 2,
    status: "live",
    golfRoundId: null,
    holesPlayed: 18,
    startingHole: 1,
    scoring: true,
    scorer: { playerId: "mike", displayName: "Mike" },
    players: [
      {
        playerId: "mike",
        slot: 1,
        displayName: "Mike",
        handicapIndex: 6,
        playingHandicap: 6,
        courseHandicap: 6,
        teeName: "White",
        looksRight: false,
        isScorer: true,
        you: true,
      },
      {
        playerId: "lerato",
        slot: 2,
        displayName: "Lerato",
        handicapIndex: null,
        playingHandicap: 0,
        courseHandicap: null,
        teeName: "White",
        looksRight: true,
        isScorer: false,
        you: false,
      },
      {
        playerId: "kabelo",
        slot: 4,
        displayName: "Kabelo",
        handicapIndex: 20,
        playingHandicap: 20,
        courseHandicap: 20,
        teeName: "White",
        looksRight: false,
        isScorer: false,
        you: false,
      },
    ],
    course: { name: "Zebula", holes: [] },
    tees: [],
    holes: [],
    missingHoles: [],
  };
}

describe("looks right contract", () => {
  it("posts to the card route with the device token and no body", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify({ playerId: "kabelo", looksRight: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
    const result = await postLooksRight({
      gameDayId: "day 1",
      cardId: "card/2",
      deviceToken: "device-secret",
      baseUrl: "https://api.example",
      fetchImpl,
    });
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0]?.url,
      `https://api.example${looksRightPath("day 1", "card/2")}`,
    );
    assert.equal(calls[0]?.url, "https://api.example/api/golf-game-days/day%201/cards/card%2F2/looks-right");
    assert.equal(calls[0]?.init.method, "POST");
    assert.equal(calls[0]?.init.body, undefined);
    const headers = calls[0]?.init.headers as Record<string, string>;
    assert.equal(headers[LOOKS_RIGHT_HEADER], "device-secret");
    assert.deepEqual(result, { playerId: "kabelo", looksRight: true });
  });

  it("applies an optimistic true and can roll it back", () => {
    const before = card();
    const optimistic = withLooksRight(before, "kabelo", true);
    assert.equal(optimistic.players.find((player) => player.playerId === "kabelo")?.looksRight, true);
    assert.equal(before.players.find((player) => player.playerId === "kabelo")?.looksRight, false);
    const rolled = withLooksRight(optimistic, "kabelo", false);
    assert.equal(rolled.players.find((player) => player.playerId === "kabelo")?.looksRight, false);
  });

  it("keeps a queued mark when a fetched card still says false", () => {
    const incoming = card();
    const shown = overlayQueuedLooksRight(incoming, ["kabelo"]);
    assert.equal(shown.players.find((player) => player.playerId === "kabelo")?.looksRight, true);
    assert.equal(shown.players.find((player) => player.playerId === "lerato")?.looksRight, true);
  });

  it("renders each pill from the server flag", () => {
    const players = card().players;
    assert.deepEqual(looksRightPill(players[0]!), {
      label: "Scorer",
      filled: false,
      interactive: false,
    });
    assert.deepEqual(looksRightPill(players[1]!), {
      label: "Looks right",
      filled: true,
      interactive: false,
    });
    assert.deepEqual(looksRightPill({ ...players[2]!, you: true }), {
      label: "Looks right?",
      filled: false,
      interactive: true,
    });
    assert.deepEqual(looksRightPill(players[2]!), {
      label: "Looks right?",
      filled: false,
      interactive: false,
    });
  });
});
