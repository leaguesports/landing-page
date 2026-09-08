import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TEAM_PROXY_SOURCES } from "../teams/teams.ts";
import {
  LINEUP_RULES,
  TEAM_MATCH_PROXY_SOURCES,
  TEAM_MATCHES_HREF,
  TEAM_MATCHES_NEW_HREF,
  acceptTeamMatchWith,
  buildCompletePayload,
  buildCreateChallengePayload,
  buildJoinChallengePayload,
  buildLineupPayload,
  buildSchedulePayload,
  canAcceptChallenge,
  canCancelMatch,
  canCompleteMatch,
  canCreateChallenge,
  canDeclineChallenge,
  canScheduleMatch,
  canSetLineup,
  canStartMatch,
  createTeamMatchWith,
  datetimeLocalToIso,
  describeLineupSizeError,
  formatLineupRule,
  formatTeamMatchSport,
  formatTeamMatchStatus,
  formatTeamMatchVersus,
  getTeamMatchWith,
  isReadyToStart,
  isUpcomingStatus,
  isoToDatetimeLocal,
  joinTeamMatchWith,
  lineupSizeValid,
  lineupsReady,
  listMyTeamMatchesWith,
  listTeamMatchesWith,
  parseMineSnapshot,
  parseScorecard,
  parseTeamMatch,
  parseTeamMatchPreview,
  partitionTeamMatches,
  scorecardNavigatePath,
  searchTeamsWith,
  shouldSearchTeams,
  CHALLENGE_TOKEN_STASH_PREFIX,
  TEAM_SEARCH_MIN_QUERY,
  challengeTokenStashKey,
  toTeamMatchPreview,
  setTeamMatchLineupWith,
  startBlockedReason,
  startTeamMatchWith,
  teamMatchActionUrl,
  teamMatchHref,
  teamMatchJoinHref,
  teamMatchJoinUrl,
  teamMatchMineUrl,
  teamMatchNewHref,
  teamMatchUrl,
  teamMatchesForTeamUrl,
  teamMatchesRootUrl,
  teamsSearchUrl,
  venueRequiredToStart,
} from "./team-matches.ts";

const HOME = { id: "t-home", name: "Sunday Smash", sport: "padel" as const };
const AWAY = { id: "t-away", name: "Night Walls", sport: "padel" as const };

const ALEX = {
  id: "u1",
  displayName: "Alex",
  handle: "alex",
  avatarUrl: null,
};
const AVERY = {
  id: "u2",
  displayName: "Avery",
  handle: "avery",
  avatarUrl: null,
};
const BLAKE = {
  id: "u3",
  displayName: "Blake",
  handle: "blake",
  avatarUrl: null,
};
const BLAIR = {
  id: "u4",
  displayName: "Blair",
  handle: "blair",
  avatarUrl: null,
};

function match(overrides: Record<string, unknown> = {}) {
  return {
    id: "m1",
    sport: "padel",
    status: "pending",
    homeTeam: HOME,
    awayTeam: AWAY,
    venueCmsId: "sanity-court-1",
    startsAt: null,
    challengeToken: null,
    lineups: { home: [], away: [] },
    scorecard: null,
    winnerTeamId: null,
    createdBy: "u1",
    createdAt: "2026-09-08T10:00:00.000Z",
    updatedAt: "2026-09-08T10:00:00.000Z",
    viewer: { role: "home_staff", teamId: HOME.id },
    ...overrides,
  };
}

