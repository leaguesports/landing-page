import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelPairing } from "../../types/padel-match.ts";
import {
  MATCH_API_PROXY_MISS,
  MATCH_API_UNREACHABLE,
  MatchApiError,
  createPadelMatchWith,
  datetimeLocalToIso,
  jsonError,
  listPlayerHistoryWith,
  listVenueHistoryWith,
  lockPadelMatchWith,
  matchApiUnreachableMessage,
  matchWinner,
  parseApiMatch,
  parseHistoryItem,
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

  it("does not POST a match when venue GET fails with a non-404", async () => {
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
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 503);
        assert.equal(err.message, "503 Unable to save venue");
        return true;
      },
    );
    assert.deepEqual(methods, ["GET"]);
  });

  it("POSTs after GET 200 even when the venue body is unparseable", async () => {
    const calls: string[] = [];
    const match = await createPadelMatchWith(createInput, court, {
      baseUrl: "https://api.example.test",
      fetch: async (url, init = {}) => {
        calls.push(`${init.method ?? "GET"} ${String(url)}`);
        if (String(url).includes("/api/venues/")) {
          return jsonResponse(200, { cmsId: "sanity-padel-1" });
        }
        return jsonResponse(201, createdSnapshot);
      },
    });
    assert.equal(match.id, "api-match-1");
    assert.deepEqual(calls, [
      "GET https://api.example.test/api/venues/sanity-padel-1",
      "POST https://api.example.test/api/matches",
    ]);
  });

  it("POSTs after PUT 201 even when the venue body is unparseable", async () => {
    const calls: string[] = [];
    const match = await createPadelMatchWith(createInput, court, {
      baseUrl: "https://api.example.test",
      fetch: async (url, init = {}) => {
        calls.push(`${init.method ?? "GET"} ${String(url)}`);
        if (String(url).includes("/api/venues/")) {
          if (init.method === "PUT") {
            return jsonResponse(201, { ok: true, venue: "created" });
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

  it("rejects an empty venue slug before any HTTP", async () => {
    let called = false;
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, { name: court.name, slug: "  " }, {
          baseUrl: "https://api.example.test",
          fetch: async () => {
            called = true;
            return jsonResponse(200, appVenue);
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 400);
        assert.equal(err.message, "Venue slug is required");
        return true;
      },
    );
    assert.equal(called, false);
  });

  it("rejects a missing venue name before any HTTP", async () => {
    let called = false;
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, { name: " ", slug: court.slug }, {
          baseUrl: "https://api.example.test",
          fetch: async () => {
            called = true;
            return jsonResponse(200, appVenue);
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 400);
        assert.equal(err.message, "Venue name is required");
        return true;
      },
    );
    assert.equal(called, false);
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
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, "404 Venue not found");
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
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 401);
        assert.equal(err.message, "401 Unauthorized");
        assert.equal(err.message.includes("unavailable"), false);
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
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, "404 Cannot POST /api/matches");
        assert.equal(err.message.includes("unavailable"), false);
        return true;
      },
    );
  });

  it("surfaces POST 405 instead of collapsing to unavailable", async () => {
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, court, {
          baseUrl: "https://api.example.test",
          fetch: async (url) => {
            if (String(url).includes("/api/venues/")) {
              return jsonResponse(200, appVenue);
            }
            return jsonResponse(405, { error: "Method Not Allowed" });
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 405);
        assert.equal(err.message, "405 Method Not Allowed");
        return true;
      },
    );
  });

  it("surfaces a network error when POST fetch throws", async () => {
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, court, {
          baseUrl: "https://api.example.test",
          fetch: async (url) => {
            if (String(url).includes("/api/venues/")) {
              return jsonResponse(200, appVenue);
            }
            throw new TypeError("Failed to fetch");
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 0);
        assert.equal(err.message.startsWith(MATCH_API_UNREACHABLE), true);
        assert.match(err.message, /Failed to fetch/);
        assert.match(err.message, /\/api\/matches/);
        return true;
      },
    );
  });

  it("surfaces a network error when venue ensure fetch throws", async () => {
    await assert.rejects(
      () =>
        createPadelMatchWith(createInput, court, {
          baseUrl: "https://api.example.test",
          fetch: async () => {
            throw new TypeError("Failed to fetch");
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 0);
        assert.equal(err.message.startsWith(MATCH_API_UNREACHABLE), true);
        assert.match(err.message, /Failed to fetch/);
        assert.match(err.message, /\/api\/venues\//);
        return true;
      },
    );
  });

  it("accepts unbound window.fetch without Illegal invocation", async () => {
    const calls: string[] = [];
    /**
     * Mimics browsers that reject `deps.fetch(url)` when `fetch` was taken
     * off `window` — `this` must be the global object.
     */
    function browserFetch(
      this: unknown,
      url: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> {
      if (this !== globalThis) {
        throw new TypeError(
          "Failed to execute 'fetch' on 'Window': Illegal invocation",
        );
      }
      calls.push(`${init?.method ?? "GET"} ${String(url)}`);
      if (String(url).includes("/api/venues/")) {
        return Promise.resolve(jsonResponse(200, appVenue));
      }
      return Promise.resolve(jsonResponse(201, createdSnapshot));
    }

    const match = await createPadelMatchWith(createInput, court, {
      baseUrl: "https://api.example.test",
      fetch: browserFetch as typeof fetch,
    });
    assert.equal(match.id, "api-match-1");
    assert.deepEqual(calls, [
      "GET https://api.example.test/api/venues/sanity-padel-1",
      "POST https://api.example.test/api/matches",
    ]);
  });
});

describe("matchApiUnreachableMessage", () => {
  it("keeps a generic message when the proxy target is not local", () => {
    assert.equal(
      matchApiUnreachableMessage({
        NEXT_PUBLIC_API_URL:
          "https://league-sports-api-production.up.railway.app",
      }),
      MATCH_API_UNREACHABLE,
    );
  });

  it("tells local/dev to start league-sports-api on the configured port", () => {
    const message = matchApiUnreachableMessage({
      NEXT_PUBLIC_API_URL: "http://localhost:3100",
    });
    assert.equal(
      message,
      `${MATCH_API_UNREACHABLE} Start league-sports-api on http://localhost:3100 (Postgres required).`,
    );
  });

  it("prefers API_ORIGIN for the local hint", () => {
    const message = matchApiUnreachableMessage({
      API_ORIGIN: "http://127.0.0.1:3100",
      NEXT_PUBLIC_API_URL: "http://localhost:9999",
    });
    assert.equal(message.includes("127.0.0.1:3100"), true);
    assert.equal(message.includes("localhost:9999"), false);
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
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(
          err.message,
          "409 Match is already locked with a different result",
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
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.message, "404 Match not found");
        return true;
      },
    );
  });

  it("surfaces lock 401 status and API error instead of unavailable", async () => {
    await assert.rejects(
      () =>
        lockPadelMatchWith("api-match-1", { score: lockScore, winner: "A" }, {
          baseUrl: "https://api.example.test",
          fetch: async () => jsonResponse(401, { error: "Unauthorized" }),
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 401);
        assert.equal(err.message, "401 Unauthorized");
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
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 404);
        assert.equal(
          err.message,
          "404 Cannot POST /api/matches/api-match-1/lock",
        );
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

const historyPairings = {
  teamA: [
    { slot: "A1", userId: "user-1", displayName: "Alex", isGuest: false },
    { slot: "A2", userId: null, displayName: "Sam (Guest)", isGuest: true },
  ],
  teamB: [
    { slot: "B1", userId: null, displayName: "Jordan (Guest)", isGuest: true },
    { slot: "B2", userId: "user-riley", displayName: "Riley", isGuest: false },
  ],
};

const playerHistoryItem = {
  id: "hist-1",
  startsAt: "2026-08-29T10:00:00.000Z",
  venueCmsId: "sanity-padel-1",
  venueName: "Padel Club",
  venueSlug: "padel-club",
  pairings: historyPairings,
  opponents: [
    { slot: "B1", userId: null, displayName: "Jordan (Guest)", isGuest: true },
    { slot: "B2", userId: "user-riley", displayName: "Riley", isGuest: false },
  ],
  score: lockScore,
  winner: "A",
};

const venueHistoryItem = {
  ...playerHistoryItem,
  id: "hist-2",
  opponents: historyPairings,
};

describe("jsonError", () => {
  it("always prefixes HTTP status and the API error string", () => {
    const unauthorized = jsonError(401, { error: "Unauthorized" });
    assert.equal(unauthorized.status, 401);
    assert.equal(unauthorized.message, "401 Unauthorized");

    const badRequest = jsonError(400, { error: "Invalid match payload" });
    assert.equal(badRequest.message, "400 Invalid match payload");

    const missing = jsonError(404, { error: "Venue not found" });
    assert.equal(missing.message, "404 Venue not found");

    const method = jsonError(405, { error: "Method Not Allowed" });
    assert.equal(method.message, "405 Method Not Allowed");

    const badGateway = jsonError(502, { error: "Bad gateway" });
    assert.equal(badGateway.message, "502 Bad gateway");

    const unavailable = jsonError(503, { error: "Unable to save venue" });
    assert.equal(unavailable.message, "503 Unable to save venue");
    assert.equal(unavailable.message.includes("Match API is unavailable"), false);
  });

  it("uses a proxy-miss hint for HTML or empty bodies", () => {
    const html = jsonError(
      404,
      "<!DOCTYPE html><html><body>Not Found</body></html>",
    );
    assert.equal(html.message, `404 ${MATCH_API_PROXY_MISS}`);

    const empty = jsonError(405, {});
    assert.equal(empty.message, `405 ${MATCH_API_PROXY_MISS}`);
  });
});

describe("parseHistoryItem", () => {
  it("keeps player opponents as the other team", () => {
    const item = parseHistoryItem(playerHistoryItem);
    assert.ok(item);
    assert.equal(item.venueName, "Padel Club");
    assert.equal(item.venueSlug, "padel-club");
    assert.ok(Array.isArray(item.opponents));
    assert.equal(item.opponents.length, 2);
    assert.equal(item.winner, "A");
    assert.equal(item.score?.sets[0]?.gamesA, 6);
  });

  it("keeps venue opponents as both teams", () => {
    const item = parseHistoryItem(venueHistoryItem);
    assert.ok(item);
    assert.equal(Array.isArray(item.opponents), false);
    if (Array.isArray(item.opponents)) throw new Error("expected pairings");
    assert.equal(item.opponents.teamA[0]?.displayName, "Alex");
    assert.equal(item.opponents.teamB[1]?.displayName, "Riley");
  });
});

describe("listPlayerHistoryWith", () => {
  it("GETs /api/matches?playerUserId= and returns locked rows newest first", async () => {
    const calls: string[] = [];
    const items = await listPlayerHistoryWith("user-1", {
      baseUrl: "https://api.example.test",
      fetch: async (url) => {
        calls.push(String(url));
        return jsonResponse(200, [playerHistoryItem]);
      },
    });
    assert.equal(
      calls[0],
      "https://api.example.test/api/matches?playerUserId=user-1",
    );
    assert.equal(items[0]?.id, "hist-1");
    assert.ok(Array.isArray(items[0]?.opponents));
  });

  it("does not call the API without a playerUserId", async () => {
    let called = false;
    await assert.rejects(
      () =>
        listPlayerHistoryWith("  ", {
          baseUrl: "https://api.example.test",
          fetch: async () => {
            called = true;
            return jsonResponse(200, []);
          },
        }),
      (err: Error) => {
        assert.equal(err.message, "playerUserId is required");
        return true;
      },
    );
    assert.equal(called, false);
  });

  it("fails visibly when GET /api/matches is missing", async () => {
    await assert.rejects(
      () =>
        listPlayerHistoryWith("user-1", {
          baseUrl: "https://api.example.test",
          fetch: async () =>
            new Response("Cannot GET /api/matches", { status: 404 }),
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, "404 Cannot GET /api/matches");
        return true;
      },
    );
  });

  it("surfaces 400 when the API rejects a missing playerUserId", async () => {
    await assert.rejects(
      () =>
        listPlayerHistoryWith("user-1", {
          baseUrl: "https://api.example.test",
          fetch: async () =>
            jsonResponse(400, { error: "Invalid match payload" }),
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.message, "400 Invalid match payload");
        return true;
      },
    );
  });
});

describe("listVenueHistoryWith", () => {
  it("GETs /api/venues/:cmsId/matches", async () => {
    const calls: string[] = [];
    const items = await listVenueHistoryWith("sanity-padel-1", {
      baseUrl: "https://api.example.test",
      fetch: async (url) => {
        calls.push(String(url));
        return jsonResponse(200, [venueHistoryItem]);
      },
    });
    assert.equal(
      calls[0],
      "https://api.example.test/api/venues/sanity-padel-1/matches",
    );
    assert.equal(items[0]?.id, "hist-2");
    assert.equal(Array.isArray(items[0]?.opponents), false);
  });

  it("treats unknown cmsId as an empty list", async () => {
    const items = await listVenueHistoryWith("missing-court", {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(200, []),
    });
    assert.deepEqual(items, []);
  });

  it("fails visibly when the venue matches route is undeployed", async () => {
    await assert.rejects(
      () =>
        listVenueHistoryWith("sanity-padel-1", {
          baseUrl: "https://api.example.test",
          fetch: async () =>
            new Response("Cannot GET /api/venues/:cmsId/matches", {
              status: 404,
            }),
        }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, "404 Cannot GET /api/venues/:cmsId/matches");
        return true;
      },
    );
  });
});


