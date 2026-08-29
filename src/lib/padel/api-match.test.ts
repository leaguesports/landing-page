import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PadelPairing } from "../../types/padel-match.ts";
import {
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
  it("builds a scorecard match from the API create response", () => {
    const match = parseApiMatch(
      {
        id: "api-match-1",
        venueCmsId: "sanity-padel-1",
        startsAt: "2026-08-29T10:00:00.000Z",
        ruleset: "golden_point",
        pairings,
        servingTeam: "B",
        status: "live",
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
    assert.equal(match.servingTeam, "B");
    assert.equal(match.venue?.name, "Padel Social Club");
    assert.equal(match.venueCmsId, "sanity-padel-1");
    assert.equal(match.startsAt, "2026-08-29T10:00:00.000Z");
    assert.equal(match.status, "live");
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