describe("team match lineup rules", () => {
  it("is 2 vs 2 for padel, 1–2 same size for golf, 1 vs 1 for darts", () => {
    assert.deepEqual(LINEUP_RULES.padel, { min: 2, max: 2 });
    assert.deepEqual(LINEUP_RULES.golf, { min: 1, max: 2 });
    assert.deepEqual(LINEUP_RULES.darts, { min: 1, max: 1 });
    assert.equal(lineupSizeValid("padel", 2), true);
    assert.equal(lineupSizeValid("padel", 1), false);
    assert.equal(lineupSizeValid("golf", 1), true);
    assert.equal(lineupSizeValid("golf", 2), true);
    assert.equal(lineupSizeValid("golf", 3), false);
    assert.equal(lineupSizeValid("darts", 1), true);
    assert.equal(lineupSizeValid("darts", 2), false);
    assert.equal(formatLineupRule("padel"), "2 vs 2");
    assert.equal(formatLineupRule("golf"), "1–2 per side, same size");
    assert.equal(formatLineupRule("darts"), "1 vs 1");
    assert.match(describeLineupSizeError("padel", 1) ?? "", /2 player/);
    assert.equal(describeLineupSizeError("golf", 2), null);
  });

  it("requires matching golf lineup sizes and a venue for padel/golf start", () => {
    const golfUneven = parseTeamMatch(
      match({
        sport: "golf",
        status: "scheduled",
        homeTeam: { ...HOME, sport: "golf" },
        awayTeam: { ...AWAY, sport: "golf" },
        lineups: { home: [ALEX, AVERY], away: [BLAKE] },
      }),
    );
    assert.ok(golfUneven);
    assert.equal(lineupsReady(golfUneven), false);
    assert.equal(isReadyToStart(golfUneven), false);
    assert.equal(startBlockedReason(golfUneven), "Golf lineups must be the same size");

    const padelReady = parseTeamMatch(
      match({
        status: "scheduled",
        lineups: { home: [ALEX, AVERY], away: [BLAKE, BLAIR] },
      }),
    );
    assert.ok(padelReady);
    assert.equal(lineupsReady(padelReady), true);
    assert.equal(isReadyToStart(padelReady), true);
    assert.equal(venueRequiredToStart("padel"), true);
    assert.equal(venueRequiredToStart("golf"), true);
    assert.equal(venueRequiredToStart("darts"), false);

    const noVenue = parseTeamMatch(
      match({
        status: "scheduled",
        venueCmsId: null,
        lineups: { home: [ALEX, AVERY], away: [BLAKE, BLAIR] },
      }),
    );
    assert.ok(noVenue);
    assert.equal(isReadyToStart(noVenue), false);
    assert.equal(startBlockedReason(noVenue), "venueCmsId is required to start");
  });
});

describe("team match status labels", () => {
  it("labels the closed status enum", () => {
    assert.equal(formatTeamMatchStatus("pending"), "Pending");
    assert.equal(formatTeamMatchStatus("scheduled"), "Scheduled");
    assert.equal(formatTeamMatchStatus("live"), "Live");
    assert.equal(formatTeamMatchStatus("completed"), "Completed");
    assert.equal(formatTeamMatchStatus("declined"), "Declined");
    assert.equal(formatTeamMatchStatus("cancelled"), "Cancelled");
    assert.equal(formatTeamMatchSport("padel"), "Padel");
    assert.equal(isUpcomingStatus("live"), true);
    assert.equal(isUpcomingStatus("completed"), false);
  });

  it("splits upcoming vs recent the same way as /mine", () => {
    const pending = parseTeamMatch(match())!;
    const done = parseTeamMatch(match({ id: "m2", status: "completed" }))!;
    const split = partitionTeamMatches([pending, done]);
    assert.deepEqual(
      split.upcoming.map((row) => row.id),
      ["m1"],
    );
    assert.deepEqual(
      split.recent.map((row) => row.id),
      ["m2"],
    );
    assert.equal(formatTeamMatchVersus(pending), "Sunday Smash vs Night Walls");
    assert.equal(
      formatTeamMatchVersus(parseTeamMatch(match({ awayTeam: null }))!),
      "Sunday Smash vs Open challenge",
    );
  });
});

