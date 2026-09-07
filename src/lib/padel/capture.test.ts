import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CapturePadelMatchInput, PadelPairing } from "../../types/padel-match.ts";
import { MatchApiError } from "./api-match.ts";
import {
  capturePadelMatchWith,
  inferPadelMatchWinner,
  inferPadelSetWinner,
  toCapturePadelMatchBody,
} from "./capture.ts";
import { makeGuestPlayer, makeUserPlayer } from "./recent-players.ts";

const pairings: PadelPairing = {
  teamA: [
    makeUserPlayer({ id: "user-1", displayName: "Alex", userId: "user-1" }),
    makeGuestPlayer("Sam"),
  ],
  teamB: [makeGuestPlayer("Jordan"), makeGuestPlayer("Riley")],
};

const captureInput: CapturePadelMatchInput = {
  venueCmsId: "sanity-padel-1",
  playedAt: "2026-08-29T10:00:00.000Z",
  ruleset: "golden_point",
  pairings,
  servingTeam: "A",
  score: {
    sets: [{ gamesA: 6, gamesB: 4 }],
  },
  winner: "A",
};

const lockedSnapshot = {
  id: "captured-1",
  venueCmsId: "sanity-padel-1",
  startsAt: "2026-08-29T10:00:00.000Z",
  ruleset: "golden_point",
  status: "locked",
  servingTeam: "A",
  pairings: {
    teamA: [
      { slot: "A1", userId: "user-1", displayName: "Alex", isGuest: false },
      { slot: "A2", userId: null, displayName: "Sam", isGuest: true },
    ],
    teamB: [
      { slot: "B1", userId: null, displayName: "Jordan", isGuest: true },
      { slot: "B2", userId: null, displayName: "Riley", isGuest: true },
    ],
  },
  score: {
    sets: [{ gamesA: 6, gamesB: 4, tieBreak: null, winner: "A" }],
  },
  winner: "A",
  lockedAt: "2026-09-07T04:30:00.000Z",
};

const appVenue = {
  id: "app-1",
  cmsId: "sanity-padel-1",
  name: "Padel Social Club",
  slug: "padel-social-club",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("inferPadelSetWinner / inferPadelMatchWinner", () => {
  it("infers from games when winner is omitted", () => {
    assert.equal(inferPadelSetWinner({ gamesA: 6, gamesB: 4 }), "A");
    assert.equal(inferPadelSetWinner({ gamesA: 3, gamesB: 6 }), "B");
    assert.equal(
      inferPadelSetWinner({
        gamesA: 7,
        gamesB: 6,
        tieBreak: { pointsA: 7, pointsB: 5 },
      }),
      "A",
    );
    assert.equal(inferPadelSetWinner({ gamesA: 6, gamesB: 6 }), null);
  });

  it("prefers an explicit match winner", () => {
    assert.equal(
      inferPadelMatchWinner([{ gamesA: 6, gamesB: 4 }], "B"),
      "B",
    );
    assert.equal(inferPadelMatchWinner([{ gamesA: 6, gamesB: 4 }]), "A");
  });
});

describe("toCapturePadelMatchBody", () => {
  it("builds the capture contract with playedAt and inferred set winner", () => {
    const body = toCapturePadelMatchBody(captureInput);
    assert.equal(body.venueCmsId, "sanity-padel-1");
    assert.equal(body.playedAt, "2026-08-29T10:00:00.000Z");
    assert.equal("startsAt" in body, false);
    assert.equal(body.ruleset, "golden_point");
    assert.equal(body.winner, "A");
    assert.deepEqual(body.score.sets[0], {
      gamesA: 6,
      gamesB: 4,
      tieBreak: null,
      winner: "A",
    });
    assert.equal(body.pairings.teamA[0]?.isGuest, false);
    assert.equal(body.pairings.teamA[0]?.userId, "user-1");
    assert.equal("id" in body.pairings.teamA[0]!, false);
  });

  it("prefers startsAt when both times are sent", () => {
    const body = toCapturePadelMatchBody({
      ...captureInput,
      startsAt: "2026-08-29T09:00:00.000Z",
    });
    assert.equal(body.startsAt, "2026-08-29T09:00:00.000Z");
    assert.equal("playedAt" in body, false);
  });

  it("rejects missing venue, time, sets, or winner", () => {
    assert.throws(
      () => toCapturePadelMatchBody({ ...captureInput, venueCmsId: "  " }),
      (err: unknown) => {
        assert.ok(err instanceof MatchApiError);
        assert.equal(err.status, 400);
        assert.match(err.message, /Venue cmsId/);
        return true;
      },
    );
    assert.throws(
      () =>
        toCapturePadelMatchBody({
          ...captureInput,
          playedAt: undefined,
          startsAt: undefined,
        }),
      /startsAt or playedAt is required/,
    );
    assert.throws(
      () =>
        toCapturePadelMatchBody({
          ...captureInput,
          score: { sets: [] },
        }),
      /At least one set/,
    );
    assert.throws(
      () =>
        toCapturePadelMatchBody({
          ...captureInput,
          winner: "C" as CapturePadelMatchInput["winner"],
          score: { sets: [{ gamesA: 6, gamesB: 6 }] },
        }),
      /winner A or B/,
    );
  });
});

describe("capturePadelMatchWith", () => {
  it("ensures the venue then POSTs /api/matches/capture", async () => {
    const calls: { url: string; method?: string; body?: string }[] = [];
    const match = await capturePadelMatchWith(
      captureInput,
      { name: "Padel Social Club", slug: "padel-social-club" },
      {
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
          return jsonResponse(201, lockedSnapshot);
        },
      },
    );

    assert.equal(match.id, "captured-1");
    assert.equal(match.status, "finalized");
    assert.equal(match.winner, "A");
    assert.equal(calls[1]?.method, "POST");
    assert.equal(
      calls[1]?.url,
      "https://api.example.test/api/matches/capture",
    );
    const posted = JSON.parse(calls[1]?.body ?? "{}") as Record<string, unknown>;
    assert.equal(posted.venueCmsId, "sanity-padel-1");
    assert.equal(posted.playedAt, "2026-08-29T10:00:00.000Z");
    assert.equal(posted.winner, "A");
  });

  it("surfaces 401 / 403 / 404 / 400 from the capture route", async () => {
    async function rejectStatus(status: number, error: string) {
      await assert.rejects(
        () =>
          capturePadelMatchWith(
            captureInput,
            { name: "Padel Social Club", slug: "padel-social-club" },
            {
              baseUrl: "https://api.example.test",
              fetch: async (url) => {
                if (String(url).includes("/api/venues/")) {
                  return jsonResponse(200, appVenue);
                }
                return jsonResponse(status, { error });
              },
            },
          ),
        (err: unknown) => {
          assert.ok(err instanceof MatchApiError);
          assert.equal(err.status, status);
          assert.match(err.message, new RegExp(error));
          return true;
        },
      );
    }

    await rejectStatus(401, "Unauthorized");
    await rejectStatus(403, "Session user must be a seated player");
    await rejectStatus(404, "Venue not found");
    await rejectStatus(400, "startsAt or playedAt is required");
  });
});
