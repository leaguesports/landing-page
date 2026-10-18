import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  GAME_DAY_ID_PATTERN,
  REALTIME_PUBLISH_SPORTS,
  golfGameDayChannel,
  publishSportGrant,
} from "./token-policy.ts";

const GAME_DAY_ID = "8c2f0a1e-6b4d-4a1e-8f3a-0b1c2d3e4f50";

describe("golf game day realtime grant", () => {
  it("uses the PR #74 uuid pattern", () => {
    assert.equal(
      GAME_DAY_ID_PATTERN.source,
      "^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    );
    assert.equal(GAME_DAY_ID_PATTERN.flags, "i");
  });

  it("grants subscribe and history on one channel", () => {
    const granted = golfGameDayChannel(`  ${GAME_DAY_ID.toUpperCase()}  `);
    assert.equal(granted.ok, true);
    if (!granted.ok) return;
    assert.equal(granted.channelPattern, `golf-gameday:${GAME_DAY_ID.toUpperCase()}`);
    assert.deepEqual(granted.capabilities, ["subscribe", "history"]);
    assert.equal(granted.capabilities.includes("publish"), false);
    assert.equal(granted.capabilities.includes("presence"), false);
    assert.equal(granted.channelPattern.endsWith(":*"), false);
  });

  it("rejects missing, wildcard, and non-uuid game day ids", () => {
    for (const value of ["", "   ", "*", "golf-gameday:*", "not-a-uuid", "8c2f0a1e-6b4d-4a1e-1f3a-0b1c2d3e4f50"]) {
      const granted = golfGameDayChannel(value);
      assert.equal(granted.ok, false, value);
      if (granted.ok) continue;
      assert.equal(granted.error, "Invalid game day");
      assert.equal(granted.status, 400);
    }
  });
});

describe("realtime publish sport allowlist", () => {
  it("lists the live scorecard sports", () => {
    assert.deepEqual(REALTIME_PUBLISH_SPORTS, ["padel", "golf", "darts"]);
  });

  it("keeps publish on the wildcard only for allowlisted sports", () => {
    for (const sport of REALTIME_PUBLISH_SPORTS) {
      const granted = publishSportGrant(sport, null);
      assert.equal(granted.ok, true);
      if (!granted.ok) continue;
      assert.equal(granted.channelPattern, `${sport}:*`);
      assert.equal(granted.capabilities.includes("publish"), true);
    }
  });

  it("keeps publish on a match channel for allowlisted sports", () => {
    const granted = publishSportGrant("padel", "match_abc");
    assert.equal(granted.ok, true);
    if (!granted.ok) return;
    assert.equal(granted.channelPattern, "padel:match_abc");
    assert.deepEqual(granted.capabilities, [
      "publish",
      "subscribe",
      "presence",
      "history",
    ]);
  });

  it("does not grant publish on ${sport}:* for unknown sports", () => {
    for (const sport of ["soccer", "golf-gameday", "*", "fixture", "padel ", "../admin"]) {
      const wildcard = publishSportGrant(sport, null);
      const match = publishSportGrant(sport, "match_abc");
      assert.equal(wildcard.ok, false, sport);
      assert.equal(match.ok, false, sport);
      if (wildcard.ok || match.ok) continue;
      assert.equal(wildcard.error, "Unknown sport");
      assert.equal(wildcard.status, 400);
      assert.equal("channelPattern" in wildcard, false);
    }
  });
});

describe("token route golf-gameday branch", () => {
  it("sits before the matchId publish branch and is subscribe/history only", () => {
    const source = readFileSync(
      new URL("../../app/api/realtime/token/route.ts", import.meta.url),
      "utf8",
    );
    const gameDay = source.indexOf('sport === "golf-gameday"');
    const matchId = source.indexOf("} else if (matchId)");
    assert.ok(gameDay > 0);
    assert.ok(matchId > gameDay);
    assert.match(source, /golfGameDayChannel\(searchParams\.get\("gameDayId"\)\)/);
    assert.match(source, /Invalid game day/);
    assert.doesNotMatch(
      source,
      /golf-gameday:\*/,
    );
  });
});