describe("team match permission helpers", () => {
  it("gates create/accept/lineup/start to owner or captain staff", () => {
    assert.equal(canCreateChallenge("owner"), true);
    assert.equal(canCreateChallenge("captain"), true);
    assert.equal(canCreateChallenge("member"), false);

    const homePending = parseTeamMatch(match())!;
    const awayPending = parseTeamMatch(
      match({ viewer: { role: "away_staff", teamId: AWAY.id } }),
    )!;
    const memberPending = parseTeamMatch(
      match({ viewer: { role: "member", teamId: HOME.id } }),
    )!;

    assert.equal(canAcceptChallenge(homePending), false);
    assert.equal(canAcceptChallenge(awayPending), true);
    assert.equal(canDeclineChallenge(awayPending), true);
    assert.equal(canAcceptChallenge(memberPending), false);
    assert.equal(canCancelMatch(homePending), true);
    assert.equal(canCancelMatch(awayPending), false);
    assert.equal(canScheduleMatch(homePending), true);
    assert.equal(canSetLineup(homePending), true);
    assert.equal(canSetLineup(homePending, AWAY.id), false);
    assert.equal(canSetLineup(awayPending, AWAY.id), true);
    assert.equal(canSetLineup(memberPending), false);
    assert.equal(canStartMatch(homePending), false);

    const ready = parseTeamMatch(
      match({
        status: "scheduled",
        lineups: { home: [ALEX, AVERY], away: [BLAKE, BLAIR] },
      }),
    )!;
    assert.equal(canStartMatch(ready), true);
    assert.equal(
      canStartMatch(
        parseTeamMatch(
          match({
            status: "scheduled",
            lineups: { home: [ALEX, AVERY], away: [BLAKE, BLAIR] },
            viewer: { role: "member", teamId: HOME.id },
          }),
        )!,
      ),
      false,
    );
    assert.equal(
      canCompleteMatch(parseTeamMatch(match({ status: "live" }))!),
      true,
    );
  });
});

describe("team match payload builders", () => {
  it("creates a targeted challenge or an open link, never both required", () => {
    assert.deepEqual(
      buildCreateChallengePayload({
        homeTeamId: " t-home ",
        awayTeamId: " t-away ",
      }),
      { ok: true, payload: { homeTeamId: "t-home", awayTeamId: "t-away" } },
    );
    assert.deepEqual(
      buildCreateChallengePayload({
        homeTeamId: "t-home",
        generateChallengeLink: true,
      }),
      {
        ok: true,
        payload: { homeTeamId: "t-home", generateChallengeLink: true },
      },
    );
    assert.equal(buildCreateChallengePayload({ homeTeamId: "" }).ok, false);
    assert.equal(
      buildCreateChallengePayload({ homeTeamId: "t-home" }).ok,
      false,
    );
    assert.equal(
      buildCreateChallengePayload({
        homeTeamId: "t-home",
        awayTeamId: "t-home",
      }).ok,
      false,
    );
  });

  it("builds join, schedule, lineup, and complete bodies", () => {
    assert.deepEqual(buildJoinChallengePayload({ token: " ab ", teamId: " t1 " }), {
      ok: true,
      payload: { token: "ab", teamId: "t1" },
    });
    assert.equal(buildJoinChallengePayload({ token: "", teamId: "t1" }).ok, false);
    assert.deepEqual(buildSchedulePayload({ startsAt: "2026-09-08T18:00:00.000Z" }), {
      ok: true,
      payload: { startsAt: "2026-09-08T18:00:00.000Z" },
    });
    assert.deepEqual(buildSchedulePayload({ venueCmsId: "  " }), {
      ok: true,
      payload: { venueCmsId: null },
    });
    assert.equal(buildSchedulePayload({}).ok, false);
    assert.deepEqual(
      buildLineupPayload({ userIds: [" u1 ", "u1", "u2"] }, "padel"),
      { ok: true, payload: { userIds: ["u1", "u2"] } },
    );
    assert.equal(buildLineupPayload({ userIds: ["u1"] }, "padel").ok, false);
    assert.deepEqual(buildCompletePayload(" t-away "), { winnerTeamId: "t-away" });
    assert.deepEqual(buildCompletePayload(null), {});
  });
});

