import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatHistoryDate,
  formatHistoryOpponents,
  formatHistoryScore,
  playerHistoryPath,
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
