import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import type { GameDayLeaderboard } from "../../types/golf-game-day.ts";
import type { GolfCourseCms } from "../../types/golf-round.ts";
import {
  GAME_DAY_STEPPER_PX,
  STROKE_MAX,
  STROKE_MIN,
  boardBadge,
  defaultBoardTab,
  finishedRound,
  formatBoardScore,
  formatToPar,
  GAME_DAY_COURSE_PAR,
  resultsWinnerLine,
  gameDayCardStartBody,
  holeStatusLines,
  holeSyncLabel,
  holeSyncState,
  initialHoleStrokes,
  mergeLeaderboard,
  movedPlayerIds,
  overallSyncLabel,
  preferredDefaultTee,
  scoreRelation,
  shotChipLabel,
  stepStroke,
  strokeDotsForPlayer,
  teeChipLabel,
  winnerHero,
} from "./scoring-ui.ts";

const holes = Array.from({ length: 18 }, (_, index) => {
  const number = index + 1;
  return {
    number,
    par: 4,
    strokeIndex: number === 8 ? 5 : number === 5 ? 8 : number,
  };
});

describe("game day scoring UI", () => {
  it("uses 64px steppers and opens each hole on par", () => {
    assert.equal(GAME_DAY_STEPPER_PX, 64);
    const source = readFileSync(
      new URL("../../components/golf-game-day/ScoreEntry.tsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /GAME_DAY_STEPPER_PX/);
    const strokes = initialHoleStrokes([{ slot: 1 }, { slot: 2 }], 4, null);
    assert.deepEqual(strokes, { "1": 4, "2": 4 });
    const saved = initialHoleStrokes([{ slot: 1 }], 4, { "1": 5 });
    assert.equal(saved["1"], 5);
  });

  it("clamps strokes between 1 and 15", () => {
    assert.equal(stepStroke(1, -1), STROKE_MIN);
    assert.equal(stepStroke(15, 1), STROKE_MAX);
    assert.equal(stepStroke(4, 1), 5);
    assert.equal(stepStroke(4, -1), 3);
  });

  it("draws one stroke dot when the hole receives a handicap stroke", () => {
    assert.equal(strokeDotsForPlayer(6, holes, 8), 1);
    assert.equal(strokeDotsForPlayer(2, holes, 8), 0);
    assert.equal(strokeDotsForPlayer(null, holes, 8), 0);
  });

  it("names the score against par and the handicap shot chip", () => {
    assert.equal(scoreRelation(4, 4), "PAR");
    assert.equal(scoreRelation(5, 4), "BOGEY");
    assert.equal(scoreRelation(3, 4), "BIRDIE");
    assert.equal(scoreRelation(6, 4), "DOUBLE");
    assert.equal(shotChipLabel(1), "+1 shot");
    assert.equal(shotChipLabel(0), null);
    assert.deepEqual(
      holeStatusLines([
        { number: 6, sync: "saved" },
        { number: 7, sync: "offline" },
        { number: 8, sync: "open" },
      ]),
      ["Hole 6 synced", "Hole 7 waiting · weak signal"],
    );
  });

  it("describes per-hole and overall sync", () => {
    assert.equal(
      holeSyncState({ holeNumber: 8, queued: [], serverSynced: true }),
      "saved",
    );
    assert.equal(
      holeSyncState({
        holeNumber: 8,
        queued: [{ holeNumber: 8, state: "saving" }],
        serverSynced: true,
      }),
      "saving",
    );
    assert.equal(
      holeSyncState({
        holeNumber: 8,
        queued: [{ holeNumber: 8, state: "offline" }],
        serverSynced: false,
      }),
      "offline",
    );
    assert.equal(holeSyncLabel("saved"), "Saved");
    assert.equal(holeSyncLabel("saving"), "Saving…");
    assert.equal(holeSyncLabel("offline"), "Offline");
    assert.equal(overallSyncLabel(["saved", "saved"]), "Saved");
    assert.equal(overallSyncLabel(["saved", "saving"]), "Saving…");
    assert.equal(overallSyncLabel(["saving", "offline"]), "Offline — will sync");
  });

  it("keeps a finished round arithmetically consistent", () => {
    const round = finishedRound(70, 4, GAME_DAY_COURSE_PAR);
    assert.deepEqual(round, { gross: 70, toPar: -2, net: 66, stableford: 42, thru: 18 });
    assert.equal(
      resultsWinnerLine({
        tab: "net",
        row: round,
        countbackApplied: true,
      }),
      "Net 66 (−6) · won on countback",
    );
  });

  it("formats to-par, board scores, and the v2 winner hero", () => {
    assert.equal(formatToPar(0), "E");
    assert.equal(formatToPar(4), "+4");
    assert.equal(formatToPar(-2), "-2");
    assert.equal(formatToPar(null), "–");
    assert.deepEqual(
      formatBoardScore("stableford", {
        gross: 70,
        toPar: -2,
        net: 64,
        stableford: 38,
      }),
      { primary: "38", suffix: "pts" },
    );
    assert.deepEqual(
      winnerHero("gross", { gross: 68, toPar: 4, net: 60, stableford: 30 }, 18),
      { score: "68", line: "+4", caption: "Gross · 18 holes" },
    );
  });

  it("moves YOU onto a watch-scoped realtime board and ignores stale versions", () => {
    const incoming = board({ version: 3, you: false, access: "watch" });
    const merged = mergeLeaderboard(board({ version: 2, you: false, access: "player" }), incoming, "mike");
    assert.equal(merged.access, "player");
    assert.equal(merged.rankings.gross[0]?.you, true);
    const stale = mergeLeaderboard(merged, board({ version: 1, you: false, access: "watch" }), "mike");
    assert.equal(stale.version, 3);
  });

  it("detects a lead-change row move", () => {
    assert.deepEqual(
      movedPlayerIds(["brandon", "nadia"], ["nadia", "brandon"]),
      ["nadia", "brandon"],
    );
    assert.deepEqual(movedPlayerIds(["nadia"], ["nadia"]), []);
  });

  it("labels Sanity tees and prefers the white tee", () => {
    assert.equal(teeChipLabel({ name: "Rhino", color: "White" }), "Rhino · White");
    assert.equal(teeChipLabel({ name: "White", color: "White" }), "White");
    assert.equal(
      preferredDefaultTee([
        { name: "Elephant", color: "Yellow" },
        { name: "Rhino", color: "White" },
      ]),
      "Rhino",
    );
  });

  it("sends the player's tee and Sanity ratings when a card starts", () => {
    const course: GolfCourseCms = {
      courseName: "Zebula",
      parTotal: 8,
      tees: [
        { name: "Rhino", color: "White", courseRating: 73.2, slopeRating: 129, par: 72 },
        { name: "Zebra", color: "Red", courseRating: 67, slopeRating: 117, par: 72 },
      ],
      holes: [
        { number: 1, par: 4, strokeIndex: 1 },
        { number: 2, par: 4, strokeIndex: 2 },
      ],
    };
    const body = gameDayCardStartBody({
      course,
      teeOptions: ["Rhino"],
      playerTee: "Zebra",
      holesPlayed: 9,
    });
    assert.equal(body, null);
    const eighteen = gameDayCardStartBody({
      course: {
        ...course,
        holes: Array.from({ length: 18 }, (_, index) => ({
          number: index + 1,
          par: 4,
          strokeIndex: index + 1,
        })),
      },
      teeOptions: ["Rhino"],
      playerTee: "Zebra",
    });
    assert.ok(eighteen);
    assert.equal(eighteen?.tees.some((tee) => tee.name === "Zebra"), true);
    assert.equal(eighteen?.tees.find((tee) => tee.name === "Rhino")?.courseRating, 73.2);
    assert.equal(eighteen?.course.holes.length, 18);
  });

  it("badges live players, spectators, and a finished day", () => {
    assert.equal(boardBadge("in_play", "player"), "Live");
    assert.equal(boardBadge("in_play", "watch"), "Watching");
    assert.equal(boardBadge("final", "watch"), "Final");
    const live = board({ version: 1, you: false, access: "watch" });
    live.rankings.stableford[0]!.stableford = 38;
    assert.equal(defaultBoardTab(live), "stableford");
    assert.equal(defaultBoardTab({ ...live, status: "final" }), "net");
    const scratch = {
      ...live,
      status: "final" as const,
      rankings: {
        gross: [{ ...live.rankings.gross[0]!, handicapIndex: null, playingHandicap: null }],
        net: [{ ...live.rankings.net[0]!, handicapIndex: null, playingHandicap: null }],
        stableford: [{ ...live.rankings.stableford[0]!, handicapIndex: null, playingHandicap: null }],
      },
    };
    assert.equal(defaultBoardTab(scratch), "gross");
  });
});

function board(input: {
  version: number;
  you: boolean;
  access: GameDayLeaderboard["access"];
}): GameDayLeaderboard {
  const row = {
    position: "1",
    positionNumber: 1,
    tied: false,
    playerId: "mike",
    displayName: "Mike",
    you: input.you,
    cardId: "card",
    cardNumber: 2,
    handicapIndex: 6,
    playingHandicap: 7,
    thru: 8,
    gross: 32,
    toPar: 0,
    net: 28,
    stableford: null,
    countbackNote: null,
  };
  return {
    gameDayId: "day",
    version: input.version,
    access: input.access,
    status: "in_play",
    format: "stroke",
    venueName: "Zebula Golf Estate & Spa",
    venueCmsId: "zebula",
    date: "2026-11-01",
    dateLabel: "Sat 1 Nov",
    headline: "ZEBULA · SAT 1 NOV",
    cardsConfirmed: 0,
    cardsTotal: 1,
    countback: "last 9, 6, 3, 1",
    countbackApplied: false,
    rankings: { gross: [row], net: [row], stableford: [{ ...row }] },
    podium: null,
    feed: [],
    cards: [],
  };
}
