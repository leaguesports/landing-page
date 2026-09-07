import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  TEAM_COMING_LATER,
  TEAM_LIST_SPORT_ALL,
  TEAM_OWNER_LEAVE_ERROR,
  TEAM_PROXY_SOURCES,
  TEAM_SPORTS,
  buildCreateTeamPayload,
  buildInvitePayload,
  buildJoinPayload,
  buildMemberRolePayload,
  buildTransferOwnershipPayload,
  buildUpdateTeamPayload,
  canAppointCaptains,
  canChangeMemberRole,
  canDeleteTeam,
  canEditTeam,
  canInvite,
  canLeave,
  canRemoveMember,
  canTransferOwnership,
  createTeamInviteLinkWith,
  createTeamWith,
  deleteTeamWith,
  filterTeamsByListSport,
  formatMemberCount,
  formatTeamRole,
  formatTeamSport,
  getTeamWith,
  inviteTeamMembersWith,
  joinTeamWith,
  leaveTeamWith,
  listTeamsWith,
  parseTeam,
  parseTeamSummary,
  teamInviteLinkUrl,
  teamInviteUrl,
  teamJoinHref,
  teamJoinUrl,
  teamLeaveUrl,
  teamMemberUrl,
  teamProfileHref,
  teamTransferUrl,
  teamUrl,
  teamsRootUrl,
  teamsVisibleOnHubPeople,
  transferTeamOwnershipWith,
  uniqueUserIds,
  updateTeamMemberRoleWith,
  updateTeamWith,
} from "./teams.ts";

const SUMMARY = {
  id: "t1",
  name: "Sunday Smash",
  sport: "padel",
  homeVenueCmsId: null,
  createdBy: "u1",
  createdAt: "2026-09-07T12:00:00.000Z",
  updatedAt: "2026-09-07T12:00:00.000Z",
  memberCount: 3,
  myRole: "owner",
  myStatus: "active",
};

const MEMBER = {
  id: "u1",
  displayName: "Alex",
  handle: "alex",
  avatarUrl: null,
  role: "owner",
  status: "active",
  joinedAt: "2026-09-07T12:00:00.000Z",
};

const CAPTAIN = {
  id: "u2",
  displayName: "Blake",
  handle: "blake",
  avatarUrl: null,
  role: "captain",
  status: "active",
  joinedAt: "2026-09-07T12:05:00.000Z",
};

const ROSTER = {
  id: "u3",
  displayName: "Casey",
  handle: "casey",
  avatarUrl: null,
  role: "member",
  status: "active",
  joinedAt: "2026-09-07T12:10:00.000Z",
};

const DETAIL = {
  ...SUMMARY,
  members: [MEMBER, CAPTAIN, ROSTER],
  inviteLink: { token: "a".repeat(32), createdAt: "2026-09-07T12:20:00.000Z" },
};

describe("teams parsers", () => {
  it("parses a summary and never invents memberCount", () => {
    const parsed = parseTeamSummary(SUMMARY);
    assert.deepEqual(parsed, SUMMARY);
    assert.equal(
      parseTeamSummary({ ...SUMMARY, memberCount: undefined }),
      null,
    );
    assert.equal(parseTeamSummary({ ...SUMMARY, sport: "" }), null);
    assert.equal(parseTeamSummary({ ...SUMMARY, myRole: "coach" }), null);
  });

  it("accepts unknown sports from the API so the select stays extensible", () => {
    const parsed = parseTeamSummary({ ...SUMMARY, sport: "pickleball" });
    assert.equal(parsed?.sport, "pickleball");
    assert.equal(formatTeamSport("pickleball"), "Pickleball");
  });

  it("parses detail members and inviteLink; missing members is invalid", () => {
    const parsed = parseTeam(DETAIL);
    assert.equal(parsed?.members.length, 3);
    assert.equal(parsed?.inviteLink?.token.length, 32);
    assert.equal(parseTeam(SUMMARY), null);
    assert.equal(parseTeam({ ...SUMMARY, members: [], inviteLink: null })?.inviteLink, null);
  });

  it("formats sport, role, and memberCount from API values", () => {
    assert.equal(formatTeamSport("padel"), "Padel");
    assert.equal(formatTeamSport("golf"), "Golf");
    assert.equal(formatTeamSport("darts"), "Darts");
    assert.equal(formatTeamRole("owner"), "Owner");
    assert.equal(formatTeamRole("captain"), "Captain");
    assert.equal(formatTeamRole("member"), "Member");
    assert.equal(formatMemberCount(1), "1 member");
    assert.equal(formatMemberCount(3), "3 members");
    assert.equal(TEAM_COMING_LATER, "Team matches and tournaments — coming later");
  });
});

