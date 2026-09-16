import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  GolfCourseHole,
  GolfLiveStrokes,
  GolfPlayer,
} from "../../types/golf-round.ts";
import {
  GOLF_SCORE_STEPPER_HIT_PX,
  apiNetStrokesForHole,
  applyStrokeDelta,
  formatHoleProgress,
  formatLiveHoleMeta,
  formatLiveLockHint,
  formatLivePlayingHcp,
  formatRoundInfoPlayerHcp,
  formatRoundInfoRatings,
  formatThisHoleNetLine,
  holeStrokeValue,
  liveCardVisibility,
  liveHeaderShowsStrokeIndex,
  liveHoleNet,
  roundInfoShowsWhsDisclaimer,
  seedHoleStrokesIfEmpty,
  wrapModalFocus,
} from "./live-hole-ui.ts";

const holes: GolfCourseHole[] = [
  { number: 9, par: 5, strokeIndex: 15 },
  { number: 10, par: 4, strokeIndex: 1 },
  { number: 11, par: 3, strokeIndex: 2 },
];

const players: GolfPlayer[] = [
  { slot: 1, displayName: "Alex", isGuest: true, userId: null },
  { slot: 2, displayName: "Sam", isGuest: true, userId: null },
];

describe("live hole header copy", () => {
  it("formats compact Hole · Par without SI by default", () => {
    assert.equal(
      formatLiveHoleMeta({ number: 9, par: 5, strokeIndex: 15 }),
      "Hole 9 · Par 5",
    );
  });

  it("adds SI only when stroke dots need it", () => {
    assert.equal(liveHeaderShowsStrokeIndex([0, 0]), false);
    assert.equal(liveHeaderShowsStrokeIndex([0, 1]), true);
    assert.equal(liveHeaderShowsStrokeIndex([-1]), true);
    assert.equal(
      formatLiveHoleMeta({ number: 9, par: 5, strokeIndex: 15 }, {
        showStrokeIndex: true,
      }),
      "Hole 9 · Par 5 · SI 15",
    );
  });

  it("formats Hole N of M for Round info, not the live header", () => {
    assert.equal(formatHoleProgress(0, 9), "Hole 1 of 9");
    assert.equal(formatHoleProgress(8, 9), "Hole 9 of 9");
  });
});

describe("live card visibility", () => {
  it("hides tee pills, stacked hcp, and hole progress on the live card", () => {
    const single = liveCardVisibility(1);
    const fourball = liveCardVisibility(4);
    for (const chrome of [single, fourball]) {
      assert.equal(chrome.showTeePills, false);
      assert.equal(chrome.showStackedHcp, false);
      assert.equal(chrome.showHoleProgressOnCard, false);
    }
  });

  it("does not duplicate the player name in totals for a single player", () => {
    assert.equal(liveCardVisibility(1).showPlayerNameInTotals, false);
    assert.equal(liveCardVisibility(1).showPlayerNameOnCard, true);
    assert.equal(liveCardVisibility(2).showPlayerNameInTotals, true);
  });

  it("uses less card chrome for a single player", () => {
    assert.equal(liveCardVisibility(1).compactSinglePlayerCard, true);
    assert.equal(liveCardVisibility(2).compactSinglePlayerCard, false);
  });
});

describe("live playing hcp", () => {
  it("shows one quiet Hcp {playing} line", () => {
    assert.equal(formatLivePlayingHcp(11), "Hcp 11");
    assert.equal(formatLivePlayingHcp(0), "Hcp 0");
    assert.equal(formatLivePlayingHcp(null), null);
    assert.equal(formatLivePlayingHcp(undefined), null);
  });

  it("keeps course vs playing detail for Round info", () => {
    assert.equal(
      formatRoundInfoPlayerHcp({
        slot: 1,
        displayName: "Alex",
        isGuest: true,
        courseHandicap: 12,
        playingHandicap: 11,
      }),
      "Course hcp 12 · Playing hcp 11",
    );
  });

  it("formats CR / slope / tee par for Round info", () => {
    assert.equal(
      formatRoundInfoRatings({
        courseRating: 71.2,
        slopeRating: 129,
        teePar: 72,
      }),
      "CR 71.2 · Slope 129 · Par 72",
    );
    assert.equal(formatRoundInfoRatings({}), null);
  });
});

