import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GOLF_HANDICAP_PROFILE_PATHS,
  parseGolfProfile,
  patchGolfHandicapIndexWith,
  withRoundHandicapOverride,
} from "./profile.ts";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("parseGolfProfile", () => {
  it("reads golfHandicapIndex from /api/auth/me", () => {
    const profile = parseGolfProfile({
      id: "user-1",
      displayName: "Alex",
      golfHandicapIndex: 12.4,
    });
    assert.equal(profile?.id, "user-1");
    assert.equal(profile?.golfHandicapIndex, 12.4);
  });

  it("treats a missing HI as null so the editor can clear it", () => {
    const profile = parseGolfProfile({ id: "user-1" });
    assert.equal(profile?.golfHandicapIndex, null);
  });
});

describe("patchGolfHandicapIndexWith", () => {
  it("PATCHes /api/auth/me and falls back to /api/me/profile", async () => {
    const calls: string[] = [];
    const result = await patchGolfHandicapIndexWith(10.4, {
      baseUrl: "https://api.example.test",
      fetch: async (url, init) => {
        calls.push(`${init?.method ?? "GET"} ${String(url)}`);
        if (String(url).endsWith("/api/auth/me")) {
          return jsonResponse(404, { error: "Not found" });
        }
        return jsonResponse(200, {
          id: "user-1",
          golfHandicapIndex: 10.4,
        });
      },
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.profile.golfHandicapIndex, 10.4);
    assert.deepEqual(calls, [
      "PATCH https://api.example.test/api/auth/me",
      "PATCH https://api.example.test/api/me/profile",
    ]);
    assert.deepEqual([...GOLF_HANDICAP_PROFILE_PATHS], [
      "/api/auth/me",
      "/api/me/profile",
    ]);
  });

  it("rejects an out-of-range HI before calling the API", async () => {
    const result = await patchGolfHandicapIndexWith(90, {
      baseUrl: "https://api.example.test",
      fetch: async () => {
        throw new Error("should not fetch");
      },
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.status, 400);
  });
});

describe("withRoundHandicapOverride", () => {
  it("PATCHes an override then restores the profile HI", async () => {
    const calls: Array<{ hi: unknown }> = [];
    const value = await withRoundHandicapOverride(
      12.4,
      8.0,
      async () => "ok",
      {
        baseUrl: "https://api.example.test",
        fetch: async (_url, init) => {
          const body = JSON.parse(String(init?.body ?? "{}")) as {
            golfHandicapIndex?: unknown;
          };
          calls.push({ hi: body.golfHandicapIndex });
          return jsonResponse(200, {
            id: "user-1",
            golfHandicapIndex: body.golfHandicapIndex ?? null,
          });
        },
      },
    );
    assert.equal(value, "ok");
    assert.deepEqual(calls, [{ hi: 8 }, { hi: 12.4 }]);
  });

  it("keeps a first-time HI set instead of clearing it", async () => {
    const calls: unknown[] = [];
    await withRoundHandicapOverride(null, 14.2, async () => "ok", {
      baseUrl: "https://api.example.test",
      fetch: async (_url, init) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          golfHandicapIndex?: unknown;
        };
        calls.push(body.golfHandicapIndex);
        return jsonResponse(200, {
          id: "user-1",
          golfHandicapIndex: body.golfHandicapIndex ?? null,
        });
      },
    });
    assert.deepEqual(calls, [14.2]);
  });
});