describe("teams permissions", () => {
  it("matches the backend owner / captain / member table", () => {
    assert.equal(canEditTeam("owner"), true);
    assert.equal(canEditTeam("captain"), false);
    assert.equal(canEditTeam("member"), false);

    assert.equal(canAppointCaptains("owner"), true);
    assert.equal(canAppointCaptains("captain"), false);
    assert.equal(canAppointCaptains("member"), false);

    assert.equal(canInvite("owner"), true);
    assert.equal(canInvite("captain"), true);
    assert.equal(canInvite("member"), false);

    assert.equal(canDeleteTeam("owner"), true);
    assert.equal(canDeleteTeam("captain"), false);

    assert.equal(canTransferOwnership("owner"), true);
    assert.equal(canTransferOwnership("captain"), false);

    assert.equal(canLeave("owner"), false);
    assert.equal(canLeave("captain"), true);
    assert.equal(canLeave("member"), true);
  });

  it("lets owners remove captains and members, not the owner", () => {
    assert.equal(canRemoveMember("owner", "member"), true);
    assert.equal(canRemoveMember("owner", "captain"), true);
    assert.equal(canRemoveMember("owner", "owner"), false);
    assert.equal(canRemoveMember("captain", "member"), true);
    assert.equal(canRemoveMember("captain", "captain"), false);
    assert.equal(canRemoveMember("captain", "owner"), false);
    assert.equal(canRemoveMember("member", "member"), false);
  });

  it("lets owners appoint or demote captains, never set owner", () => {
    assert.equal(canChangeMemberRole("owner", "member", "captain"), true);
    assert.equal(canChangeMemberRole("owner", "captain", "member"), true);
    assert.equal(canChangeMemberRole("owner", "member", "owner"), false);
    assert.equal(canChangeMemberRole("owner", "owner", "member"), false);
    assert.equal(canChangeMemberRole("captain", "member", "captain"), false);
  });
});

describe("teams sport filter", () => {
  const mixed = [
    { ...SUMMARY, id: "p", sport: "padel" },
    { ...SUMMARY, id: "g", sport: "golf" },
    { ...SUMMARY, id: "d", sport: "darts" },
  ];

  it("filters the Teams list by All or a sport chip", () => {
    assert.equal(filterTeamsByListSport(mixed, TEAM_LIST_SPORT_ALL).length, 3);
    assert.deepEqual(
      filterTeamsByListSport(mixed, "golf").map((team) => team.id),
      ["g"],
    );
    assert.equal(TEAM_SPORTS.includes("padel"), true);
  });

  it("does not hide other-sport teams when the hub sport dropdown is padel", () => {
    const visible = teamsVisibleOnHubPeople(mixed, "padel");
    assert.deepEqual(
      visible.map((team) => team.sport),
      ["padel", "golf", "darts"],
    );
    assert.deepEqual(
      teamsVisibleOnHubPeople(mixed, "golf").map((team) => team.id),
      ["p", "g", "d"],
    );
  });
});

