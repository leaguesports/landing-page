import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canSaveMatch,
  canStepGames,
  canStepTiebreak,
  displayGames,
  emptyPadelSet,
  formatSetLine,
  formatSetsLine,
  isFinishedSet,
  matchWinner,
  replaceSet,
  setWinner,
  setsToSave,
  stepGames,
  stepTiebreak,
  thirdSetOffered,
  tiebreakOpen,
  visibleSetCount,
  type PadelSet,
} from "./padel-score.ts";

function games(
  gamesA: number,
  gamesB: number,
  tiebreakA: number | null = null,
  tiebreakB: number | null = null,
): PadelSet {
  return { gamesA, gamesB, tiebreakA, tiebreakB };
}

function pump(set: PadelSet, side: "A" | "B", times: number): PadelSet {
  let next = set;
  for (let i = 0; i < times; i += 1) next = stepGames(next, side, 1);
  return next;
}

describe("padel set validity", () => {
  it("accepts 6-0 through 6-4, 7-5, and 7-6 only with a tiebreak at 6-6", () => {
    for (const loser of [0, 1, 2, 3, 4]) {
      assert.equal(setWinner(games(6, loser)), "A");
      assert.equal(setWinner(games(loser, 6)), "B");
      assert.equal(isFinishedSet(games(6, loser)), true);
    }
    assert.equal(setWinner(games(7, 5)), "A");
    assert.equal(setWinner(games(5, 7)), "B");
    assert.equal(setWinner(games(6, 6, 7, 5)), "A");
    assert.equal(setWinner(games(6, 6, 5, 7)), "B");
    assert.equal(setWinner(games(6, 6, 10, 8)), "A");
    assert.deepEqual(displayGames(games(6, 6, 7, 5)), { gamesA: 7, gamesB: 6 });
    assert.equal(formatSetLine(games(6, 6, 7, 5)), "7-6 (7-5)");

    assert.equal(setWinner(games(6, 5)), null);
    assert.equal(setWinner(games(5, 5)), null);
    assert.equal(setWinner(games(6, 6)), null);
    assert.equal(setWinner(games(6, 6, 7, 6)), null);
    assert.equal(setWinner(games(6, 6, 5, 3)), null);
    assert.equal(setWinner(games(7, 6)), null);
    assert.equal(setWinner(games(6, 7)), null);
    assert.equal(setWinner(games(7, 6, 5, 7)), null);
    assert.equal(setWinner(games(7, 4)), null);
    assert.equal(setWinner(games(8, 6)), null);
    assert.equal(setWinner(games(6, 4, 7, 0)), "A");
    assert.equal(tiebreakOpen(games(6, 6)), true);
    assert.equal(tiebreakOpen(games(6, 4)), false);
  });

  it("steps game by game and opens the tiebreak only at 6-6", () => {
    let set = emptyPadelSet();
    set = pump(set, "A", 6);
    assert.equal(setWinner(set), "A");
    set = pump(set, "B", 4);
    assert.deepEqual(set, games(6, 4));
    assert.equal(canStepGames(set, "A", 1), false);
    assert.equal(canStepGames(set, "B", 1), true);
    assert.deepEqual(stepGames(set, "B", 1), games(6, 5));

    set = emptyPadelSet();
    set = pump(set, "A", 5);
    set = pump(set, "B", 5);
    set = stepGames(set, "A", 1);
    assert.equal(setWinner(set), null);
    assert.deepEqual(stepGames(set, "A", 1), games(7, 5));
    assert.equal(setWinner(stepGames(set, "A", 1)), "A");
    set = stepGames(set, "B", 1);
    assert.equal(tiebreakOpen(set), true);
    assert.deepEqual(set, games(6, 6, 0, 0));
    assert.equal(canStepGames(set, "A", 1), false);
    assert.equal(canStepGames(set, "B", 1), false);

    for (let i = 0; i < 5; i += 1) {
      set = stepTiebreak(set, "A", 1);
      set = stepTiebreak(set, "B", 1);
    }
    set = stepTiebreak(set, "A", 1);
    set = stepTiebreak(set, "A", 1);
    assert.equal(setWinner(set), "A");
    assert.equal(formatSetLine(set), "7-6 (7-5)");
    assert.equal(canStepTiebreak(set, "A", 1), false);
    assert.equal(canStepTiebreak(set, "B", 1), false);
    assert.deepEqual(stepGames(games(7, 5), "A", 1), games(7, 5));
    assert.deepEqual(stepGames(games(7, 5), "B", 1), games(7, 5));
    assert.deepEqual(stepTiebreak(games(6, 4), "A", 1), games(6, 4));
  });
});

describe("padel best of 3", () => {
  const setOne = games(6, 4);
  const setTwo = games(3, 6);
  const tiebreak = games(6, 6, 7, 5);

  it("offers the third set only at 1-1 and blocks save until there is a winner", () => {
    assert.equal(thirdSetOffered([setOne]), false);
    assert.equal(thirdSetOffered([setOne, games(6, 3)]), false);
    assert.equal(thirdSetOffered([setOne, setTwo]), true);
    assert.equal(visibleSetCount([emptyPadelSet()]), 1);
    assert.equal(visibleSetCount([setOne, emptyPadelSet()]), 2);
    assert.equal(visibleSetCount([setOne, games(6, 2)]), 2);
    assert.equal(visibleSetCount([setOne, setTwo]), 3);
    assert.equal(visibleSetCount([setOne, setTwo, tiebreak]), 3);

    assert.equal(matchWinner([setOne]), null);
    assert.equal(canSaveMatch([setOne]), false);
    assert.equal(matchWinner([setOne, games(6, 3)]), "A");
    assert.equal(canSaveMatch([setOne, games(6, 3)]), true);
    assert.equal(thirdSetOffered([setOne, games(6, 3), tiebreak]), false);
    assert.equal(setsToSave([setOne, games(6, 3), tiebreak])?.length, 2);

    assert.equal(matchWinner([setOne, setTwo]), null);
    assert.equal(canSaveMatch([setOne, setTwo, games(6, 6)]), false);
    assert.equal(matchWinner([setOne, setTwo, tiebreak]), "A");
    assert.equal(canSaveMatch([setOne, setTwo, tiebreak]), true);
    assert.equal(formatSetsLine(setsToSave([setOne, setTwo, tiebreak]) ?? []), "6-4, 3-6, 7-6 (7-5)");
    assert.equal(matchWinner([setOne, setTwo, games(6, 6, 2, 7)]), "B");
    assert.equal(matchWinner([games(6, 5), setTwo, tiebreak]), null);

    const dropped = replaceSet([setOne, setTwo, tiebreak], 1, games(6, 2));
    assert.equal(dropped.length, 2);
    assert.equal(matchWinner(dropped), "A");
    assert.equal(replaceSet([emptyPadelSet()], 1, setOne).length, 1);
  });
});