describe("team match proxy path order", () => {
  it("lists join and mine before :id", () => {
    const joinIdx = TEAM_MATCH_PROXY_SOURCES.indexOf("/api/team-matches/join");
    const mineIdx = TEAM_MATCH_PROXY_SOURCES.indexOf("/api/team-matches/mine");
    const idIdx = TEAM_MATCH_PROXY_SOURCES.indexOf("/api/team-matches/:id");
    assert.ok(joinIdx >= 0 && joinIdx < idIdx);
    assert.ok(mineIdx >= 0 && mineIdx < idIdx);
    assert.deepEqual([...TEAM_MATCH_PROXY_SOURCES], [
      "/api/team-matches",
      "/api/team-matches/join",
      "/api/team-matches/mine",
      "/api/team-matches/:id",
      "/api/team-matches/:id/lineup",
      "/api/team-matches/:id/accept",
      "/api/team-matches/:id/decline",
      "/api/team-matches/:id/start",
      "/api/team-matches/:id/cancel",
      "/api/team-matches/:id/complete",
    ]);
  });

  it("adds teams/search before :id and teams/:id/matches", () => {
    const searchIdx = TEAM_PROXY_SOURCES.indexOf("/api/teams/search");
    const idIdx = TEAM_PROXY_SOURCES.indexOf("/api/teams/:id");
    assert.ok(searchIdx >= 0 && searchIdx < idIdx);
    assert.ok(TEAM_PROXY_SOURCES.includes("/api/teams/:id/matches"));
  });

  it("builds Railway-style URLs without colliding join/mine and :id", () => {
    const origin = "https://api.example.test";
    assert.equal(teamMatchesRootUrl(origin), "https://api.example.test/api/team-matches");
    assert.equal(teamMatchJoinUrl(origin), "https://api.example.test/api/team-matches/join");
    assert.equal(teamMatchMineUrl(origin), "https://api.example.test/api/team-matches/mine");
    assert.equal(teamMatchUrl(origin, "m1"), "https://api.example.test/api/team-matches/m1");
    assert.equal(
      teamMatchActionUrl(origin, "m1", "start"),
      "https://api.example.test/api/team-matches/m1/start",
    );
    assert.equal(
      teamMatchesForTeamUrl(origin, "t1"),
      "https://api.example.test/api/teams/t1/matches",
    );
    assert.equal(
      teamsSearchUrl(origin, "padel", "Night"),
      "https://api.example.test/api/teams/search?sport=padel&q=Night",
    );
    assert.equal(teamMatchHref("m1"), "/team-matches/m1");
    assert.equal(teamMatchNewHref("t1"), "/team-matches/new?teamId=t1");
    assert.equal(teamMatchNewHref(), TEAM_MATCHES_NEW_HREF);
    assert.equal(teamMatchJoinHref("abc"), "/team-matches/join/abc");
    assert.equal(TEAM_MATCHES_HREF, "/team-matches");
    assert.equal(scorecardNavigatePath({ sport: "padel", id: "p1" }), "/padel/p1");
    assert.equal(scorecardNavigatePath({ sport: "golf", id: "g_2" }), "/golf/g_2");
    assert.equal(scorecardNavigatePath({ sport: "darts", id: "d-3" }), "/darts/d-3");
    assert.equal(scorecardNavigatePath({ sport: "padel", id: "../x" }), null);
    assert.equal(scorecardNavigatePath({ sport: "padel", id: "p1 id" }), null);
    assert.equal(scorecardNavigatePath(null), null);
    assert.deepEqual(parseScorecard({ sport: "padel", id: "p1" }), {
      sport: "padel",
      id: "p1",
    });
    assert.deepEqual(
      parseScorecard({ sport: "padel", id: "p1", path: "/login?returnTo=/" }),
      { sport: "padel", id: "p1" },
    );
    assert.equal(parseScorecard({ sport: "padel" }), null);
  });
});

