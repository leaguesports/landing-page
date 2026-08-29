import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelPairing } from "../../types/padel-match.ts";
import {
  MATCH_API_UNAVAILABLE,
  createPadelMatchWith,
  datetimeLocalToIso,
  lockPadelMatchWith,
  matchWinner,
  parseApiMatch,
  preferMatchSnapshot,
  toApiPlayer,
  toCreateMatchBody,
  toDatetimeLocalValue,
  toLockMatchBody,
} from "./api-match.ts";
import { createInitialPadelMatch } from "./padelReducer.ts";
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

  it("applies locked score, winner, and lockedAt from the API snapshot", () => {
    const match = parseApiMatch({
      id: "locked-1",
      venueCmsId: "sanity-padel-1",
      startsAt: "2026-08-29T10:00:00.000Z",
      ruleset: "golden_point",
      status: "locked",
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
      score: {
        sets: [
          { gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" },
          { gamesA: 3, gamesB: 6, tieBreak: null, winner: "B" },
          {
            gamesA: 7,
            gamesB: 6,
            tieBreak: { pointsA: 7, pointsB: 5 },
            winner: "A",
          },
        ],
      },
      winner: "A",
      lockedAt: "2026-08-29T11:00:00.000Z",
    });

    assert.ok(match);
    assert.equal(match.status, "finalized");
    assert.equal(match.winner, "A");
    assert.equal(match.lockedAt, "2026-08-29T11:00:00.000Z");
    assert.equal(match.sets.length, 3);
    assert.equal(match.sets[0]?.gamesA, 6);
    assert.equal(match.sets[2]?.tieBreak?.pointsA, 7);
    assert.equal(match.sets[2]?.winner, "A");
    assert.equal(toLockMatchBody(match)?.winner, "A");
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

  it("fails clearly when POST /api/matches is unauthorized (route not deployed)", async () => {
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, court, {
          baseUrl: "https://api.example.test",
          fetch: async (url) => {
            if (String(url).includes("/api/venues/")) {
              return jsonResponse(200, appVenue);
            }
            return jsonResponse(401, { error: "Unauthorized" });
          },
        }),
      (err: Error) => {
        assert.equal(err.message, MATCH_API_UNAVAILABLE);
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

const lockScore = {
  sets: [
    { gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" as const },
    { gamesA: 3, gamesB: 6, tieBreak: null, winner: "B" as const },
    {
      gamesA: 7,
      gamesB: 6,
      tieBreak: { pointsA: 7, pointsB: 5 },
      winner: "A" as const,
    },
  ],
};

function scoredMatch() {
  const match = createInitialPadelMatch({
    id: "api-match-1",
    ruleset: "golden_point",
    venue: { id: "sanity-padel-1", slug: "padel-social-club", name: "Padel Social Club" },
    pairings,
    servingTeam: "A",
    startsAt: "2026-08-29T10:00:00.000Z",
    venueCmsId: "sanity-padel-1",
  });
  match.sets = [
    { gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" },
    { gamesA: 3, gamesB: 6, tieBreak: null, winner: "B" },
    {
      gamesA: 7,
      gamesB: 6,
      tieBreak: { pointsA: 7, pointsB: 5 },
      winner: "A",
    },
  ];
  match.currentSetIndex = 2;
  match.status = "finalized";
  return match;
}

describe("toLockMatchBody", () => {
  it("maps live scorecard sets into the lock contract, including tie-break", () => {
    const body = toLockMatchBody(scoredMatch());
    assert.deepEqual(body, { score: lockScore, winner: "A" });
    assert.equal(body?.score.sets[0]?.tieBreak, null);
    assert.equal(JSON.stringify(body).includes("\"tieBreak\":null"), true);
  });

  it("returns null when no team has won a set", () => {
    const match = createInitialPadelMatch({
      id: "live-1",
      ruleset: "golden_point",
      venue: null,
      pairings,
    });
    assert.equal(toLockMatchBody(match), null);
    assert.equal(matchWinner(match), null);
  });

  it("picks the team with more set wins before the match is finalized", () => {
    const match = createInitialPadelMatch({
      id: "early-end",
      ruleset: "advantage",
      venue: null,
      pairings,
    });
    match.sets = [
      { gamesA: 6, gamesB: 4, tieBreak: null, winner: "B" },
      { gamesA: 2, gamesB: 1, tieBreak: null, winner: null },
    ];
    const body = toLockMatchBody(match);
    assert.equal(body?.winner, "B");
    assert.equal(body?.score.sets[1]?.winner, null);
  });
});

const lockedSnapshot = {
  ...createdSnapshot,
  status: "locked",
  score: lockScore,
  winner: "A",
  lockedAt: "2026-08-29T11:00:00.000Z",
};

describe("lockPadelMatchWith", () => {
  it("POSTs score and winner to /api/matches/:id/lock", async () => {
    const calls: { url: string; method?: string; body?: string }[] = [];
    const match = await lockPadelMatchWith("api-match-1", { score: lockScore, winner: "A" }, {
      baseUrl: "https://api.example.test",
      venue: { id: "sanity-padel-1", slug: court.slug, name: court.name },
      fetch: async (url, init = {}) => {
        calls.push({
          url: String(url),
          method: String(init.method ?? "GET"),
          body: typeof init.body === "string" ? init.body : undefined,
        });
        return jsonResponse(200, lockedSnapshot);
      },
    });

    assert.equal(match.id, "api-match-1");
    assert.equal(match.status, "finalized");
    assert.equal(match.lockedAt, "2026-08-29T11:00:00.000Z");
    assert.equal(match.winner, "A");
    assert.equal(match.venue?.name, court.name);
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.method, "POST");
    assert.equal(
      calls[0]?.url,
      "https://api.example.test/api/matches/api-match-1/lock",
    );
    const posted = JSON.parse(calls[0]!.body ?? "{}") as Record<string, unknown>;
    assert.equal(posted.winner, "A");
    assert.equal("name" in posted, false);
    assert.equal("slug" in posted, false);
    assert.deepEqual(posted.score, lockScore);
  });

  it("treats a second identical lock as 200", async () => {
    const match = await lockPadelMatchWith("api-match-1", { score: lockScore, winner: "A" }, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(200, lockedSnapshot),
    });
    assert.equal(match.lockedAt, "2026-08-29T11:00:00.000Z");
  });

  it("surfaces 409 when already locked with a different result", async () => {
    await assert.rejects(
      () =>
        lockPadelMatchWith("api-match-1", { score: lockScore, winner: "A" }, {
          baseUrl: "https://api.example.test",
          fetch: async () =>
            jsonResponse(409, {
              error: "Match is already locked with a different result",
            }),
        }),
      (err: Error) => {
        assert.equal(
          err.message,
          "Match is already locked with a different result",
        );
        return true;
      },
    );
  });

  it("surfaces 404 when the match is missing", async () => {
    await assert.rejects(
      () =>
        lockPadelMatchWith("missing", { score: lockScore, winner: "A" }, {
          baseUrl: "https://api.example.test",
          fetch: async () => jsonResponse(404, { error: "Match not found" }),
        }),
      (err: Error) => {
        assert.equal(err.message, "Match not found");
        return true;
      },
    );
  });

  it("maps undeployed lock route 401 to Match API is unavailable", async () => {
    await assert.rejects(
      () =>
        lockPadelMatchWith("api-match-1", { score: lockScore, winner: "A" }, {
          baseUrl: "https://api.example.test",
          fetch: async () => jsonResponse(401, { error: "Unauthorized" }),
        }),
      (err: Error) => {
        assert.equal(err.message, MATCH_API_UNAVAILABLE);
        return true;
      },
    );
  });

  it("fails visibly when POST lock is 404 (route not on Railway yet)", async () => {
    await assert.rejects(
      () =>
        lockPadelMatchWith("api-match-1", { score: lockScore, winner: "A" }, {
          baseUrl: "https://api.example.test",
          fetch: async () =>
            new Response("Cannot POST /api/matches/api-match-1/lock", {
              status: 404,
            }),
        }),
      (err: Error) => {
        assert.equal(err.message, MATCH_API_UNAVAILABLE);
        return true;
      },
    );
  });
});

describe("preferMatchSnapshot", () => {
  it("prefers a locked API snapshot over a newer Ably live score", () => {
    const fromApi = scoredMatch();
    fromApi.lockedAt = "2026-08-29T11:00:00.000Z";
    fromApi.version = 1;
    const fromAbly = createInitialPadelMatch({
      id: "api-match-1",
      ruleset: "golden_point",
      venue: null,
      pairings,
    });
    fromAbly.version = 40;
    const chosen = preferMatchSnapshot(fromApi, fromAbly);
    assert.equal(chosen?.lockedAt, "2026-08-29T11:00:00.000Z");
    assert.equal(chosen?.version, 1);
  });

  it("uses the newer Ably snapshot while the match is still live", () => {
    const fromApi = createInitialPadelMatch({
      id: "m1",
      ruleset: "golden_point",
      venue: null,
      pairings,
    });
    fromApi.status = "live";
    fromApi.version = 1;
    const fromAbly = { ...fromApi, version: 12 };
    assert.equal(preferMatchSnapshot(fromApi, fromAbly)?.version, 12);
  });
});


