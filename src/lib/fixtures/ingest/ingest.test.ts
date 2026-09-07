import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { canonicalGpId, canonicalTeamId, teamsMatch } from "./aliases.ts";
import {
  boardFromMatch,
  boardsEquivalent,
  isMaterialBoardChange,
} from "./apply.ts";
import { matchFixturesToUpdates } from "./match.ts";
import { ingestLiveFixtureBoards } from "./poll.ts";
import type { IngestFixture, ProviderLiveUpdate } from "./types.ts";
import { filterLiveWindow } from "./window.ts";
import {
  ensureFixtureFeed,
  resetFixtureFeedStore,
  setFixtureBoard,
} from "../feed-store.ts";

afterEach(() => {
  resetFixtureFeedStore();
});

const rugbyFixture: IngestFixture = {
  slug: "springboks-vs-all-blacks-2026-09-06",
  title: "Springboks vs All Blacks",
  sportSlug: "rugby",
  startsAt: "2026-09-06T15:00:00.000Z",
};

const rugbyUpdate = (
  overrides: Partial<ProviderLiveUpdate> & {
    match?: ProviderLiveUpdate["match"];
  } = {},
): ProviderLiveUpdate => ({
  provider: "api-sports",
  providerEventId: "rugby:1",
  sportFamily: "match",
  status: "live",
  startsAt: "2026-09-06T15:00:00.000Z",
  clock: "54'",
  period: "2nd half",
  match: {
    home: "South Africa",
    away: "New Zealand",
    homeScore: 17,
    awayScore: 14,
  },
  ...overrides,
});

describe("team aliases", () => {
  it("maps Springboks / All Blacks onto country names", () => {
    assert.equal(canonicalTeamId("Springboks"), canonicalTeamId("South Africa"));
    assert.equal(canonicalTeamId("All Blacks"), canonicalTeamId("New Zealand"));
    assert.equal(teamsMatch("Chiefs", "Kaizer Chiefs"), true);
    assert.equal(teamsMatch("Springboks", "All Blacks"), false);
  });

  it("maps F1 meeting titles onto a circuit id", () => {
    assert.equal(canonicalGpId("Italian Grand Prix"), "monza");
    assert.equal(canonicalGpId("Monaco GP", "Monte Carlo"), "monaco");
  });
});

describe("live window", () => {
  it("includes a rugby match around kickoff and skips distant ones", () => {
    const now = new Date("2026-09-06T16:00:00.000Z");
    const live = filterLiveWindow(
      [
        rugbyFixture,
        { ...rugbyFixture, slug: "later", startsAt: "2026-09-20T15:00:00.000Z" },
      ],
      now,
    );
    assert.deepEqual(
      live.map((row) => row.slug),
      ["springboks-vs-all-blacks-2026-09-06"],
    );
  });
});

describe("matchFixturesToUpdates", () => {
  it("matches Springboks vs All Blacks even when the provider swaps sides", () => {
    const [row] = matchFixturesToUpdates(
      [rugbyFixture],
      [
        rugbyUpdate({
          match: {
            home: "New Zealand",
            away: "South Africa",
            homeScore: 14,
            awayScore: 17,
          },
        }),
      ],
    );
    assert.ok(row);
    assert.equal(row.swapped, true);
    const board = boardFromMatch(row);
    assert.equal(board?.kind, "match_score");
    if (board?.kind === "match_score") {
      assert.equal(board.home.name, "Springboks");
      assert.equal(board.away.name, "All Blacks");
      assert.equal(board.home.score, 17);
      assert.equal(board.away.score, 14);
    }
  });

  it("matches an F1 meeting by grand prix name", () => {
    const [row] = matchFixturesToUpdates(
      [
        {
          slug: "italian-grand-prix-2026-09-07",
          title: "Italian Grand Prix",
          sportSlug: "motorsport",
          startsAt: "2026-09-07T13:00:00.000Z",
          series: "f1",
        },
      ],
      [
        {
          provider: "openf1",
          providerEventId: "openf1:1",
          sportFamily: "motorsport",
          status: "live",
          startsAt: "2026-09-07T13:00:00.000Z",
          motorsport: {
            meetingName: "Italian Grand Prix",
            circuit: "Monza",
            leaders: [
              { pos: 1, driver: "NOR", team: "McLaren", gap: "—" },
              { pos: 2, driver: "VER", team: "Red Bull", gap: "+2.1s" },
              { pos: 3, driver: "LEC", team: "Ferrari", gap: "+5.4s" },
            ],
            sessionLabel: "Race",
          },
        },
      ],
    );
    assert.ok(row);
    assert.equal(row.update.motorsport?.leaders[0]?.driver, "NOR");
  });

  it("does not pair a rugby fixture with an F1 update", () => {
    const matched = matchFixturesToUpdates(
      [rugbyFixture],
      [
        {
          provider: "openf1",
          providerEventId: "openf1:1",
          sportFamily: "motorsport",
          status: "live",
          startsAt: rugbyFixture.startsAt,
          motorsport: {
            meetingName: "Italian Grand Prix",
            leaders: [],
          },
        },
      ],
    );
    assert.equal(matched.length, 0);
  });
});

