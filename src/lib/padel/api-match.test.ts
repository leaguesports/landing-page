import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelPairing } from "../../types/padel-match.ts";
import {
  MATCH_API_UNAVAILABLE,
  createPadelMatchWith,
  datetimeLocalToIso,
  parseApiMatch,
  toApiPlayer,
  toCreateMatchBody,
  toDatetimeLocalValue,
} from "./api-match.ts";
import { makeGuestPlayer, makeUserPlayer } from "./recent-players.ts";

const pairings: PadelPairing = {
  teamA: [
    makeUserPlayer({ id: "user-1", displayName: "Alex", userId: "user-1" }),
    makeGuestPlayer("Sam"),
  ],
  teamB: [makeGuestPlayer("Jordan"), makeGuestPlayer("Riley")],
};

describe("toCreateMatchBody", () => {
  it("sends venueCmsId, startsAt, ruleset, and pairings — not venue name/slug", () => {
    const body = toCreateMatchBody({
      venueCmsId: "sanity-padel-1",
      startsAt: "2026-08-29T10:00:00.000Z",
      ruleset: "golden_point",
      pairings,
      servingTeam: "A",
    });

    assert.equal(body.venueCmsId, "sanity-padel-1");
    assert.equal(body.startsAt, "2026-08-29T10:00:00.000Z");
    assert.equal(body.ruleset, "golden_point");
    assert.equal(body.servingTeam, "A");
    assert.equal("venue" in body, false);
    assert.equal("name" in body, false);
    assert.equal("slug" in body, false);

    assert.deepEqual(body.pairings.teamA[0], {
      userId: "user-1",
      displayName: "Alex",
      isGuest: false,
    });
    assert.equal(body.pairings.teamA[1].isGuest, true);
    assert.equal(body.pairings.teamA[1].userId, null);
    assert.equal(body.pairings.teamA[1].displayName.includes("Sam"), true);
    assert.equal(body.pairings.teamB.length, 2);
  });

  it("keeps advantage on the create body", () => {
    const body = toCreateMatchBody({
      venueCmsId: "cms-2",
      startsAt: "2026-08-29T11:00:00.000Z",
      ruleset: "advantage",
      pairings,
    });
    assert.equal(body.ruleset, "advantage");
    assert.equal(body.servingTeam, undefined);
  });
});

describe("toApiPlayer", () => {
  it("uses userId for a named account and guest fields otherwise", () => {
    assert.deepEqual(
      toApiPlayer(
        makeUserPlayer({ id: "u", displayName: "Pat", userId: "u" }),
      ),
      { userId: "u", displayName: "Pat", isGuest: false },
    );
    const guest = toApiPlayer(makeGuestPlayer("Kim"));
    assert.equal(guest.isGuest, true);
    assert.equal(guest.userId, null);
    assert.equal(typeof guest.displayName, "string");
  });
});

describe("parseApiMatch", () => {
  it("builds a scorecard match from the API create snapshot (including slots)", () => {
    const match = parseApiMatch(
      {
        id: "api-match-1",
        venueCmsId: "sanity-padel-1",
        startsAt: "2026-08-29T10:00:00.000Z",
        ruleset: "golden_point",
        status: "live",
        servingTeam: "A",
        pairings: {
          teamA: [
            { slot: "A1", userId: null, displayName: "Alex", isGuest: true },
            { slot: "A2", userId: null, displayName: "Sam", isGuest: true },
          ],
          teamB: [
            { slot: "B1", userId: null, displayName: "Jordan", isGuest: true },
            { slot: "B2", userId: null, displayName: "Riley", isGuest: true },
          ],
        },
        score: null,
        winner: null,
        lockedAt: null,
      },
      {
        venue: {
          id: "sanity-padel-1",
          slug: "padel-social-club",
          name: "Padel Social Club",
        },
      },
    );

    assert.ok(match);
    assert.equal(match.id, "api-match-1");
    assert.equal(match.sport, "padel");
    assert.equal(match.ruleset, "golden_point");
    assert.equal(match.servingTeam, "A");
    assert.equal(match.venue?.name, "Padel Social Club");
    assert.equal(match.venueCmsId, "sanity-padel-1");
    assert.equal(match.startsAt, "2026-08-29T10:00:00.000Z");
    assert.equal(match.status, "live");
    assert.equal(match.pairings.teamA[0].displayName, "Alex");
    assert.equal(match.pairings.teamA[0].isGuest, true);
  });

  it("returns null without an id so callers cannot mint an Ably identity", () => {
    assert.equal(
      parseApiMatch({
        venueCmsId: "sanity-padel-1",
        ruleset: "golden_point",
        pairings,
      }),
      null,
    );
  });
});

