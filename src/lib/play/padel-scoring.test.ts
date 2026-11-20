import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decideMatch, setWinner } from "./padel-scoring.ts";

describe("padel-scoring", () => {
  it("accepts finished sets and rejects illegal ones", () => {
    assert.equal(setWinner({ a: 6, b: 4 }), "A");
    assert.equal(setWinner({ a: 7, b: 6 }), "A");
    assert.equal(setWinner({ a: 6, b: 5 }), null);
    assert.equal(setWinner({ a: 8, b: 6 }), null);
  });

  it("decides best-of-3 matches and rejects dangling sets", () => {
    assert.deepEqual(
      decideMatch("best_of_3", [
        { a: 6, b: 4 },
        { a: 6, b: 3 },
      ]),
      { winner: "A", setsWon: { A: 2, B: 0 } },
    );
    assert.equal(
      decideMatch("best_of_3", [
        { a: 6, b: 4 },
        { a: 6, b: 3 },
        { a: 1, b: 0 },
      ]),
      null,
    );
  });
});
