import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPoolWith,
  getPoolWith,
  isPoolsUnavailable,
  joinPoolWith,
  parsePredictionPool,
  submitPoolPickWith,
} from "./pools.ts";

const POOL = {
  id: "p1",
  fixtureSlug: "springboks-vs-all-blacks-2026-09-06",
  title: "Boks tips",
  inviteCode: "ab12cd34",
  createdByUserId: "user-a",
  kicksOffAt: "2026-09-06T15:00:00.000Z",
  lockedAt: null,
  locked: false,
  result: null,
  memberCount: 1,
  joined: true,
  role: "owner",
  myPick: null,
  createdAt: "2026-09-06T12:00:00.000Z",
  members: [
    {
      id: "user-a",
      displayName: "Alex",
      handle: "alex",
      avatarUrl: null,
      role: "owner",
      joinedAt: "2026-09-06T12:00:00.000Z",
      pick: null,
    },
  ],
};

describe("prediction pool parsers", () => {
  it("parses a pool and never invents memberCount", () => {
    const parsed = parsePredictionPool(POOL);
    assert.deepEqual(parsed, POOL);
    assert.equal(parsePredictionPool({ ...POOL, memberCount: undefined }), null);
  });
});

describe("prediction pool client", () => {
  it("POSTs create with fixtureSlug and optional title, credentials include", async () => {
    let sawBody = "";
    let sawInit: RequestInit | undefined;
    const result = await createPoolWith(
      {
        fixtureSlug: " springboks-vs-all-blacks-2026-09-06 ",
        title: " Boks tips ",
      },
      {
        fetch: async (url, init) => {
          assert.match(String(url), /\/api\/pools$/);
          sawInit = init;
          sawBody = String(init?.body ?? "");
          return new Response(JSON.stringify({ pool: POOL }), { status: 201 });
        },
        baseUrl: "https://api.example.test",
      },
    );

    assert.equal(result.ok, true);
    assert.equal(sawInit?.credentials, "include");
    assert.equal(
      sawBody,
      JSON.stringify({
        fixtureSlug: "springboks-vs-all-blacks-2026-09-06",
        title: "Boks tips",
      }),
    );
    assert.equal(JSON.stringify(sawInit?.body ?? {}).includes("userId"), false);
  });

  it("soft-fails create on 404 instead of throwing", async () => {
    const result = await createPoolWith(
      { fixtureSlug: "derby-2026-09-12" },
      {
        fetch: async () =>
          new Response(JSON.stringify({ error: "not found" }), { status: 404 }),
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.status, 404);
    assert.equal(isPoolsUnavailable(result.status), true);
  });

  it("GETs a pool by invite code", async () => {
    const result = await getPoolWith("ab12cd34", {
      fetch: async (url, init) => {
        assert.equal(String(url), "https://api.example.test/api/pools/ab12cd34");
        assert.equal(init?.method, "GET");
        assert.equal(init?.credentials, "include");
        return new Response(JSON.stringify({ pool: POOL }), { status: 200 });
      },
      baseUrl: "https://api.example.test/",
      cookie: "token=abc",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.inviteCode, "ab12cd34");
  });

  it("joins and submits picks without sending userId", async () => {
    const joined = await joinPoolWith("ab12cd34", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/pools\/ab12cd34\/join$/);
        assert.equal(init?.method, "POST");
        assert.equal(init?.body, undefined);
        return new Response(JSON.stringify({ pool: POOL }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(joined.ok, true);

    let sawBody = "";
    const picked = await submitPoolPickWith(
      "ab12cd34",
      { homeScore: 27, awayScore: 20 },
      {
        fetch: async (url, init) => {
          assert.match(String(url), /\/api\/pools\/ab12cd34\/picks$/);
          sawBody = String(init?.body ?? "");
          return new Response(
            JSON.stringify({
              pool: {
                ...POOL,
                myPick: {
                  tip: null,
                  homeScore: 27,
                  awayScore: 20,
                  winner: "home",
                },
              },
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(sawBody.includes("userId"), false);
    assert.equal(picked.ok, true);
  });
});
