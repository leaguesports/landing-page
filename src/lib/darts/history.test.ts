import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  didDartsPlayerWin,
  formatDartsHistoryScore,
} from "./history.ts";
import type { DartsHistoryItem, DartsPlayer } from "../../types/darts-match.ts";

function player(
  slot: DartsPlayer["slot"],
  displayName: string,
  remaining: number,
  userId?: string | null,
): DartsPlayer {
  return {
    slot,
    displayName,
    remaining,
    isGuest: !userId,
    userId: userId ?? null,
  };
}

function item(
  overrides: Partial<DartsHistoryItem> = {},
): DartsHistoryItem {
  return {
    id: "d1",
    startsAt: "2026-09-07T12:00:00.000Z",
    venueCmsId: null,
    venueName: null,
    venueSlug: null,
    startingScore: 501,
    checkoutRule: "double_out",
    players: [
      player(1, "Alex Reed", 0, "u1"),
      player(2, "Sam Ortiz", 142, "u2"),
    ],
    turns: [],
    winnerSlot: 1,
    winnerUserId: "u1",
    ...overrides,
  };
}

describe("formatDartsHistoryScore", () => {
  it("formats remainings as a scoreline", () => {
    assert.equal(formatDartsHistoryScore(item()), "0–142");
  });
});

describe("didDartsPlayerWin", () => {
  it("returns true for the winner account", () => {
    assert.equal(didDartsPlayerWin(item(), "u1"), true);
  });

  it("returns false for a seated loser", () => {
    assert.equal(didDartsPlayerWin(item(), "u2"), false);
  });

  it("returns null when the account was not seated", () => {
    assert.equal(didDartsPlayerWin(item(), "u9"), null);
  });
});
