import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixtureLeaderboard, fixtureResults } from "./fixtures.ts";
import {
  GAME_DAY_COURSE_PAR,
  finishedRound,
  midRound,
  resultsRowDetail,
  resultsTiebreakLine,
  resultsToParCell,
} from "./scoring-ui.ts";

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
    const gross = board.rankings.gross;
    const points = board.rankings.stableford;
    assert.equal(net[0]?.displayName, "Pieter");
    assert.equal(net[0]?.net, 66);
    assert.equal((net[0]?.net ?? 0) - GAME_DAY_COURSE_PAR, -6);
    assert.equal(net[1]?.displayName, "Nadia");
    assert.equal(net[1]?.net, 66);
    assert.equal(net[0]?.countbackNote, "Won countback");
    assert.equal(net[1]?.countbackNote, "Lost countback (last 9)");
    assert.equal(resultsToParCell("net", net[0]!).text, "−6");
    assert.equal(resultsToParCell("net", net[0]!).under, true);
    assert.equal(resultsToParCell("gross", net[0]!).text, "+6");
    assert.equal(resultsToParCell("gross", gross[0]!).text, "+4");
    assert.equal(resultsToParCell("stableford", points[0]!).text, "42");
    assert.equal(resultsToParCell("stableford", points[0]!).under, false);
    assert.equal(resultsRowDetail(net[0]!, net, "net"), "Won countback");
    assert.equal(resultsRowDetail(net[1]!, net, "net"), "Lost countback (last 9)");
    assert.equal(resultsRowDetail(net[2]!, net, "net"), "hcp 18");
    assert.equal(resultsTiebreakLine(net, "net"), "Tied with Nadia on 66; better last 9.");
    assert.equal(resultsRowDetail(gross[0]!, gross, "gross"), "hcp 6");
    assert.equal(resultsTiebreakLine(gross, "gross"), null);
    assert.ok((net[0]?.net ?? 99) <= (net[1]?.net ?? 99));
    assert.ok((net[1]?.net ?? 99) <= (net[2]?.net ?? 99));

    assert.equal(gross[0]?.displayName, "Mike");
    assert.equal(gross[0]?.gross, 76);
    assert.equal(gross[0]?.toPar, 4);
    for (let index = 1; index < gross.length; index += 1) {
      assert.ok((gross[index - 1]?.gross ?? 0) <= (gross[index]?.gross ?? 0));
    }

    assert.equal(points[0]?.stableford, 42);
    for (let index = 1; index < points.length; index += 1) {
      assert.ok((points[index - 1]?.stableford ?? 0) >= (points[index]?.stableford ?? 0));
    }
  });
});

describe("live leaderboard fixture", () => {
  it("keeps a 10-player mid-round consistent and marks ties", () => {
    const board = fixtureLeaderboard("player");
    const rows = board.rankings.stableford;
    assert.equal(rows.length, 10);
    assert.equal(rows[0]?.displayName, "Nadia");
    assert.equal(rows[0]?.position, "1");
    assert.equal(rows[0]?.stableford, 28);
    assert.equal(rows[0]?.move, 5);
    assert.equal(rows[1]?.position, "T2");
    assert.equal(rows[1]?.tied, true);
    assert.equal(rows[2]?.position, "T2");
    for (const row of rows) {
      const expected = midRound({
        gross: row.gross ?? 0,
        parSoFar: (row.gross ?? 0) - (row.toPar ?? 0),
        shotsReceived: (row.gross ?? 0) - (row.net ?? 0),
        thru: row.thru,
      });
      assert.equal(row.stableford, expected.stableford);
      assert.equal(row.toPar, expected.toPar);
      assert.equal(row.net, expected.net);
    }
  });
});
