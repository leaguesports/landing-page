import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  lookupVenueLockedResults,
  VENUE_LOCKED_RESULT_LIMIT,
} from "./locked-results.ts";

const pairings = {
  teamA: [
    { displayName: "Alex", isGuest: false },
    { displayName: "Sam", isGuest: true },
  ],
  teamB: [
    { displayName: "Jordan", isGuest: true },
    { displayName: "Riley", isGuest: false },
  ],
};

function padelRow(id: string, startsAt: string, venueCmsId = "action-padel") {
  return {
    id,
    startsAt,
    venueCmsId,
    venueName: "Action Padel Century City",
    venueSlug: "action-padel-century-city",
    pairings,
    opponents: pairings,
    score: { sets: [{ gamesA: 6, gamesB: 4, tieBreak: null }] },
    winner: "A",
  };
}

describe("lookupVenueLockedResults", () => {
  it("returns the last few locked matches at this venue and no other venue", async () => {
    const calls: string[] = [];
    const results = await lookupVenueLockedResults("action-padel", "padel", {
      baseUrl: "https://api.example.test",
      fetch: async (url) => {
        calls.push(String(url));
        return new Response(
          JSON.stringify([
            padelRow("old", "2026-08-01T10:00:00.000Z"),
            padelRow("mid", "2026-09-01T10:00:00.000Z"),
            padelRow("new", "2026-09-20T10:00:00.000Z"),
            padelRow("newest", "2026-09-28T10:00:00.000Z"),
            padelRow("elsewhere", "2026-09-30T10:00:00.000Z", "other-venue"),
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    });

    assert.equal(
      calls[0],
      "https://api.example.test/api/venues/action-padel/matches",
    );
    assert.equal(VENUE_LOCKED_RESULT_LIMIT, 3);
    assert.deepEqual(
      results.map((item) => item.id),
      ["newest", "new", "mid"],
    );
    assert.equal(results[0]?.href, "/padel/newest");
    assert.equal(results.some((item) => item.href.includes("/venues/")), false);
    assert.equal(
      results.some((item) => item.summary.includes("Action Padel")),
      false,
    );
    assert.match(results[0]?.summary ?? "", /Alex/);
  });

  it("omits the block's data when the venue has no locked matches or the lookup fails", async () => {
    const empty = await lookupVenueLockedResults("action-padel", "padel", {
      baseUrl: "https://api.example.test",
      fetch: async () =>
        new Response("[]", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    });
    assert.deepEqual(empty, []);

    const denied = await lookupVenueLockedResults("action-padel", "padel", {
      baseUrl: "https://api.example.test",
      fetch: async () => new Response("Unauthorized", { status: 401 }),
    });
    assert.deepEqual(denied, []);

    const down = await lookupVenueLockedResults("action-padel", "padel", {
      baseUrl: "https://api.example.test",
      fetch: async () => {
        throw new Error("offline");
      },
    });
    assert.deepEqual(down, []);
  });

  it("does not look up results for a sport without locked matches", async () => {
    let called = false;
    const results = await lookupVenueLockedResults("kart-track", "karting", {
      baseUrl: "https://api.example.test",
      fetch: async () => {
        called = true;
        return new Response("[]", { status: 200 });
      },
    });
    assert.equal(called, false);
    assert.deepEqual(results, []);
  });
});