describe("team match parsers and datetime helpers", () => {
  it("parses a public match and rejects unknown sports/statuses", () => {
    const parsed = parseTeamMatch(match());
    assert.equal(parsed?.homeTeam.name, "Sunday Smash");
    assert.equal(parseTeamMatch({ ...match(), sport: "pool" }), null);
    assert.equal(parseTeamMatch({ ...match(), status: "open" }), null);
    assert.deepEqual(parseMineSnapshot({ upcoming: [match()], recent: [] }).upcoming[0]?.id, "m1");
  });

  it("drops challengeToken unless this is the POST create parse", () => {
    const withToken = match({ challengeToken: "tok_create_1" });
    assert.equal(parseTeamMatch(withToken)?.challengeToken, null);
    assert.equal(
      parseTeamMatch(withToken, { keepChallengeToken: true })?.challengeToken,
      "tok_create_1",
    );
    const mine = parseMineSnapshot({ upcoming: [withToken], recent: [] });
    assert.deepEqual(mine.upcoming[0], {
      id: "m1",
      sport: "padel",
      status: "pending",
      startsAt: null,
      homeName: "Sunday Smash",
      awayName: "Night Walls",
    });
    assert.equal("challengeToken" in (mine.upcoming[0] ?? {}), false);
    assert.equal("lineups" in (mine.upcoming[0] ?? {}), false);
    assert.deepEqual(toTeamMatchPreview(parseTeamMatch(withToken)!).awayName, "Night Walls");
    const brokenLineup = {
      id: "m-preview",
      sport: "padel",
      status: "live",
      startsAt: "2026-09-08T18:00:00.000Z",
      homeTeam: { name: "Sunday Smash" },
      awayTeam: { name: "Night Walls" },
      lineups: { home: [{ id: 1 }], away: "nope" },
      scorecard: { sport: "padel", id: "p1" },
      viewer: { role: "not-a-role" },
    };
    assert.equal(parseTeamMatch(brokenLineup), null);
    assert.deepEqual(parseTeamMatchPreview(brokenLineup), {
      id: "m-preview",
      sport: "padel",
      status: "live",
      startsAt: "2026-09-08T18:00:00.000Z",
      homeName: "Sunday Smash",
      awayName: "Night Walls",
    });
    assert.equal(
      parseMineSnapshot({ upcoming: [brokenLineup], recent: [] }).upcoming[0]?.id,
      "m-preview",
    );
    assert.equal(TEAM_SEARCH_MIN_QUERY, 2);
    assert.equal(shouldSearchTeams(""), false);
    assert.equal(shouldSearchTeams("N"), false);
    assert.equal(shouldSearchTeams("Ni"), true);
    assert.equal(
      challengeTokenStashKey("m1"),
      `${CHALLENGE_TOKEN_STASH_PREFIX}m1`,
    );
  });

  it("round-trips datetime-local values", () => {
    const iso = "2026-09-08T18:00:00.000Z";
    const local = isoToDatetimeLocal(iso);
    assert.match(local, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const back = datetimeLocalToIso(local);
    assert.equal(back, new Date(local).toISOString());
    assert.equal(datetimeLocalToIso(""), null);
    assert.equal(isoToDatetimeLocal(null), "");
  });
});

describe("team match HTTP client", () => {
  it("POSTs create to /api/team-matches and join to /join, not :id", async () => {
    const created = await createTeamMatchWith(
      { homeTeamId: "t-home", awayTeamId: "t-away" },
      {
        fetch: async (url, init) => {
          assert.equal(String(url), "https://api.example.test/api/team-matches");
          assert.equal(init?.method, "POST");
          assert.equal(
            String(init?.body),
            JSON.stringify({ homeTeamId: "t-home", awayTeamId: "t-away" }),
          );
          return new Response(
            JSON.stringify({
              match: match({ challengeToken: "tok_create_1" }),
            }),
            { status: 201 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(created.ok, true);
    if (created.ok) assert.equal(created.value.challengeToken, "tok_create_1");

    const joined = await joinTeamMatchWith(
      { token: "ab".repeat(16), teamId: "t-away" },
      {
        fetch: async (url, init) => {
          assert.equal(String(url), "https://api.example.test/api/team-matches/join");
          assert.doesNotMatch(String(url), /\/api\/team-matches\/ab/);
          assert.equal(init?.method, "POST");
          return new Response(
            JSON.stringify({ match: match({ status: "scheduled" }) }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(joined.ok, true);
    if (joined.ok) assert.equal(joined.value.status, "scheduled");
  });

  it("loads mine, team list, and detail; surfaces 403/409", async () => {
    const mine = await listMyTeamMatchesWith({
      fetch: async (url) => {
        assert.equal(String(url), "https://api.example.test/api/team-matches/mine");
        return new Response(
          JSON.stringify({
            upcoming: [match({ challengeToken: "tok_mine" })],
            recent: [],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(mine.ok, true);
    if (mine.ok) {
      assert.equal(mine.value.upcoming.length, 1);
      assert.equal("challengeToken" in mine.value.upcoming[0], false);
      assert.equal(mine.value.upcoming[0]?.homeName, "Sunday Smash");
    }

    const listed = await listTeamMatchesWith("t-home", {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/teams/t-home/matches",
        );
        return new Response(
          JSON.stringify({
            matches: [match({ challengeToken: "tok_list" })],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(listed.ok, true);
    if (listed.ok) {
      assert.equal("challengeToken" in listed.value[0], false);
      assert.equal(listed.value[0]?.homeName, "Sunday Smash");
    }

    const detail = await getTeamMatchWith("m1", {
      fetch: async (url) => {
        assert.equal(String(url), "https://api.example.test/api/team-matches/m1");
        return new Response(
          JSON.stringify({ match: match({ challengeToken: "tok_get" }) }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(detail.ok, true);
    if (detail.ok) assert.equal(detail.value.challengeToken, null);

    const forbidden = await acceptTeamMatchWith("m1", {
      fetch: async () =>
        new Response(
          JSON.stringify({
            error: "Only the challenged team's owner or captain can accept",
          }),
          { status: 403 },
        ),
      baseUrl: "https://api.example.test",
    });
    assert.equal(forbidden.ok, false);
    if (!forbidden.ok) {
      assert.equal(forbidden.status, 403);
      assert.match(forbidden.error, /owner or captain/);
    }

    const conflict = await acceptTeamMatchWith("m1", {
      fetch: async () =>
        new Response(
          JSON.stringify({ error: "Challenge has already been accepted" }),
          { status: 409 },
        ),
      baseUrl: "https://api.example.test",
    });
    assert.equal(conflict.ok, false);
    if (!conflict.ok) assert.equal(conflict.status, 409);
  });

  it("PUTs lineup and POSTs start; navigates from sport+id not API path", async () => {
    const lineup = await setTeamMatchLineupWith(
      "m1",
      { userIds: ["u1", "u2"] },
      "padel",
      {
        fetch: async (url, init) => {
          assert.equal(
            String(url),
            "https://api.example.test/api/team-matches/m1/lineup",
          );
          assert.equal(init?.method, "PUT");
          assert.equal(String(init?.body), JSON.stringify({ userIds: ["u1", "u2"] }));
          return new Response(JSON.stringify({ match: match() }), { status: 200 });
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(lineup.ok, true);

    const started = await startTeamMatchWith("m1", {
      fetch: async (url, init) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/team-matches/m1/start",
        );
        assert.equal(init?.method, "POST");
        return new Response(
          JSON.stringify({
            match: match({
              status: "live",
              scorecard: { sport: "padel", id: "p1" },
            }),
            scorecard: { sport: "padel", id: "p1" },
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(started.ok, true);
    if (started.ok) {
      assert.deepEqual(started.value.scorecard, { sport: "padel", id: "p1" });
      assert.equal(scorecardNavigatePath(started.value.scorecard), "/padel/p1");
    }
  });

  it("searches same-sport teams via /api/teams/search", async () => {
    const result = await searchTeamsWith("padel", "Night", {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/teams/search?sport=padel&q=Night",
        );
        return new Response(
          JSON.stringify({ teams: [AWAY] }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value[0]?.name, "Night Walls");

    let searched = false;
    const skipped = await searchTeamsWith("padel", " ", {
      fetch: async () => {
        searched = true;
        return new Response("{}", { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(skipped.ok, true);
    if (skipped.ok) assert.deepEqual(skipped.value, []);
    assert.equal(searched, false);
  });
});
