import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TEAM_PROXY_SOURCES } from "../teams/teams.ts";
import {
  TOURNAMENT_PROXY_SOURCES,
  TOURNAMENT_SIZES,
  TOURNAMENTS_HREF,
  TOURNAMENTS_NEW_HREF,
  acceptRegistrationWith,
  buildCreateTournamentPayload,
  buildJoinTournamentPayload,
  buildRegisterPayload,
  buildUpdateTournamentPayload,
  canAcceptRegistration,
  canDeleteDraft,
  canEditDraft,
  canGenerateDraw,
  canInviteTeam,
  canOpenRegistration,
  canRegisterTeam,
  canStartFixture,
  canStartTournament,
  canWithdrawRegistration,
  createTournamentWith,
  fixtureNavigateHref,
  formatAcceptedProgress,
  formatRegistrationStatus,
  formatRoundLabel,
  formatTournamentSize,
  formatTournamentSport,
  formatTournamentStatus,
  generateDrawWith,
  getTournamentWith,
  hasDraw,
  inviteTeamWith,
  isTournamentSize,
  joinTournamentWith,
  listMyTournamentsWith,
  listTeamTournamentsWith,
  openRegistrationWith,
  parseMineSnapshot,
  parseSlot,
  parseTournament,
  parseTournamentSize,
  parseTournamentSummary,
  partitionMineLists,
  registerTeamWith,
  slotsByRound,
  startFixtureWith,
  startTournamentWith,
  teamTournamentsUrl,
  tournamentActionUrl,
  tournamentFixtureStartUrl,
  tournamentHref,
  tournamentJoinHref,
  tournamentJoinUrl,
  tournamentMineUrl,
  tournamentRegistrationActionUrl,
  tournamentUrl,
  tournamentsRootUrl,
} from "./tournaments.ts";

const HOME = { id: "t-home", name: "Aces", sport: "padel" as const };
const AWAY = { id: "t-away", name: "Bats", sport: "padel" as const };

function summary(overrides: Record<string, unknown> = {}) {
  return {
    id: "cup-1",
    name: "Sunday Cup",
    sport: "padel",
    size: 4,
    status: "draft",
    venueCmsId: null,
    startsAt: null,
    organizerUserId: "user-org",
    winnerTeamId: null,
    acceptedCount: 0,
    createdAt: "2026-09-08T10:00:00.000Z",
    updatedAt: "2026-09-08T10:00:00.000Z",
    viewer: { role: "organizer", teamId: null },
    ...overrides,
  };
}

function slot(overrides: Record<string, unknown> = {}) {
  return {
    id: "slot-1",
    round: 1,
    position: 1,
    homeTeam: HOME,
    awayTeam: AWAY,
    homeSeed: 1,
    awaySeed: 4,
    teamMatchId: null,
    teamMatchPath: null,
    winnerTeamId: null,
    nextSlotId: "slot-final",
    nextSide: "home",
    ...overrides,
  };
}

function tournament(overrides: Record<string, unknown> = {}) {
  return {
    ...summary(),
    inviteToken: "invite-token-32-chars-long-ok!!",
    registrations: [],
    bracket: { rounds: 2, slots: [] },
    ...overrides,
  };
}

describe("tournament size options", () => {
  it("allows only 4 / 8 / 16 and labels them as team counts", () => {
    assert.deepEqual([...TOURNAMENT_SIZES], [4, 8, 16]);
    assert.equal(isTournamentSize(4), true);
    assert.equal(isTournamentSize(8), true);
    assert.equal(isTournamentSize(16), true);
    assert.equal(isTournamentSize(2), false);
    assert.equal(isTournamentSize(32), false);
    assert.equal(parseTournamentSize("8"), 8);
    assert.equal(parseTournamentSize(" 16 "), 16);
    assert.equal(parseTournamentSize("12"), null);
    assert.equal(formatTournamentSize(4), "4 teams");
    assert.equal(formatTournamentSize(16), "16 teams");
  });
});

describe("tournament status labels", () => {
  it("maps API statuses and round numbers for the bracket", () => {
    assert.equal(formatTournamentStatus("draft"), "Draft");
    assert.equal(formatTournamentStatus("registration"), "Registration");
    assert.equal(formatTournamentStatus("active"), "Active");
    assert.equal(formatTournamentStatus("completed"), "Completed");
    assert.equal(formatTournamentSport("padel"), "Padel");
    assert.equal(formatRegistrationStatus("pending"), "Pending");
    assert.equal(formatAcceptedProgress(2, 4), "2 / 4 accepted");
    assert.equal(formatRoundLabel(1, 4), "Semi-finals");
    assert.equal(formatRoundLabel(2, 4), "Final");
    assert.equal(formatRoundLabel(1, 8), "Quarter-finals");
    assert.equal(formatRoundLabel(2, 8), "Semi-finals");
    assert.equal(formatRoundLabel(3, 8), "Final");
    assert.equal(formatRoundLabel(1, 16), "Round of 16");
    assert.equal(formatRoundLabel(2, 16), "Quarter-finals");
    assert.equal(formatRoundLabel(4, 16), "Final");
  });
});

