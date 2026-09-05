import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BADGE_CATALOG } from "./catalog.ts";
import { earnedBadgeIds, evaluateBadges } from "./evaluate.ts";

describe("badge catalog", () => {
  it("stays within the v1 cap of eight badges", () => {
    assert.ok(BADGE_CATALOG.length > 0);
    assert.ok(BADGE_CATALOG.length <= 8);
  });
});

describe("evaluateBadges", () => {
  it("starts with nothing earned", () => {
    const evaluated = evaluateBadges({
      padelStats: { locked: 0, wins: 0, recentForm: [] },
      golfLocked: 0,
      friendCount: 0,
      hasSharedScorecard: false,
    });
    assert.equal(evaluated.every((badge) => !badge.earned), true);
  });

  it("unlocks padel lock and win milestones", () => {
    const ids = earnedBadgeIds({
      padelStats: {
        locked: 5,
        wins: 2,
        recentForm: ["W", "L", "W", "W", "L"],
      },
      golfLocked: 0,
      friendCount: 0,
      hasSharedScorecard: false,
    });
    assert.deepEqual(ids.sort(), [
      "first_lock",
      "first_win",
      "hot_form",
      "matches_5",
    ]);
  });

  it("unlocks golf, share, and friend badges from evidence", () => {
    const ids = earnedBadgeIds({
      padelStats: { locked: 1, wins: 0, recentForm: ["L"] },
      golfLocked: 1,
      friendCount: 2,
      hasSharedScorecard: true,
    });
    assert.ok(ids.includes("first_lock"));
    assert.ok(ids.includes("first_golf"));
    assert.ok(ids.includes("whatsapp_share"));
    assert.ok(ids.includes("first_friend"));
    assert.equal(ids.includes("first_win"), false);
  });
});
