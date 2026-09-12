import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getVenueLeaderboardWith,
  parseVenueLeaderboardResponse,
  probeVenueLeaderboardsWith,
} from "./api.ts";
import { appearOnVenueLeaderboardsPutBody } from "./boards.ts";

const emptyBoard = {
  venue: { id: "v1", cmsId: "sanity-court-1", name: "Padel Club" },
  board: "potm",
  window: "month",
  windowKey: "2026-09",
  timezone: "Africa/Johannesburg",
  computedAt: "2026-09-12T10:00:00.000Z",
  first: null,
  entries: [],
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("venue leaderboard API client", () => {
  it("GETs /api/venues/:id/leaderboards with credentials and board query", async () => {
    const calls: Array<{ url: string; credentials?: RequestCredentials }> = [];
    const result = await getVenueLeaderboardWith(
      "sanity-court-1",
      { board: "grinder", window: "all" },
      {
        baseUrl: "https://app.test",
        cookie: "token=abc",
        fetch: async (input, init) => {
          calls.push({
            url: String(input),
            credentials: init?.credentials,
          });
          return jsonResponse(200, {
            ...emptyBoard,
            board: "grinder",
            window: "all",
            windowKey: "all",
            first: {
              rank: 1,
              userId: "user-alex",
              displayName: "Alex P.",
              avatarUrl: null,
              stats: { events: 4 },
            },
            entries: [
              {
                rank: 1,
                userId: "user-alex",
                displayName: "Alex P.",
                avatarUrl: null,
                stats: { events: 4 },
              },
            ],
          });
        },
      },
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.board.first?.displayName, "Alex P.");
      assert.equal(result.board.first?.stats.events, 4);
    }
    assert.equal(
      calls[0]?.url,
      "https://app.test/api/venues/sanity-court-1/leaderboards?board=grinder&window=all",
    );
    assert.equal(calls[0]?.credentials, "include");
  });

  it("treats empty boards as 200 lists, not 404", async () => {
    const result = await getVenueLeaderboardWith(
      "sanity-court-1",
      { board: "potm" },
      {
        baseUrl: "https://app.test",
        fetch: async () => jsonResponse(200, emptyBoard),
      },
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.board.first, null);
      assert.deepEqual(result.board.entries, []);
    }
  });

  it("surfaces 401 Unauthorized without inventing rows", async () => {
    const result = await getVenueLeaderboardWith(
      "sanity-court-1",
      { board: "records" },
      {
        baseUrl: "https://app.test",
        fetch: async () =>
          jsonResponse(401, { error: "Unauthorized" }),
      },
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 401);
      assert.equal(result.error, "Unauthorized");
    }
  });

  it("probes all boards including both grinder windows", async () => {
    const urls: string[] = [];
    await probeVenueLeaderboardsWith("sanity-court-1", {
      baseUrl: "https://app.test",
      fetch: async (input) => {
        urls.push(String(input));
        return jsonResponse(200, emptyBoard);
      },
    });
    assert.deepEqual(urls.sort(), [
      "https://app.test/api/venues/sanity-court-1/leaderboards?board=grinder&window=all",
      "https://app.test/api/venues/sanity-court-1/leaderboards?board=grinder&window=month",
      "https://app.test/api/venues/sanity-court-1/leaderboards?board=potm",
      "https://app.test/api/venues/sanity-court-1/leaderboards?board=records",
      "https://app.test/api/venues/sanity-court-1/leaderboards?board=streak",
    ]);
  });

  it("parses records.golf|padel|darts lists when present", () => {
    const parsed = parseVenueLeaderboardResponse({
      ...emptyBoard,
      board: "records",
      window: "all",
      windowKey: "all",
      records: {
        golf: {
          bestGrossByTee: [
            {
              teeId: "tee-white",
              teeName: "White",
              userId: "user-blake",
              displayName: "Blake G.",
              avatarUrl: null,
              stats: { score: 72, eventId: "g1", lockedAt: "2026-09-01" },
            },
          ],
          bestNetByTee: [],
        },
        padel: { mostWins: [], bestWinStreak: [] },
        darts: { mostWins: [], bestWinStreak: [] },
      },
    });
    assert.equal(parsed?.records?.golf.bestGrossByTee[0]?.stats.score, 72);
    assert.equal(parsed?.records?.golf.bestGrossByTee[0]?.teeName, "White");
  });
});

describe("preferences PUT shape for venue leaderboards opt-out", () => {
  it("PUTs only appearOnVenueLeaderboards", () => {
    assert.deepEqual(appearOnVenueLeaderboardsPutBody(false), {
      appearOnVenueLeaderboards: false,
    });
    assert.deepEqual(appearOnVenueLeaderboardsPutBody(true), {
      appearOnVenueLeaderboards: true,
    });
  });
});