describe("teams payload builders", () => {
  it("creates with name + sport and omits homeVenueCmsId in UI v1", () => {
    const built = buildCreateTeamPayload({
      name: " Sunday Smash ",
      sport: "padel",
    });
    assert.deepEqual(built, {
      ok: true,
      payload: { name: "Sunday Smash", sport: "padel" },
    });
    assert.equal("homeVenueCmsId" in (built.ok ? built.payload : {}), false);
  });

  it("includes homeVenueCmsId only when provided", () => {
    const built = buildCreateTeamPayload({
      name: "Sunday Smash",
      sport: "golf",
      homeVenueCmsId: " venue-1 ",
    });
    assert.equal(built.ok, true);
    if (!built.ok) return;
    assert.equal(built.payload.homeVenueCmsId, "venue-1");
  });

  it("rejects blank name or sport", () => {
    assert.equal(buildCreateTeamPayload({ name: "  ", sport: "padel" }).ok, false);
    assert.equal(buildCreateTeamPayload({ name: "Smash", sport: "" }).ok, false);
  });

  it("builds invite, join, role, transfer, and update payloads", () => {
    assert.deepEqual(buildInvitePayload([" u2 ", "u2", "u3"]), {
      ok: true,
      payload: { userIds: ["u2", "u3"] },
    });
    assert.equal(buildInvitePayload([]).ok, false);
    assert.deepEqual(buildJoinPayload("  tok  "), {
      ok: true,
      payload: { token: "tok" },
    });
    assert.deepEqual(buildMemberRolePayload("captain"), {
      ok: true,
      payload: { role: "captain" },
    });
    assert.equal(buildMemberRolePayload("owner").ok, false);
    assert.deepEqual(buildTransferOwnershipPayload("u2"), {
      ok: true,
      payload: { userId: "u2" },
    });
    assert.deepEqual(buildUpdateTeamPayload({ name: " Night Smash " }), {
      ok: true,
      payload: { name: "Night Smash" },
    });
    assert.equal(buildUpdateTeamPayload({}).ok, false);
    assert.deepEqual(uniqueUserIds(["a", " a ", "", "b"]), ["a", "b"]);
  });
});

describe("teams proxy paths", () => {
  it("puts join before :id so join is not captured as an id", () => {
    const joinIdx = TEAM_PROXY_SOURCES.indexOf("/api/teams/join");
    const idIdx = TEAM_PROXY_SOURCES.indexOf("/api/teams/:id");
    assert.ok(joinIdx >= 0 && idIdx > joinIdx);
    assert.deepEqual([...TEAM_PROXY_SOURCES], [
      "/api/teams",
      "/api/teams/join",
      "/api/teams/:id",
      "/api/teams/:id/invite",
      "/api/teams/:id/invite-link",
      "/api/teams/:id/leave",
      "/api/teams/:id/transfer-ownership",
      "/api/teams/:id/members/:userId",
    ]);
  });

  it("builds Railway-style URLs without colliding join and :id", () => {
    const origin = "https://api.example.test";
    assert.equal(teamsRootUrl(origin), "https://api.example.test/api/teams");
    assert.equal(teamJoinUrl(origin), "https://api.example.test/api/teams/join");
    assert.equal(teamUrl(origin, "t1"), "https://api.example.test/api/teams/t1");
    assert.equal(
      teamInviteUrl(origin, "t1"),
      "https://api.example.test/api/teams/t1/invite",
    );
    assert.equal(
      teamInviteLinkUrl(origin, "t1"),
      "https://api.example.test/api/teams/t1/invite-link",
    );
    assert.equal(
      teamLeaveUrl(origin, "t1"),
      "https://api.example.test/api/teams/t1/leave",
    );
    assert.equal(
      teamTransferUrl(origin, "t1"),
      "https://api.example.test/api/teams/t1/transfer-ownership",
    );
    assert.equal(
      teamMemberUrl(origin, "t1", "u2"),
      "https://api.example.test/api/teams/t1/members/u2",
    );
    assert.equal(teamProfileHref("t1"), "/teams/t1");
    assert.equal(teamJoinHref("abc"), "/teams/join/abc");
  });
});

