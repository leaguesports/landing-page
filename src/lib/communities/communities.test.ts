import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createCommunityWith,
  formatCommunitySport,
  formatMemberCount,
  getCommunityWith,
  isSoleOwnerLeaveBlocked,
  joinCommunityWith,
  leaveCommunityWith,
  listCommunitiesWith,
  listMyCommunitiesWith,
  parseCommunity,
  parseCommunitySummary,
} from "./communities.ts";

const SUMMARY = {
  id: "c1",
  name: "Sunday Beers",
  city: "Cape Town",
  sport: "padel",
  memberCount: 4,
  createdAt: "2026-09-06T12:00:00.000Z",
  joined: false,
  role: null,
};

const MEMBER = {
  id: "u1",
  displayName: "Alex",
  handle: "alex",
  avatarUrl: null,
  role: "owner",
  joinedAt: "2026-09-06T12:00:00.000Z",
};

const DETAIL = {
  ...SUMMARY,
  joined: true,
  role: "owner",
  members: [MEMBER],
};

describe("communities parsers", () => {
  it("parses a summary and never invents memberCount", () => {
    const parsed = parseCommunitySummary(SUMMARY);
    assert.deepEqual(parsed, SUMMARY);

    assert.equal(
      parseCommunitySummary({ ...SUMMARY, memberCount: undefined }),
      null,
    );
    assert.equal(parseCommunitySummary({ ...SUMMARY, sport: "soccer" }), null);
  });

  it("parses detail members and treats missing members as invalid", () => {
    const parsed = parseCommunity(DETAIL);
    assert.equal(parsed?.members.length, 1);
    assert.equal(parsed?.members[0]?.handle, "alex");
    assert.equal(parseCommunity(SUMMARY), null);
  });

  it("formats sport and memberCount from API values", () => {
    assert.equal(formatCommunitySport("padel"), "Padel");
    assert.equal(formatCommunitySport("multi"), "Multi-sport");
    assert.equal(formatCommunitySport(null), "Any sport");
    assert.equal(formatMemberCount(1), "1 member");
    assert.equal(formatMemberCount(4), "4 members");
  });

  it("hides leave for the sole owner", () => {
    assert.equal(isSoleOwnerLeaveBlocked(DETAIL), true);
    assert.equal(
      isSoleOwnerLeaveBlocked({
        role: "owner",
        members: [
          MEMBER,
          { ...MEMBER, id: "u2", role: "owner", handle: "blake" },
        ],
      }),
      false,
    );
    assert.equal(
      isSoleOwnerLeaveBlocked({ role: "member", members: [MEMBER] }),
      false,
    );
    assert.equal(isSoleOwnerLeaveBlocked({ role: "owner" }), true);
  });
});

describe("communities client", () => {
  it("lists communities from GET /api/communities", async () => {
    const result = await listCommunitiesWith({
      fetch: async (url) => {
        assert.match(String(url), /\/api\/communities$/);
        return new Response(JSON.stringify({ communities: [SUMMARY] }), {
          status: 200,
        });
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.length, 1);
    assert.equal(result.value[0]?.memberCount, 4);
    assert.equal(result.value[0]?.name, "Sunday Beers");
  });

  it("soft-fails list on 404 / 503 instead of throwing", async () => {
    const missing = await listCommunitiesWith({
      fetch: async () => new Response("not migrated", { status: 404 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(missing.ok, false);
    if (missing.ok) return;
    assert.equal(missing.status, 404);

    const down = await listCommunitiesWith({
      fetch: async () => new Response("nope", { status: 503 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(down.ok, false);
    if (down.ok) return;
    assert.equal(down.status, 503);
  });

  it("loads community detail including members", async () => {
    const result = await getCommunityWith("c1", {
      fetch: async (url) => {
        assert.match(String(url), /\/api\/communities\/c1$/);
        return new Response(JSON.stringify({ community: DETAIL }), {
          status: 200,
        });
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.memberCount, 4);
    assert.equal(result.value.members[0]?.role, "owner");
  });

  it("returns 404 from detail without throwing", async () => {
    const result = await getCommunityWith("missing", {
      fetch: async () =>
        new Response(JSON.stringify({ error: "Community not found" }), {
          status: 404,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.status, 404);
    assert.equal(result.error, "Community not found");
  });

  it("POSTs create with name, city, and optional sport", async () => {
    let sawBody = "";
    const result = await createCommunityWith(
      { name: " Sunday Beers ", city: " Cape Town ", sport: "padel" },
      {
        fetch: async (url, init) => {
          assert.match(String(url), /\/api\/communities$/);
          assert.equal(init?.method, "POST");
          sawBody = String(init?.body ?? "");
          return new Response(JSON.stringify({ community: DETAIL }), {
            status: 201,
          });
        },
        baseUrl: "https://api.example.test",
      },
    );

    assert.equal(
      sawBody,
      JSON.stringify({ name: "Sunday Beers", city: "Cape Town", sport: "padel" }),
    );
    assert.equal(result.ok, true);
  });

  it("omits sport when creating without one", async () => {
    let sawBody = "";
    await createCommunityWith(
      { name: "Sunday Beers", city: "Cape Town", sport: null },
      {
        fetch: async (_url, init) => {
          sawBody = String(init?.body ?? "");
          return new Response(JSON.stringify({ community: DETAIL }), {
            status: 201,
          });
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(
      sawBody,
      JSON.stringify({ name: "Sunday Beers", city: "Cape Town" }),
    );
  });

  it("joins and leaves via /join", async () => {
    const joined = await joinCommunityWith("c1", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/communities\/c1\/join$/);
        assert.equal(init?.method, "POST");
        return new Response(JSON.stringify({ community: DETAIL }), {
          status: 200,
        });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(joined.ok, true);

    const left = await leaveCommunityWith("c1", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/communities\/c1\/join$/);
        assert.equal(init?.method, "DELETE");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(left.ok, true);
  });

  it("surfaces 401 join and 409 sole-owner leave", async () => {
    const unauth = await joinCommunityWith("c1", {
      fetch: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(unauth.ok, false);
    if (!unauth.ok) assert.equal(unauth.status, 401);

    const blocked = await leaveCommunityWith("c1", {
      fetch: async () =>
        new Response(
          JSON.stringify({ error: "Sole owner cannot leave the community" }),
          { status: 409 },
        ),
      baseUrl: "https://api.example.test",
    });
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 409);
      assert.equal(blocked.error, "Sole owner cannot leave the community");
    }
  });

  it("lists my communities with joinedAt", async () => {
    const result = await listMyCommunitiesWith({
      fetch: async (url) => {
        assert.match(String(url), /\/api\/me\/communities$/);
        return new Response(
          JSON.stringify({
            communities: [
              {
                ...SUMMARY,
                joined: true,
                role: "owner",
                joinedAt: "2026-09-06T12:05:00.000Z",
              },
            ],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value[0]?.joinedAt, "2026-09-06T12:05:00.000Z");
    assert.equal(result.value[0]?.memberCount, 4);
  });
});