describe("tournament permission helpers", () => {
  it("gates organizer draft / draw / start and captain entry actions", () => {
    const draft = parseTournament(tournament());
    assert.ok(draft);
    assert.equal(canEditDraft(draft), true);
    assert.equal(canDeleteDraft(draft), true);
    assert.equal(canOpenRegistration(draft), true);
    assert.equal(canInviteTeam(draft), false);
    assert.equal(canGenerateDraw(draft), false);

    const registering = parseTournament(
      tournament({
        status: "registration",
        acceptedCount: 4,
      }),
    );
    assert.ok(registering);
    assert.equal(canInviteTeam(registering), true);
    assert.equal(canGenerateDraw(registering), true);
    assert.equal(canStartTournament(registering), true);
    assert.equal(canEditDraft(registering), false);

    const drawn = parseTournament(
      tournament({
        status: "registration",
        acceptedCount: 4,
        bracket: { rounds: 2, slots: [slot()] },
      }),
    );
    assert.ok(drawn);
    assert.equal(hasDraw(drawn), true);
    assert.equal(canGenerateDraw(drawn), false);
    assert.equal(canStartTournament(drawn), true);

    const active = parseTournament(
      tournament({
        status: "active",
        acceptedCount: 4,
        viewer: { role: "organizer", teamId: null },
        bracket: { rounds: 2, slots: [slot()] },
      }),
    );
    assert.ok(active);
    const parsedSlot = parseSlot(slot());
    assert.ok(parsedSlot);
    assert.equal(canStartFixture(active, parsedSlot), true);

    const captain = parseTournament(
      tournament({
        status: "active",
        viewer: { role: "captain", teamId: HOME.id },
        bracket: { rounds: 2, slots: [slot()] },
      }),
    );
    assert.ok(captain);
    assert.equal(canStartFixture(captain, parsedSlot), true);

    const stranger = parseTournament(
      tournament({
        status: "active",
        viewer: { role: "member", teamId: null },
        bracket: { rounds: 2, slots: [slot()] },
      }),
    );
    assert.ok(stranger);
    assert.equal(canStartFixture(stranger, parsedSlot), false);

    const pending = parseTournament(
      tournament({
        status: "registration",
        viewer: { role: "captain", teamId: HOME.id },
        registrations: [
          {
            team: HOME,
            status: "pending",
            seed: null,
            registeredBy: "user-org",
            createdAt: "2026-09-08T10:00:00.000Z",
            updatedAt: "2026-09-08T10:00:00.000Z",
          },
        ],
      }),
    );
    assert.ok(pending);
    const entry = pending.registrations[0];
    assert.equal(canAcceptRegistration(pending, entry), true);
    assert.equal(canWithdrawRegistration(pending, entry), true);
    assert.equal(canRegisterTeam(pending, HOME.id, "captain"), false);
    assert.equal(canRegisterTeam(pending, AWAY.id, "captain"), true);
    assert.equal(canRegisterTeam(pending, AWAY.id, "member"), false);
  });
});

describe("tournament payload builders", () => {
  it("validates create / update / join / register bodies", () => {
    assert.deepEqual(
      buildCreateTournamentPayload({
        name: " Sunday Cup ",
        sport: "padel",
        size: 4,
        venueCmsId: "sanity-court-1",
      }),
      {
        ok: true,
        payload: {
          name: "Sunday Cup",
          sport: "padel",
          size: 4,
          venueCmsId: "sanity-court-1",
        },
      },
    );
    assert.equal(buildCreateTournamentPayload({ name: "", sport: "padel", size: 4 }).ok, false);
    assert.equal(
      buildCreateTournamentPayload({ name: "Cup", sport: "padel", size: 12 }).ok,
      false,
    );
    assert.equal(
      buildCreateTournamentPayload({ name: "x".repeat(81), sport: "padel", size: 4 }).ok,
      false,
    );
    assert.deepEqual(buildUpdateTournamentPayload({ name: " Night Cup " }), {
      ok: true,
      payload: { name: "Night Cup" },
    });
    assert.equal(buildUpdateTournamentPayload({}).ok, false);
    assert.deepEqual(buildRegisterPayload(" t1 "), {
      ok: true,
      payload: { teamId: "t1" },
    });
    assert.equal(buildRegisterPayload("").ok, false);
    assert.deepEqual(
      buildJoinTournamentPayload({ token: " abc ", teamId: " t1 " }),
      { ok: true, payload: { token: "abc", teamId: "t1" } },
    );
    assert.equal(buildJoinTournamentPayload({ token: "", teamId: "t1" }).ok, false);
  });
});

