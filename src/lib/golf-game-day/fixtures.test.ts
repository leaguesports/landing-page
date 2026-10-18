import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixtureResults } from "./fixtures.ts";
import { GAME_DAY_COURSE_PAR, finishedRound } from "./scoring-ui.ts";

describe("finished results fixture", () => {
  it("orders a completed round and keeps to-par, net and stableford consistent", () => {
    const board = fixtureResults();
    assert.equal(board.status, "final");
    assert.equal(board.cardsConfirmed, 3);
    assert.equal(board.cardsTotal, 3);
    assert.equal(board.countbackApplied, true);
    assert.equal(board.countback, "last 9, 6, 3, 1");

    for (const tab of ["gross", "net", "stableford"] as const) {
      const rows = board.rankings[tab];
      assert.equal(rows.length, 6);
      rows.forEach((row, index) => {
        assert.equal(row.thru, 18);
        assert.equal(row.position, String(index + 1));
        const expected = finishedRound(row.gross ?? 0, row.playingHandicap ?? 0, GAME_DAY_COURSE_PAR);
        assert.equal(row.toPar, expected.toPar);
        assert.equal(row.net, expected.net);
        assert.equal(row.stableford, expected.stableford);
        assert.equal(row.toPar, (row.gross ?? 0) - GAME_DAY_COURSE_PAR);
      });
    }

    const net = board.rankings.net;
    assert.equal(net[0]?.displayName, "Nadia");
    assert.equal(net[0]?.net, 66);
    assert.equal((net[0]?.net ?? 0) - GAME_DAY_COURSE_PAR, -6);
    assert.equal(net[1]?.displayName, "Brandon");
    assert.equal(net[1]?.net, 66);
    assert.equal(net[0]?.countbackNote, "Back nine");
    assert.ok((net[0]?.net ?? 99) <= (net[1]?.net ?? 99));
    assert.ok((net[1]?.net ?? 99) <= (net[2]?.net ?? 99));

    const gross = board.rankings.gross;
    assert.equal(gross[0]?.displayName, "Nadia");
    assert.equal(gross[0]?.gross, 70);
    assert.equal(gross[0]?.toPar, -2);
    for (let index = 1; index < gross.length; index += 1) {
      assert.ok((gross[index - 1]?.gross ?? 0) <= (gross[index]?.gross ?? 0));
    }

    const points = board.rankings.stableford;
    assert.equal(points[0]?.stableford, 42);
    for (let index = 1; index < points.length; index += 1) {
      assert.ok((points[index - 1]?.stableford ?? 0) >= (points[index]?.stableford ?? 0));
    }
  });
});
