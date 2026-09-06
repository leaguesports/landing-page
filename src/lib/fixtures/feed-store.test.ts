import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  addFanReply,
  ensureFixtureFeed,
  getFixtureFeed,
  parseMatchSides,
  reactToFeedItem,
  resetFixtureFeedStore,
  setFixtureBoard,
} from "./feed-store.ts";

afterEach(() => {
  resetFixtureFeedStore();
});

describe("parseMatchSides", () => {
  it("parses vs titles", () => {
    assert.deepEqual(parseMatchSides("Springboks vs All Blacks"), {
      home: "Springboks",
      away: "All Blacks",
    });
  });

  it("returns null without a separator", () => {
    assert.equal(parseMatchSides("Monaco Grand Prix"), null);
  });
});

describe("ensureFixtureFeed", () => {
  it("seeds a match scoreboard + venue nudge for rugby", () => {
    const snapshot = ensureFixtureFeed({
      slug: "springboks-vs-all-blacks-2026-09-06",
      title: "Springboks vs All Blacks",
      sportSlug: "rugby",
      venueCount: 3,
    });

    assert.equal(snapshot.fixtureSlug, "springboks-vs-all-blacks-2026-09-06");
    assert.ok(snapshot.board);
    assert.equal(snapshot.board?.kind, "match_score");
    if (snapshot.board?.kind === "match_score") {
      assert.equal(snapshot.board.home.name, "Springboks");
      assert.equal(snapshot.board.away.name, "All Blacks");
      assert.equal(snapshot.board.status, "live");
    }
    assert.ok(snapshot.items.some((item) => item.kind === "venue_nudge"));
    assert.ok(snapshot.items.some((item) => item.kind === "score_update"));
  });

  it("seeds motorsport top-3 for motorsport fixtures", () => {
    const snapshot = ensureFixtureFeed({
      slug: "monaco-grand-prix-2026-05-24",
      title: "Monaco Grand Prix",
      sportSlug: "motorsport",
      venueCount: 0,
    });

    assert.equal(snapshot.board?.kind, "motorsport_top3");
    if (snapshot.board?.kind === "motorsport_top3") {
      assert.equal(snapshot.board.leaders.length, 3);
      assert.equal(snapshot.board.leaders[0]?.pos, 1);
    }
  });

  it("is idempotent for the same slug", () => {
    const first = ensureFixtureFeed({
      slug: "chiefs-vs-pirates",
      title: "Chiefs vs Pirates",
      sportSlug: "soccer",
      venueCount: 1,
    });
    const second = ensureFixtureFeed({
      slug: "chiefs-vs-pirates",
      title: "Chiefs vs Pirates",
      sportSlug: "soccer",
      venueCount: 1,
    });
    assert.equal(first.items[0]?.id, second.items[0]?.id);
  });
});

describe("fan replies and reactions", () => {
  it("prepends fan replies and increments reactions", () => {
    ensureFixtureFeed({
      slug: "demo-fixture",
      title: "Springboks vs All Blacks",
      sportSlug: "rugby",
      venueCount: 2,
    });

    const reply = addFanReply("demo-fixture", "What a try!", "Thabo");
    assert.equal(reply.kind, "fan_reply");
    assert.equal(reply.authorKind, "fan");
    assert.equal(reply.authorLabel, "Thabo");

    const snapshot = getFixtureFeed("demo-fixture");
    assert.equal(snapshot?.items[0]?.id, reply.id);

    const reacted = reactToFeedItem("demo-fixture", reply.id);
    assert.equal(reacted?.reactionCount, 1);
  });

  it("rejects empty replies", () => {
    ensureFixtureFeed({
      slug: "demo-fixture-2",
      title: "A vs B",
      sportSlug: "rugby",
      venueCount: 0,
    });
    assert.throws(() => addFanReply("demo-fixture-2", "   "), /empty/i);
  });
});

describe("setFixtureBoard", () => {
  it("updates the board and appends a score_update item", () => {
    ensureFixtureFeed({
      slug: "live-rugby",
      title: "Springboks vs All Blacks",
      sportSlug: "rugby",
      venueCount: 1,
    });

    const snapshot = setFixtureBoard("live-rugby", {
      kind: "match_score",
      status: "live",
      home: { name: "Springboks", score: 24 },
      away: { name: "All Blacks", score: 17 },
      clock: "67'",
      updatedAt: new Date().toISOString(),
      source: "manual",
    });

    assert.equal(snapshot.board?.kind, "match_score");
    if (snapshot.board?.kind === "match_score") {
      assert.equal(snapshot.board.home.score, 24);
    }
    assert.equal(snapshot.items[0]?.kind, "score_update");
    assert.match(snapshot.items[0]?.body ?? "", /24/);
  });
});