describe("tournament proxy path order", () => {
  it("lists join and mine before :id, then nested fixture paths", () => {
    const joinIdx = TOURNAMENT_PROXY_SOURCES.indexOf("/api/tournaments/join");
    const mineIdx = TOURNAMENT_PROXY_SOURCES.indexOf("/api/tournaments/mine");
    const idIdx = TOURNAMENT_PROXY_SOURCES.indexOf("/api/tournaments/:id");
    assert.ok(joinIdx >= 0 && joinIdx < idIdx);
    assert.ok(mineIdx >= 0 && mineIdx < idIdx);
    assert.deepEqual([...TOURNAMENT_PROXY_SOURCES], [
      "/api/tournaments",
      "/api/tournaments/join",
      "/api/tournaments/mine",
      "/api/tournaments/:id",
      "/api/tournaments/:id/open-registration",
      "/api/tournaments/:id/register",
      "/api/tournaments/:id/invite",
      "/api/tournaments/:id/registrations/:teamId/accept",
      "/api/tournaments/:id/registrations/:teamId/withdraw",
      "/api/tournaments/:id/registrations/:teamId/decline",
      "/api/tournaments/:id/generate-draw",
      "/api/tournaments/:id/start",
      "/api/tournaments/:id/fixtures/:slotId/start",
    ]);
    assert.ok(TEAM_PROXY_SOURCES.includes("/api/teams/:id/tournaments"));
  });

  it("builds Railway-style URLs without colliding join/mine and :id", () => {
    const origin = "https://api.example.test";
    assert.equal(tournamentsRootUrl(origin), "https://api.example.test/api/tournaments");
    assert.equal(tournamentJoinUrl(origin), "https://api.example.test/api/tournaments/join");
    assert.equal(tournamentMineUrl(origin), "https://api.example.test/api/tournaments/mine");
    assert.equal(tournamentUrl(origin, "c1"), "https://api.example.test/api/tournaments/c1");
    assert.equal(
      tournamentActionUrl(origin, "c1", "open-registration"),
      "https://api.example.test/api/tournaments/c1/open-registration",
    );
    assert.equal(
      tournamentRegistrationActionUrl(origin, "c1", "t1", "accept"),
      "https://api.example.test/api/tournaments/c1/registrations/t1/accept",
    );
    assert.equal(
      tournamentFixtureStartUrl(origin, "c1", "s1"),
      "https://api.example.test/api/tournaments/c1/fixtures/s1/start",
    );
    assert.equal(
      teamTournamentsUrl(origin, "t1"),
      "https://api.example.test/api/teams/t1/tournaments",
    );
    assert.equal(tournamentHref("c1"), "/tournaments/c1");
    assert.equal(tournamentJoinHref("abc"), "/tournaments/join/abc");
    assert.equal(TOURNAMENTS_HREF, "/tournaments");
    assert.equal(TOURNAMENTS_NEW_HREF, "/tournaments/new");
    assert.equal(
      fixtureNavigateHref(parseSlot(slot({ teamMatchId: "m1" }))!),
      "/team-matches/m1",
    );
    assert.equal(fixtureNavigateHref(parseSlot(slot())!), null);
  });
});

describe("tournament parsers and lists", () => {
  it("splits mine into organizing / entered / completed", () => {
    const live = parseTournamentSummary(summary({ id: "a", status: "registration" }));
    const entered = parseTournamentSummary(
      summary({
        id: "b",
        status: "active",
        viewer: { role: "captain", teamId: HOME.id },
      }),
    );
    const done = parseTournamentSummary(summary({ id: "c", status: "completed" }));
    assert.ok(live && entered && done);
    const lists = partitionMineLists({
      organizing: [live, done],
      entered: [entered, done],
    });
    assert.deepEqual(
      lists.organizing.map((row) => row.id),
      ["a"],
    );
    assert.deepEqual(
      lists.entered.map((row) => row.id),
      ["b"],
    );
    assert.deepEqual(
      lists.completed.map((row) => row.id),
      ["c"],
    );

    const grouped = slotsByRound([
      parseSlot(slot({ id: "s2", position: 2 }))!,
      parseSlot(slot({ id: "s1", position: 1 }))!,
      parseSlot(slot({ id: "sf", round: 2, position: 1 }))!,
    ]);
    assert.deepEqual(
      grouped.get(1)?.map((row) => row.id),
      ["s1", "s2"],
    );
    assert.equal(grouped.get(2)?.length, 1);
  });
});

