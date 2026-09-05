import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  followFixtureWith,
  getFixtureFollowStatusWith,
  listFollowedFixturesWith,
  unfollowFixtureWith,
} from "./follow.ts";

const slug = "springboks-vs-all-blacks-2026-09-06";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function captureInit(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl: typeof fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init);
  };
  return { fetchImpl, calls };
}

describe("fixture follow client", () => {
  it("GETs follow status with credentials include and no userId", async () => {
    const { fetchImpl, calls } = captureInit(() =>
      jsonResponse(200, { following: true }),
    );

    const status = await getFixtureFollowStatusWith(slug, {
      baseUrl: "https://api.example.test",
      cookie: "token=abc",
      fetch: fetchImpl,
    });

    assert.deepEqual(status, { following: true });
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/fixtures/springboks-vs-all-blacks-2026-09-06/follow",
    );
    assert.equal(calls[0].init.method, "GET");
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(calls[0].init.body, undefined);
    assert.equal(
      JSON.stringify(calls[0].init.body ?? {}).includes("userId"),
      false,
    );
  });

  it("POSTs follow without a body or userId", async () => {
    const { fetchImpl, calls } = captureInit(() =>
      jsonResponse(200, { following: true }),
    );

    const status = await followFixtureWith(slug, {
      baseUrl: "https://api.example.test/",
      fetch: fetchImpl,
    });

    assert.deepEqual(status, { following: true });
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/fixtures/springboks-vs-all-blacks-2026-09-06/follow",
    );
    assert.equal(calls[0].init.method, "POST");
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(calls[0].init.body, undefined);
    const serialized = JSON.stringify(calls[0].init);
    assert.equal(serialized.includes("userId"), false);
  });

  it("parses { following } from DELETE unfollow", async () => {
    const { fetchImpl, calls } = captureInit(() =>
      jsonResponse(200, { following: false }),
    );

    const status = await unfollowFixtureWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: fetchImpl,
    });

    assert.deepEqual(status, { following: false });
    assert.equal(calls[0].init.method, "DELETE");
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(calls[0].init.body, undefined);
    assert.equal(JSON.stringify(calls[0].init).includes("userId"), false);
  });

  it("soft-fails GET 401 and 404 without throwing", async () => {
    const unauthorized = await getFixtureFollowStatusWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(401, { error: "Unauthorized" }),
    });
    const missing = await getFixtureFollowStatusWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(404, { error: "Not found" }),
    });

    assert.equal(unauthorized, null);
    assert.equal(missing, null);
  });

  it("soft-fails POST/DELETE 401 and 404 (API not deployed)", async () => {
    const follow401 = await followFixtureWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(401, { error: "Unauthorized" }),
    });
    const follow404 = await followFixtureWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(404, { error: "Not found" }),
    });
    const unfollow401 = await unfollowFixtureWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(401, { error: "Unauthorized" }),
    });
    const unfollow404 = await unfollowFixtureWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(404, { error: "Not found" }),
    });

    assert.equal(follow401, null);
    assert.equal(follow404, null);
    assert.equal(unfollow401, null);
    assert.equal(unfollow404, null);
  });

  it("lists followed fixtures for the session user", async () => {
    const { fetchImpl, calls } = captureInit(() =>
      jsonResponse(200, {
        fixtures: [{ slug, createdAt: "2026-09-05T09:00:00.000Z" }],
      }),
    );

    const fixtures = await listFollowedFixturesWith({
      baseUrl: "https://api.example.test",
      fetch: fetchImpl,
    });

    assert.equal(fixtures.length, 1);
    assert.equal(fixtures[0]?.slug, slug);
    assert.equal(fixtures[0]?.createdAt, "2026-09-05T09:00:00.000Z");
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/me/followed-fixtures",
    );
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(JSON.stringify(calls[0].init).includes("userId"), false);
  });

  it("soft-fails the followed list on 401 / 404", async () => {
    const unauthorized = await listFollowedFixturesWith({
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(401, { error: "Unauthorized" }),
    });
    const missing = await listFollowedFixturesWith({
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(404, { error: "Not found" }),
    });

    assert.deepEqual(unauthorized, []);
    assert.deepEqual(missing, []);
  });

  it("invokes window-style fetch without illegal-invocation", async () => {
    const calls: string[] = [];
    const fakeWindow = {
      fetch(this: unknown, url: RequestInfo | URL, init?: RequestInit) {
        if (this !== fakeWindow && this !== globalThis) {
          throw new TypeError(
            "Failed to execute 'fetch' on 'Window': Illegal invocation",
          );
        }
        calls.push(String(init?.method ?? "GET"));
        return Promise.resolve(jsonResponse(200, { following: true }));
      },
    };

    const status = await followFixtureWith(slug, {
      baseUrl: "https://api.example.test",
      fetch: fakeWindow.fetch as typeof fetch,
    });

    assert.deepEqual(status, { following: true });
    assert.deepEqual(calls, ["POST"]);
  });
});