describe("board apply helpers", () => {
  it("treats clock ticks as non-material", () => {
    const live = {
      kind: "match_score" as const,
      status: "live" as const,
      home: { name: "Springboks", score: 17 },
      away: { name: "All Blacks", score: 14 },
      clock: "54'",
      period: "2nd half",
      updatedAt: "2026-09-06T16:00:00.000Z",
      source: "provider:api-sports",
    };
    const ticked = { ...live, clock: "55'", updatedAt: "2026-09-06T16:01:00.000Z" };
    assert.equal(isMaterialBoardChange(live, ticked), false);
    assert.equal(boardsEquivalent(live, ticked), false);
    assert.equal(
      isMaterialBoardChange(live, { ...ticked, home: { ...live.home, score: 24 } }),
      true,
    );
  });
});

describe("ingestLiveFixtureBoards", () => {
  it("skips provider calls when nothing is in the live window", async () => {
    let fetched = false;
    const summary = await ingestLiveFixtureBoards({
      now: new Date("2026-09-01T10:00:00.000Z"),
      listFixtures: async () => [rugbyFixture],
      fetchUpdates: async () => {
        fetched = true;
        return { updates: [], errors: [] };
      },
    });
    assert.equal(summary.liveFixtures, 0);
    assert.equal(fetched, false);
  });

  it("applies a matched rugby score onto the live board", async () => {
    ensureFixtureFeed({
      slug: rugbyFixture.slug,
      title: rugbyFixture.title,
      sportSlug: "rugby",
      venueCount: 1,
    });
    const summary = await ingestLiveFixtureBoards({
      now: new Date("2026-09-06T16:00:00.000Z"),
      listFixtures: async () => [rugbyFixture],
      fetchUpdates: async () => ({ updates: [rugbyUpdate()], errors: [] }),
    });
    assert.equal(summary.matched, 1);
    assert.equal(summary.applied[0]?.action, "announced");
    const board = summary.applied[0]?.board;
    assert.equal(board?.kind, "match_score");
    if (board?.kind === "match_score") {
      assert.equal(board.home.name, "Springboks");
      assert.equal(board.home.score, 17);
      assert.equal(board.source, "provider:api-sports");
    }
  });

  it("does not re-announce an identical score", async () => {
    const board = {
      kind: "match_score" as const,
      status: "live" as const,
      home: { name: "Springboks", score: 17 },
      away: { name: "All Blacks", score: 14 },
      clock: "54'",
      period: "2nd half",
      updatedAt: "2026-09-06T16:00:00.000Z",
      source: "provider:api-sports",
    };
    ensureFixtureFeed({
      slug: rugbyFixture.slug,
      title: rugbyFixture.title,
      sportSlug: "rugby",
      venueCount: 0,
    });
    setFixtureBoard(rugbyFixture.slug, board);
    const summary = await ingestLiveFixtureBoards({
      now: new Date("2026-09-06T16:00:00.000Z"),
      listFixtures: async () => [rugbyFixture],
      fetchUpdates: async () => ({ updates: [rugbyUpdate()], errors: [] }),
    });
    assert.equal(summary.applied[0]?.action, "skipped");
  });
});
