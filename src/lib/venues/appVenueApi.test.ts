import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { attemptEnsureVenueFromCmsWith, ensureVenueFromCmsWith } from "./appVenueApi.ts";

const venue = {
  cmsId: "sanity-venue-1",
  name: "Claremont Arms",
  slug: "claremont-arms",
};

const appVenue = {
  id: "app-1",
  cmsId: venue.cmsId,
  name: venue.name,
  slug: venue.slug,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ensureVenueFromCmsWith", () => {
  it("GETs /api/venues/:cmsId with no query or body, and skips PUT on 200", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const result = await ensureVenueFromCmsWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: async (url, init = {}) => {
        calls.push({ url: String(url), init });
        return jsonResponse(200, appVenue);
      },
    });

    assert.deepEqual(result, appVenue);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.example.test/api/venues/sanity-venue-1");
    assert.equal(calls[0].init.method, "GET");
    assert.equal(calls[0].init.body, undefined);
    assert.equal(new URL(calls[0].url).search, "");
  });

  it("PUTs { name, slug } only after GET 404", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const result = await ensureVenueFromCmsWith(venue, {
      baseUrl: "https://api.example.test",
      cookie: "token=abc",
      fetch: async (url, init = {}) => {
        calls.push({ url: String(url), init });
        if (init.method === "PUT") {
          return jsonResponse(201, appVenue);
        }
        return jsonResponse(404, { error: "Venue not found" });
      },
    });

    assert.deepEqual(result, appVenue);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].init.method, "GET");
    assert.equal(calls[1].init.method, "PUT");
    assert.equal(calls[1].init.body, JSON.stringify({ name: venue.name, slug: venue.slug }));
    const headers = new Headers(calls[1].init.headers);
    assert.equal(headers.get("Cookie"), "token=abc");
    assert.equal(headers.get("Content-Type"), "application/json");
  });

  it("does not PUT when GET fails for a reason other than 404", async () => {
    const calls: string[] = [];
    const result = await ensureVenueFromCmsWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: async (_url, init = {}) => {
        calls.push(String(init.method));
        return jsonResponse(503, { error: "Unable to save venue" });
      },
    });

    assert.equal(result, null);
    assert.deepEqual(calls, ["GET"]);
  });

  it("returns null and does not PUT when GET cannot reach the API", async () => {
    const methods: string[] = [];
    const result = await ensureVenueFromCmsWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: async (_url, init = {}) => {
        methods.push(String(init.method));
        throw new Error("network");
      },
    });

    assert.equal(result, null);
    assert.deepEqual(methods, ["GET"]);
  });

  it("is a no-op without a base URL", async () => {
    let called = false;
    const result = await ensureVenueFromCmsWith(venue, {
      baseUrl: "",
      fetch: async () => {
        called = true;
        return jsonResponse(200, appVenue);
      },
    });
    assert.equal(result, null);
    assert.equal(called, false);
  });

  it("treats PUT 201 with an unparseable body as success", async () => {
    const attempt = await attemptEnsureVenueFromCmsWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: async (_url, init = {}) => {
        if (init.method === "PUT") {
          return jsonResponse(201, { ok: true });
        }
        return jsonResponse(404, { error: "Venue not found" });
      },
    });
    assert.equal(attempt.ok, true);
    assert.equal(attempt.status, 201);
    assert.equal(attempt.venue, null);
    assert.equal(attempt.networkError, false);
  });

  it("returns the GET status and body when lookup is not 200 or 404", async () => {
    const attempt = await attemptEnsureVenueFromCmsWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: async () => jsonResponse(405, { error: "Method Not Allowed" }),
    });
    assert.equal(attempt.ok, false);
    assert.equal(attempt.status, 405);
    assert.deepEqual(attempt.body, { error: "Method Not Allowed" });
    assert.equal(attempt.venue, null);
  });

  it("marks a thrown GET as a network error", async () => {
    const attempt = await attemptEnsureVenueFromCmsWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: async () => {
        throw new TypeError("Failed to fetch");
      },
    });
    assert.equal(attempt.ok, false);
    assert.equal(attempt.networkError, true);
    assert.equal(attempt.status, 0);
  });
});
