import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelHistoryItem } from "../../types/padel-match.ts";
import {
  didPlayerWin,
  formatHistoryDate,
  formatHistoryOpponents,
  formatHistoryScore,
  playerHistoryPath,
  playerRecentForm,
  summarisePlayerHistory,
} from "./history.ts";

describe("formatHistoryOpponents", () => {
  it("joins the other pair on a player list", () => {
    assert.equal(
      formatHistoryOpponents([
        { displayName: "Jordan (Guest)", isGuest: true },
        { displayName: "Riley Smith", isGuest: false, userId: "u" },
      ]),
      "Jordan / Riley",
    );
  });

  it("shows both teams on a venue list", () => {
    assert.equal(
      formatHistoryOpponents({
        teamA: [
          { displayName: "Alex", isGuest: false, userId: "a" },
          { displayName: "Sam (Guest)", isGuest: true },
        ],
        teamB: [
          { displayName: "Jordan (Guest)", isGuest: true },
          { displayName: "Riley", isGuest: false, userId: "r" },
        ],
      }),
      "Alex / Sam vs Jordan / Riley",
    );
  });
});

describe("formatHistoryScore", () => {
  it("joins set games and includes a tie-break", () => {
    assert.equal(
      formatHistoryScore({
        sets: [
          { gamesA: 6, gamesB: 4, tieBreak: null },
          { gamesA: 3, gamesB: 6, tieBreak: null },
          {
            gamesA: 7,
            gamesB: 6,
            tieBreak: { pointsA: 7, pointsB: 5 },
          },
        ],
      }),
      "6–4, 3–6, 7–6 (7–5)",
    );
  });

  it("uses an em dash when there is no score", () => {
    assert.equal(formatHistoryScore(null), "—");
    assert.equal(formatHistoryScore({ sets: [] }), "—");
  });
});

describe("formatHistoryDate", () => {
  it("formats an ISO start time", () => {
    assert.match(formatHistoryDate("2026-08-29T10:00:00.000Z"), /2026/);
  });
});

describe("playerHistoryPath", () => {
  it("is shareable by playerUserId", () => {
    assert.equal(
      playerHistoryPath("user-1"),
      "/padel/history?playerUserId=user-1",
    );
  });
});

function lockedItem(
  winner: "A" | "B",
  teamAUserId: string | null,
  teamBUserId: string | null,
): PadelHistoryItem {
  return {
    id: "m1",
    startsAt: "2026-09-04T10:00:00.000Z",
    venueCmsId: "court-1",
    venueName: "THE GRID",
    venueSlug: "the-grid",
    pairings: {
      teamA: [
        { displayName: "Alex", isGuest: !teamAUserId, userId: teamAUserId },
        { displayName: "Sam", isGuest: true },
      ],
      teamB: [
        { displayName: "Jordan", isGuest: !teamBUserId, userId: teamBUserId },
        { displayName: "Riley", isGuest: true },
      ],
    },
    opponents: [],
    score: { sets: [{ gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" }] },
    winner,
  };
}

describe("didPlayerWin", () => {
  it("is a win when the account is on the winning pair", () => {
    assert.equal(didPlayerWin(lockedItem("A", "user-1", "user-2"), "user-1"), true);
  });

  it("is a loss when the account is on the other pair", () => {
    assert.equal(didPlayerWin(lockedItem("A", "user-1", "user-2"), "user-2"), false);
  });

  it("is unknown when the account was not bound into the match", () => {
    assert.equal(didPlayerWin(lockedItem("A", "user-1", null), "user-9"), null);
  });
});

describe("playerRecentForm", () => {
  it("returns newest-first W/L and skips undecided rows", () => {
    assert.deepEqual(
      playerRecentForm(
        [
          lockedItem("A", "me", "them"),
          lockedItem("A", "other", "them"),
          lockedItem("B", "me", "them"),
          lockedItem("A", "me", "them"),
        ],
        "me",
        5,
      ),
      ["W", "L", "W"],
    );
  });

  it("caps at the requested limit", () => {
    assert.deepEqual(
      playerRecentForm(
        [
          lockedItem("A", "me", "them"),
          lockedItem("B", "me", "them"),
          lockedItem("A", "me", "them"),
        ],
        "me",
        2,
      ),
      ["W", "L"],
    );
  });
});

describe("summarisePlayerHistory", () => {
  it("counts wins and losses for the named account", () => {
    const stats = summarisePlayerHistory(
      [
        lockedItem("A", "me", "them"),
        lockedItem("B", "me", "them"),
        lockedItem("A", "other", "them"),
      ],
      "me",
    );
    assert.deepEqual(stats, {
      locked: 3,
      wins: 1,
      losses: 1,
      winRate: 50,
      recentForm: ["W", "L"],
    });
  });
});