describe("datetime local helpers", () => {
  it("round-trips a local datetime to ISO", () => {
    const local = toDatetimeLocalValue(new Date("2026-08-29T12:30:00"));
    const iso = datetimeLocalToIso(local);
    assert.ok(iso);
    assert.equal(Number.isNaN(new Date(iso).getTime()), false);
    assert.equal(datetimeLocalToIso(""), null);
  });
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const court = {
  name: "Padel Social Club",
  slug: "padel-social-club",
};

const createInput: Parameters<typeof createPadelMatchWith>[0] = {
  venueCmsId: "sanity-padel-1",
  startsAt: "2026-08-29T10:00:00.000Z",
  ruleset: "golden_point",
  pairings,
  servingTeam: "A",
};

const createdSnapshot = {
  id: "api-match-1",
  venueCmsId: "sanity-padel-1",
  startsAt: "2026-08-29T10:00:00.000Z",
  ruleset: "golden_point",
  status: "live",
  servingTeam: "A",
  pairings: {
    teamA: [
      { slot: "A1", userId: "user-1", displayName: "Alex", isGuest: false },
      { slot: "A2", userId: null, displayName: "Sam (Guest)", isGuest: true },
    ],
    teamB: [
      { slot: "B1", userId: null, displayName: "Jordan (Guest)", isGuest: true },
      { slot: "B2", userId: null, displayName: "Riley (Guest)", isGuest: true },
    ],
  },
  score: null,
  winner: null,
  lockedAt: null,
};

const appVenue = {
  id: "app-1",
  cmsId: "sanity-padel-1",
  name: court.name,
  slug: court.slug,
};

describe("createPadelMatchWith", () => {
  it("GETs the venue with no name/slug, then POSTs the create body", async () => {
    const calls: { url: string; method?: string; body?: string }[] = [];
    const match = await createPadelMatchWith(createInput, court, {
      baseUrl: "https://api.example.test",
      fetch: async (url, init = {}) => {
        calls.push({
          url: String(url),
          method: String(init.method ?? "GET"),
          body: typeof init.body === "string" ? init.body : undefined,
        });
        if (String(url).includes("/api/venues/")) {
          return jsonResponse(200, appVenue);
        }
        return jsonResponse(201, createdSnapshot);
      },
    });

    assert.equal(match.id, "api-match-1");
    assert.equal(calls[0]?.method, "GET");
    assert.equal(calls[0]?.url, "https://api.example.test/api/venues/sanity-padel-1");
    assert.equal(new URL(calls[0]!.url).search, "");
    assert.equal(calls[1]?.method, "POST");
    assert.equal(calls[1]?.url, "https://api.example.test/api/matches");
    const posted = JSON.parse(calls[1]!.body ?? "{}") as Record<string, unknown>;
    assert.equal(posted.venueCmsId, "sanity-padel-1");
    assert.equal("venue" in posted, false);
    assert.equal("name" in posted, false);
    assert.equal("slug" in posted, false);
    const teamA = (posted.pairings as { teamA: { id?: string }[] }).teamA;
    assert.equal("id" in teamA[0]!, false);
  });

  it("PUTs { name, slug } only after GET 404, then creates the match", async () => {
    const calls: string[] = [];
    const match = await createPadelMatchWith(createInput, court, {
      baseUrl: "https://api.example.test",
      fetch: async (url, init = {}) => {
        calls.push(`${init.method ?? "GET"} ${String(url)}`);
        if (String(url).includes("/api/venues/")) {
          if (init.method === "PUT") {
            assert.equal(
              init.body,
              JSON.stringify({ name: court.name, slug: court.slug }),
            );
            return jsonResponse(201, appVenue);
          }
          return jsonResponse(404, { error: "Venue not found" });
        }
        return jsonResponse(201, createdSnapshot);
      },
    });

    assert.equal(match.id, "api-match-1");
    assert.deepEqual(calls, [
      "GET https://api.example.test/api/venues/sanity-padel-1",
      "PUT https://api.example.test/api/venues/sanity-padel-1",
      "POST https://api.example.test/api/matches",
    ]);
  });

  it("does not POST a match when the venue cannot be ensured", async () => {
    const methods: string[] = [];
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, court, {
          baseUrl: "https://api.example.test",
          fetch: async (_url, init = {}) => {
            methods.push(String(init.method ?? "GET"));
            return jsonResponse(503, { error: "Unable to save venue" });
          },
        }),
      (err: Error) => {
        assert.equal(err.message, MATCH_API_UNAVAILABLE);
        return true;
      },
    );
    assert.deepEqual(methods, ["GET"]);
  });

  it("surfaces Venue not found from POST instead of minting an Ably id", async () => {
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, court, {
          baseUrl: "https://api.example.test",
          fetch: async (url) => {
            if (String(url).includes("/api/venues/")) {
              return jsonResponse(200, appVenue);
            }
            return jsonResponse(404, { error: "Venue not found" });
          },
        }),
      (err: Error) => {
        assert.equal(err.message, "Venue not found");
        return true;
      },
    );
  });

  it("fails clearly when POST /api/matches is missing", async () => {
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, court, {
          baseUrl: "https://api.example.test",
          fetch: async (url) => {
            if (String(url).includes("/api/venues/")) {
              return jsonResponse(200, appVenue);
            }
            return new Response("Cannot POST /api/matches", { status: 404 });
          },
        }),
      (err: Error) => {
        assert.equal(err.message, MATCH_API_UNAVAILABLE);
        return true;
      },
    );
  });
});