describe("tournament API helpers", () => {
  it("POSTs create to /api/tournaments and join to /join, not :id", async () => {
    const created = await createTournamentWith(
      { name: "Sunday Cup", sport: "padel", size: 4 },
      {
        fetch: async (url, init) => {
          assert.equal(String(url), "https://api.example.test/api/tournaments");
          assert.equal(init?.method, "POST");
          return new Response(JSON.stringify({ tournament: tournament() }), {
            status: 201,
          });
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(created.ok, true);

    const joined = await joinTournamentWith(
      { token: "abc", teamId: HOME.id },
      {
        fetch: async (url, init) => {
          assert.equal(String(url), "https://api.example.test/api/tournaments/join");
          assert.doesNotMatch(String(url), /\/api\/tournaments\/ab/);
          assert.equal(init?.method, "POST");
          return new Response(
            JSON.stringify({
              tournament: tournament({ status: "registration", acceptedCount: 1 }),
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(joined.ok, true);
  });

  it("lists mine and team tournaments, then loads detail", async () => {
    const mine = await listMyTournamentsWith({
      fetch: async (url) => {
        assert.equal(String(url), "https://api.example.test/api/tournaments/mine");
        return new Response(
          JSON.stringify({
            organizing: [summary()],
            entered: [],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(mine.ok, true);
    if (mine.ok) assert.equal(mine.value.organizing[0]?.name, "Sunday Cup");

    const listed = await listTeamTournamentsWith("t-home", {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/teams/t-home/tournaments",
        );
        return new Response(JSON.stringify({ tournaments: [summary()] }), {
          status: 200,
        });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(listed.ok, true);

    const detail = await getTournamentWith("cup-1", {
      fetch: async (url) => {
        assert.equal(String(url), "https://api.example.test/api/tournaments/cup-1");
        return new Response(JSON.stringify({ tournament: tournament() }), {
          status: 200,
        });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(detail.ok, true);
    assert.deepEqual(parseMineSnapshot({ organizing: [summary()], entered: [] }).organizing[0]?.id, "cup-1");
  });

  it("posts organizer and captain actions on nested paths", async () => {
    const opened = await openRegistrationWith("cup-1", {
      fetch: async (url, init) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/tournaments/cup-1/open-registration",
        );
        assert.equal(init?.method, "POST");
        return new Response(
          JSON.stringify({ tournament: tournament({ status: "registration" }) }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(opened.ok, true);

    const registered = await registerTeamWith("cup-1", HOME.id, {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/tournaments/cup-1/register",
        );
        return new Response(
          JSON.stringify({ tournament: tournament({ status: "registration" }) }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(registered.ok, true);

    const invited = await inviteTeamWith("cup-1", AWAY.id, {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/tournaments/cup-1/invite",
        );
        return new Response(
          JSON.stringify({ tournament: tournament({ status: "registration" }) }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(invited.ok, true);

    const accepted = await acceptRegistrationWith("cup-1", HOME.id, {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/tournaments/cup-1/registrations/t-home/accept",
        );
        return new Response(
          JSON.stringify({ tournament: tournament({ status: "registration" }) }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(accepted.ok, true);

    const drawn = await generateDrawWith("cup-1", {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/tournaments/cup-1/generate-draw",
        );
        return new Response(
          JSON.stringify({
            tournament: tournament({
              status: "active",
              bracket: { rounds: 2, slots: [slot()] },
            }),
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(drawn.ok, true);

    const started = await startTournamentWith("cup-1", {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/tournaments/cup-1/start",
        );
        return new Response(
          JSON.stringify({ tournament: tournament({ status: "active" }) }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(started.ok, true);

    const fixture = await startFixtureWith("cup-1", "slot-1", {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/tournaments/cup-1/fixtures/slot-1/start",
        );
        return new Response(
          JSON.stringify({
            tournament: tournament({
              status: "active",
              bracket: {
                rounds: 2,
                slots: [slot({ teamMatchId: "m1", teamMatchPath: "/api/team-matches/m1" })],
              },
            }),
            fixture: {
              slotId: "slot-1",
              teamMatchId: "m1",
              path: "/api/team-matches/m1",
            },
          }),
          { status: 201 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(fixture.ok, true);
    if (fixture.ok) {
      assert.equal(fixture.value.fixture.teamMatchId, "m1");
      assert.equal(fixtureNavigateHref(fixture.value.tournament.bracket.slots[0]), "/team-matches/m1");
    }
  });
});
