import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  followVenueWith,
  getVenueFollowStatusWith,
  listFollowedVenuesWith,
  unfollowVenueWith,
} from "./follow.ts";

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

describe("venue follow client", () => {
  it("GETs follow status for an authenticated caller", async () => {
    const calls: { url: string; method?: string }[] = [];
    const status = await getVenueFollowStatusWith(venue.cmsId, {
      baseUrl: "https://api.example.test",
      cookie: "token=abc",
      fetch: async (url, init = {}) => {
        calls.push({ url: String(url), method: init.method });
        return jsonResponse(200, {
          following: true,
          venueCmsId: venue.cmsId,
        });
      },
    });

    assert.deepEqual(status, {
      following: true,
      venueCmsId: venue.cmsId,
    });
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/venues/sanity-venue-1/follow",
    );
    assert.equal(calls[0].method, "GET");
  });

  it("ensures the venue then POSTs follow", async () => {
    const methods: string[] = [];
    const status = await followVenueWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: async (url, init = {}) => {
        methods.push(String(init.method ?? "GET"));
        const path = String(url);
        if (path.endsWith("/follow")) {
          return jsonResponse(200, {
            following: true,
            venueCmsId: venue.cmsId,
          });
        }
        if (init.method === "PUT") {
          return jsonResponse(201, appVenue);
        }
        return jsonResponse(404, { error: "Venue not found" });
      },
    });

    assert.deepEqual(status, {
      following: true,
      venueCmsId: venue.cmsId,
    });
    assert.deepEqual(methods, ["GET", "PUT", "POST"]);
  });

  it("DELETEs to unfollow", async () => {
    const status = await unfollowVenueWith(venue.cmsId, {
      baseUrl: "https://api.example.test",
      fetch: async (_url, init = {}) => {
        assert.equal(init.method, "DELETE");
        return jsonResponse(200, {
          following: false,
          venueCmsId: venue.cmsId,
        });
      },
    });

    assert.deepEqual(status, {
      following: false,
      venueCmsId: venue.cmsId,
    });
  });

  it("invokes window-style fetch without illegal-invocation", async () => {
    // Mimic browsers: `fetch` as a method must keep `this === globalThis`.
    const calls: string[] = [];
    const fakeWindow = {
      fetch(this: unknown, url: RequestInfo | URL, init?: RequestInit) {
        if (this !== fakeWindow && this !== globalThis) {
          throw new TypeError(
            "Failed to execute 'fetch' on 'Window': Illegal invocation",
          );
        }
        calls.push(String(init?.method ?? "GET"));
        const path = String(url);
        if (path.endsWith("/follow") && init?.method === "POST") {
          return Promise.resolve(
            jsonResponse(200, {
              following: true,
              venueCmsId: venue.cmsId,
            }),
          );
        }
        if (path.includes("/api/venues/") && !path.endsWith("/follow")) {
          return Promise.resolve(jsonResponse(200, appVenue));
        }
        return Promise.resolve(jsonResponse(404, { error: "missing" }));
      },
    };

    const status = await followVenueWith(venue, {
      baseUrl: "https://api.example.test",
      fetch: fakeWindow.fetch as typeof fetch,
    });

    assert.deepEqual(status, {
      following: true,
      venueCmsId: venue.cmsId,
    });
    assert.ok(calls.includes("POST"));
  });

  it("lists followed venues for the session user", async () => {
    const venues = await listFollowedVenuesWith({
      baseUrl: "https://api.example.test",
      fetch: async () =>
        jsonResponse(200, {
          venues: [
            {
              ...appVenue,
              followedAt: "2026-09-04T12:00:00.000Z",
            },
          ],
        }),
    });

    assert.equal(venues.length, 1);
    assert.equal(venues[0]?.slug, "claremont-arms");
    assert.equal(venues[0]?.followedAt, "2026-09-04T12:00:00.000Z");
  });
});