describe("teams client", () => {
  it("lists teams and pending invites from GET /api/teams", async () => {
    const result = await listTeamsWith({
      fetch: async (url) => {
        assert.match(String(url), /\/api\/teams$/);
        return new Response(
          JSON.stringify({
            teams: [SUMMARY],
            pendingInvites: [{ ...SUMMARY, id: "t2", myStatus: "invited" }],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.teams[0]?.name, "Sunday Smash");
    assert.equal(result.value.pendingInvites[0]?.myStatus, "invited");
  });

  it("soft-fails list on 401 / 404 instead of throwing", async () => {
    const unauth = await listTeamsWith({
      fetch: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(unauth.ok, false);
    if (!unauth.ok) assert.equal(unauth.status, 401);
  });

  it("loads team detail including members", async () => {
    const result = await getTeamWith("t1", {
      fetch: async (url) => {
        assert.match(String(url), /\/api\/teams\/t1$/);
        return new Response(JSON.stringify({ team: DETAIL }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.members[1]?.role, "captain");
  });

  it("POSTs create with name and sport only", async () => {
    let sawBody = "";
    const result = await createTeamWith(
      { name: " Sunday Smash ", sport: "padel" },
      {
        fetch: async (url, init) => {
          assert.match(String(url), /\/api\/teams$/);
          assert.equal(init?.method, "POST");
          sawBody = String(init?.body ?? "");
          return new Response(JSON.stringify({ team: DETAIL }), { status: 201 });
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(sawBody, JSON.stringify({ name: "Sunday Smash", sport: "padel" }));
    assert.equal(result.ok, true);
  });

  it("PATCHes owner edits and DELETEs the team", async () => {
    const updated = await updateTeamWith(
      "t1",
      { name: "Night Smash", sport: "golf" },
      {
        fetch: async (url, init) => {
          assert.match(String(url), /\/api\/teams\/t1$/);
          assert.equal(init?.method, "PATCH");
          assert.equal(
            String(init?.body),
            JSON.stringify({ name: "Night Smash", sport: "golf" }),
          );
          return new Response(
            JSON.stringify({ team: { ...DETAIL, name: "Night Smash", sport: "golf" } }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(updated.ok, true);

    const removed = await deleteTeamWith("t1", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/teams\/t1$/);
        assert.equal(init?.method, "DELETE");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(removed.ok, true);
  });

  it("invites friends as active members and creates an invite link", async () => {
    const invited = await inviteTeamMembersWith("t1", ["u4"], {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/teams\/t1\/invite$/);
        assert.equal(init?.method, "POST");
        assert.equal(String(init?.body), JSON.stringify({ userIds: ["u4"] }));
        return new Response(JSON.stringify({ team: DETAIL }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(invited.ok, true);

    const link = await createTeamInviteLinkWith("t1", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/teams\/t1\/invite-link$/);
        assert.equal(init?.method, "POST");
        return new Response(
          JSON.stringify({
            inviteLink: { token: "b".repeat(32), createdAt: "2026-09-07T13:00:00.000Z" },
          }),
          { status: 201 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(link.ok, true);
    if (link.ok) assert.equal(link.value.token.length, 32);
  });

  it("joins via POST /api/teams/join, not /api/teams/:id", async () => {
    const result = await joinTeamWith("c".repeat(32), {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/teams\/join$/);
        assert.doesNotMatch(String(url), /\/api\/teams\/c/);
        assert.equal(init?.method, "POST");
        assert.equal(
          String(init?.body),
          JSON.stringify({ token: "c".repeat(32) }),
        );
        return new Response(JSON.stringify({ team: DETAIL }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
  });

  it("updates and removes members, transfers ownership, and leaves", async () => {
    const role = await updateTeamMemberRoleWith("t1", "u3", "captain", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/teams\/t1\/members\/u3$/);
        assert.equal(init?.method, "PATCH");
        assert.equal(String(init?.body), JSON.stringify({ role: "captain" }));
        return new Response(JSON.stringify({ team: DETAIL }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(role.ok, true);

    const kicked = await updateTeamMemberRoleWith("t1", "u3", "owner", {
      fetch: async () => new Response("should not run"),
      baseUrl: "https://api.example.test",
    });
    assert.equal(kicked.ok, false);

    const transferred = await transferTeamOwnershipWith("t1", "u2", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/teams\/t1\/transfer-ownership$/);
        assert.equal(String(init?.body), JSON.stringify({ userId: "u2" }));
        return new Response(JSON.stringify({ team: DETAIL }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(transferred.ok, true);

    const left = await leaveTeamWith("t1", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/teams\/t1\/leave$/);
        assert.equal(init?.method, "POST");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(left.ok, true);
  });

  it("surfaces 409 when the owner tries to leave without transfer", async () => {
    const blocked = await leaveTeamWith("t1", {
      fetch: async () =>
        new Response(JSON.stringify({ error: TEAM_OWNER_LEAVE_ERROR }), {
          status: 409,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 409);
      assert.equal(blocked.error, TEAM_OWNER_LEAVE_ERROR);
    }
  });

  it("surfaces 400 when inviting a non-friend", async () => {
    const result = await inviteTeamMembersWith("t1", ["stranger"], {
      fetch: async () =>
        new Response(
          JSON.stringify({ error: "Can only invite an accepted friend" }),
          { status: 400 },
        ),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 400);
      assert.equal(result.error, "Can only invite an accepted friend");
    }
  });
});
