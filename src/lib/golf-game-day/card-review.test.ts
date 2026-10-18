import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CARD_REVIEW_BACK_PAR,
  CARD_REVIEW_FRONT_PAR,
  CARD_REVIEW_LINES,
  sumNine,
} from "./fixtures.ts";
import { finishedRound, scoreMark } from "./scoring-ui.ts";

describe("card review scorecard", () => {
  it("matches the transcribed front, back and summary totals", () => {
    assert.equal(sumNine(CARD_REVIEW_FRONT_PAR), 36);
    assert.equal(sumNine(CARD_REVIEW_BACK_PAR), 36);
    assert.equal(sumNine(CARD_REVIEW_FRONT_PAR) + sumNine(CARD_REVIEW_BACK_PAR), 72);

    const expected = [
      { name: "Mike", front: 38, back: 38, gross: 76, net: 70, points: 38, handicap: "hcp 6" },
      { name: "Lerato", front: 48, back: 41, gross: 89, net: null, points: 19, handicap: "no hcp" },
      { name: "Pieter", front: 38, back: 40, gross: 78, net: 66, points: 42, handicap: "hcp 12" },
      { name: "Kabelo", front: 44, back: 46, gross: 90, net: 70, points: 38, handicap: "hcp 20" },
    ];

    assert.equal(CARD_REVIEW_LINES.length, expected.length);
    CARD_REVIEW_LINES.forEach((line, index) => {
      const want = expected[index]!;
      assert.equal(line.name, want.name);
      assert.equal(line.front.length, 9);
      assert.equal(line.back.length, 9);
      assert.equal(sumNine(line.front), want.front);
      assert.equal(sumNine(line.back), want.back);
      const gross = want.front + want.back;
      assert.equal(gross, want.gross);
      const round = finishedRound(gross, line.playingHandicap);
      assert.equal(round.gross, want.gross);
      assert.equal(round.stableford, want.points);
      if (line.handicapIndex == null) {
        assert.equal(want.net, null);
        assert.equal(want.handicap, "no hcp");
      } else {
        assert.equal(round.net, want.net);
      }
    });

    assert.equal(scoreMark(3, 4), "birdie");
    assert.equal(scoreMark(2, 3), "birdie");
    assert.equal(scoreMark(4, 4), "plain");
    assert.equal(scoreMark(5, 4), "plain");
    assert.equal(scoreMark(6, 4), "double");
    assert.equal(scoreMark(7, 5), "double");
  });
});
