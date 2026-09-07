import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  GolfCourseHole,
  GolfLiveStrokes,
  GolfPlayer,
} from "../../types/golf-round.ts";
import {
  buildGolfLockedScorecard,
  golfLayoutLabel,
  golfScorecardColumns,
  scoreRel,
} from "./locked-scorecard.ts";

const PARS = [4, 5, 3, 4, 4, 3, 4, 5, 4, 4, 4, 4, 5, 3, 5, 4, 3, 4] as const;

function eighteenHoles(): GolfCourseHole[] {
  return PARS.map((par, index) => ({
    number: index + 1,
    par,
    strokeIndex: index + 1,
  }));
}

const players: GolfPlayer[] = [
  { slot: 1, displayName: "Alex", isGuest: true, userId: null },
  { slot: 2, displayName: "Sam", isGuest: true, userId: null },
];

describe("scoreRel", () => {
  it("classifies eagle through double bogey", () => {
    assert.equal(scoreRel(2, 4), "eagle");
    assert.equal(scoreRel(3, 4), "birdie");
    assert.equal(scoreRel(4, 4), "par");
    assert.equal(scoreRel(5, 4), "bogey");
    assert.equal(scoreRel(7, 4), "double");
  });
});

describe("golfScorecardColumns", () => {
  it("inserts Out, In, and Tot for an 18-hole card", () => {
    const columns = golfScorecardColumns(eighteenHoles());
    assert.equal(columns.length, 21);
    assert.equal(columns[9]?.kind, "out");
    assert.equal(columns[9]?.label, "Out");
    assert.equal(columns[19]?.kind, "in");
    assert.equal(columns[20]?.kind, "tot");
    assert.deepEqual(
      columns.filter((column) => column.kind === "hole").map((column) => column.label),
      PARS.map((_, index) => String(index + 1)),
    );
  });

  it("adds only Tot for a 9-hole card", () => {
    const columns = golfScorecardColumns(eighteenHoles().slice(0, 9));
    assert.equal(columns.length, 10);
    assert.equal(columns[9]?.kind, "tot");
    assert.equal(
      columns.filter((column) => column.kind === "out" || column.kind === "in")
        .length,
      0,
    );
  });
});

describe("golfLayoutLabel", () => {
  it("labels 18 / front 9 / back 9", () => {
    assert.equal(
      golfLayoutLabel({ holesPlayed: 18, startingHole: 1 }),
      "18 holes",
    );
    assert.equal(
      golfLayoutLabel({ holesPlayed: 9, startingHole: 1 }),
      "Front 9",
    );
    assert.equal(
      golfLayoutLabel({ holesPlayed: 9, startingHole: 10 }),
      "Back 9",
    );
  });

  it("falls back to a hole-range label for custom starts", () => {
    assert.equal(
      golfLayoutLabel({ holesPlayed: 9, startingHole: 5 }),
      "Play holes 5–13",
    );
  });
});

describe("buildGolfLockedScorecard", () => {
  const holes = eighteenHoles();
  const strokes: GolfLiveStrokes = {};
  for (const hole of holes) {
    strokes[hole.number] = {
      "1": hole.par,
      "2": hole.number === 3 ? hole.par - 1 : hole.par + 1,
    };
  }

  it("totals Out / In / Tot against par", () => {
    const card = buildGolfLockedScorecard(players, strokes, holes);
    const alex = card.players[0];
    const sam = card.players[1];
    assert.ok(alex);
    assert.ok(sam);

    const out = card.columns.findIndex((column) => column.kind === "out");
    const inn = card.columns.findIndex((column) => column.kind === "in");
    const tot = card.columns.findIndex((column) => column.kind === "tot");

    assert.equal(card.parRow[out]?.display, "36");
    assert.equal(card.parRow[inn]?.display, "36");
    assert.equal(card.parRow[tot]?.display, "72");
    assert.equal(alex.cells[out]?.display, "36");
    assert.equal(alex.cells[tot]?.display, "72");
    assert.equal(alex.toPar, 0);
    assert.equal(sam.cells[tot]?.strokes, 72 - 1 + 17);
    assert.equal(sam.isLeader, false);
    assert.equal(alex.isLeader, true);
  });

  it("marks birdie / bogey on hole cells and leaves totals unmarked", () => {
    const card = buildGolfLockedScorecard(players, strokes, holes);
    const hole3 = card.columns.findIndex(
      (column) => column.kind === "hole" && column.hole?.number === 3,
    );
    assert.equal(card.players[1]?.cells[hole3]?.rel, "birdie");
    const hole1 = card.columns.findIndex(
      (column) => column.kind === "hole" && column.hole?.number === 1,
    );
    assert.equal(card.players[1]?.cells[hole1]?.rel, "bogey");
    const tot = card.columns.findIndex((column) => column.kind === "tot");
    assert.equal(card.players[0]?.cells[tot]?.rel, null);
  });

  it("shows a dash when a hole has no strokes", () => {
    const partial: GolfLiveStrokes = { 1: { "1": 5 } };
    const nine = holes.slice(0, 9);
    const card = buildGolfLockedScorecard(players.slice(0, 1), partial, nine);
    assert.equal(card.players[0]?.cells[0]?.display, "5");
    assert.equal(card.players[0]?.cells[1]?.display, "—");
    const tot = card.columns.findIndex((column) => column.kind === "tot");
    assert.equal(card.players[0]?.cells[tot]?.display, "5");
  });
});
