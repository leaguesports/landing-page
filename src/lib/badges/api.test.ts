import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { listBadgesWith, recomputeBadgesWith } from "./api.ts";

describe("badges client", () => {
  it("lists server-evaluated badges via GET", async () => {
    const snapshot = await listBadgesWith({
      fetch: async (url, init) => {
        assert.equal(String(url), "https://api.example.test/api/me/badges");
        assert.equal(init?.method, "GET");
        return new Response(
          JSON.stringify({
            badges: [
              {
                id: "first_lock",
                earnedAt: "2026-09-05T00:00:00.000Z",
              },
            ],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(snapshot.fromApi, true);
    assert.equal(snapshot.badges.length, 1);
    assert.equal(snapshot.badges[0]?.id, "first_lock");
  });

  it("returns fromApi false when the route is missing", async () => {
    const snapshot = await listBadgesWith({
      fetch: async () => new Response("Not Found", { status: 404 }),
      baseUrl: "https://api.example.test",
    });

    assert.equal(snapshot.fromApi, false);
    assert.deepEqual(snapshot.badges, []);
  });

  it("recomputes with an empty JSON body (no client earnedIds)", async () => {
    let sawBody = "";
    let sawMethod = "";
    const snapshot = await recomputeBadgesWith({
      fetch: async (_url, init) => {
        sawMethod = String(init?.method ?? "");
        sawBody = String(init?.body ?? "");
        return new Response(
          JSON.stringify({
            badges: [
              {
                id: "first_win",
                earnedAt: "2026-09-05T01:00:00.000Z",
              },
            ],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(sawMethod, "POST");
    assert.equal(sawBody, "{}");
    assert.ok(!sawBody.includes("earnedIds"));
    assert.equal(snapshot.fromApi, true);
    assert.equal(snapshot.badges[0]?.id, "first_win");
  });

  it("ignores unknown badge ids from the API", async () => {
    const snapshot = await listBadgesWith({
      fetch: async () =>
        new Response(
          JSON.stringify({
            badges: [
              { id: "first_lock", earnedAt: "2026-09-05T00:00:00.000Z" },
              { id: "not_a_real_badge", earnedAt: "2026-09-05T00:00:00.000Z" },
            ],
          }),
          { status: 200 },
        ),
      baseUrl: "https://api.example.test",
    });

    assert.deepEqual(
      snapshot.badges.map((badge) => badge.id),
      ["first_lock"],
    );
  });
});