describe("live lock hint", () => {
  it("is hidden until the round is ready to lock", () => {
    assert.equal(formatLiveLockHint(false), null);
    assert.equal(
      formatLiveLockHint(true),
      "All holes scored. Lock to save the round.",
    );
  });
});

describe("round info handicap honesty", () => {
  it("shows the WHS disclaimer only when a playing handicap is snapshotted", () => {
    assert.equal(
      roundInfoShowsWhsDisclaimer([
        { playingHandicap: 11 },
      ]),
      true,
    );
    assert.equal(
      roundInfoShowsWhsDisclaimer([
        { playingHandicap: null },
      ]),
      false,
    );
    assert.equal(
      roundInfoShowsWhsDisclaimer([
        { playingHandicap: undefined },
      ]),
      false,
    );
  });
});

describe("round info modal tab wrap", () => {
  it("wraps Tab from last to first and Shift+Tab from first to last", () => {
    const nodes = ["close", "done"];
    assert.equal(wrapModalFocus(nodes, "done", false), "close");
    assert.equal(wrapModalFocus(nodes, "close", true), "done");
    assert.equal(wrapModalFocus(nodes, "close", false), null);
    assert.equal(wrapModalFocus(nodes, "done", true), null);
    assert.equal(wrapModalFocus([], "close", false), null);
  });
});

describe("this-hole net line", () => {
  it("shows to-par when net is unknown", () => {
    assert.equal(
      formatThisHoleNetLine({ net: null, toParLabel: "+1" }),
      "+1 this hole",
    );
  });

  it("puts net first when present", () => {
    assert.equal(
      formatThisHoleNetLine({ net: 5, toParLabel: "+1" }),
      "Net 5 · +1",
    );
  });
});

describe("discrete stroke stepper", () => {
  it("requires +/- hit targets of at least 44px", () => {
    assert.ok(GOLF_SCORE_STEPPER_HIT_PX >= 44);
  });

  it("steps by 1 and clamps 1–15 without parsing free text", () => {
    assert.equal(applyStrokeDelta(4, 1), 5);
    assert.equal(applyStrokeDelta(4, -1), 3);
    assert.equal(applyStrokeDelta(1, -1), 1);
    assert.equal(applyStrokeDelta(15, 1), 15);
    assert.equal(applyStrokeDelta(4, 0), 4);
  });

  it("defaults missing strokes to par (often 4) and keeps entered scores", () => {
    assert.equal(holeStrokeValue({}, 9, 1, 4), 4);
    assert.equal(holeStrokeValue({ 9: { "1": 6 } }, 9, 1, 4), 6);
  });

  it("seeds an empty hole to par and does not overwrite an in-progress hole", () => {
    const seeded = seedHoleStrokesIfEmpty({}, { number: 9, par: 4 }, players);
    assert.deepEqual(seeded[9], { "1": 4, "2": 4 });

    const existing: GolfLiveStrokes = { 9: { "1": 6 } };
    assert.equal(
      seedHoleStrokesIfEmpty(existing, { number: 9, par: 4 }, players),
      existing,
    );
  });
});

describe("live hole net display", () => {
  it("reads API netStrokes instead of inventing a 9-hole total", () => {
    assert.equal(
      apiNetStrokesForHole(
        {
          holes: [
            { number: 9, strokes: { "1": 6 }, netStrokes: { "1": 5 } },
          ],
        },
        9,
        1,
      ),
      5,
    );
    assert.equal(apiNetStrokesForHole(null, 9, 1), null);
  });

  it("prefers API netStrokes over SI allocation", () => {
    assert.deepEqual(
      liveHoleNet({
        gross: 6,
        playingHandicap: 2,
        holeNumber: 10,
        holes,
        apiNetStrokes: 3,
      }),
      { net: 3, strokesReceived: 3 },
    );
  });

  it("uses SI on the holes being played when the API has no hole net yet", () => {
    assert.deepEqual(
      liveHoleNet({
        gross: 6,
        playingHandicap: 2,
        holeNumber: 10,
        holes,
      }),
      { net: 5, strokesReceived: 1 },
    );
  });
});
