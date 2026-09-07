import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  challengeGuestFromActivity,
  communityChallengeHref,
  formatActivityWhen,
  isCommunityActivityPath,
  listCommunityActivityWith,
  listLatestCommunityActivityByIdsWith,
  parseCommunityActivityItem,
  parseCommunityActivityItems,
} from "./activity.ts";

const PADEL_ACTIVITY = {
  id: "m1",
  sport: "padel",
  kind: "match",
  lockedAt: "2026-09-07T08:00:00.000Z",
  venueCmsId: "court-1",
  venueName: "Padel Lab",
  path: "/padel/m1",
  summary: "Alex / Sam vs Jordan / Riley · 6–4",
  players: [
    { userId: "u1", displayName: "Alex", isGuest: false },
    { userId: null, displayName: "Sam", isGuest: true },
    { userId: "u3", displayName: "Jordan", isGuest: false },
    { userId: null, displayName: "Riley", isGuest: true },
  ],
};

const GOLF_ACTIVITY = {
  id: "g1",
  sport: "golf",
  kind: "round",
  lockedAt: "2026-09-06T16:00:00.000Z",
  venueCmsId: null,
  venueName: null,
  path: "/golf/g1",
  summary: "Alex 36 · Casey 45",
  players: [
    { userId: "u1", displayName: "Alex", isGuest: false },
    { userId: "u4", displayName: "Casey", isGuest: false },
  ],
};

describe("community activity parsers", () => {
  it("parses padel and golf items and drops junk", () => {
    const padel = parseCommunityActivityItem(PADEL_ACTIVITY);
    assert.deepEqual(padel, PADEL_ACTIVITY);

    const golf = parseCommunityActivityItem(GOLF_ACTIVITY);
    assert.equal(golf?.sport, "golf");
    assert.equal(golf?.kind, "round");
    assert.equal(golf?.path, "/golf/g1");
    assert.equal(golf?.venueName, null);

    assert.equal(
      parseCommunityActivityItem({ ...PADEL_ACTIVITY, sport: "tennis" }),
      null,
    );
    assert.equal(
      parseCommunityActivityItem({ ...PADEL_ACTIVITY, kind: "round" }),
      null,
    );
    assert.equal(
      parseCommunityActivityItem({ ...PADEL_ACTIVITY, path: "https://evil.test" }),
      null,
    );
    assert.equal(
      parseCommunityActivityItem({ ...PADEL_ACTIVITY, path: "/golf/m1" }),
      null,
    );
    assert.equal(parseCommunityActivityItem({ ...PADEL_ACTIVITY, id: "" }), null);
  });

  it("accepts empty items and skips invalid rows without inventing activity", () => {
    assert.deepEqual(parseCommunityActivityItems({ items: [] }), []);
    assert.deepEqual(parseCommunityActivityItems({}), []);
    assert.deepEqual(parseCommunityActivityItems(null), []);
    const mixed = parseCommunityActivityItems({
      items: [PADEL_ACTIVITY, { id: "nope" }, GOLF_ACTIVITY],
    });
    assert.equal(mixed.length, 2);
    assert.equal(mixed[0]?.id, "m1");
    assert.equal(mixed[1]?.id, "g1");
  });

  it("only allows same-origin padel/golf scorecard paths", () => {
    assert.equal(isCommunityActivityPath("/padel/abc", "padel"), true);
    assert.equal(isCommunityActivityPath("/golf/abc", "golf"), true);
    assert.equal(isCommunityActivityPath("/padel/abc", "golf"), false);
    assert.equal(isCommunityActivityPath("/javascript:alert(1)"), false);
    assert.equal(isCommunityActivityPath("//evil.test/padel/m1"), false);
  });

  it("builds challenge hrefs with community and guest query params", () => {
    assert.equal(communityChallengeHref(), "/padel/new");
    assert.equal(
      communityChallengeHref({ communityId: " c1 " }),
      "/padel/new?community=c1",
    );
    assert.equal(
      communityChallengeHref({ communityId: "c1", guestName: " Alex " }),
      "/padel/new?community=c1&guest=Alex",
    );
    assert.equal(
      communityChallengeHref({ guestName: "Sam (Guest)" }),
      "/padel/new?guest=Sam+%28Guest%29",
    );
  });

  it("picks a challenge guest from activity, skipping self", () => {
    assert.equal(challengeGuestFromActivity(PADEL_ACTIVITY, "u1"), "Sam");
    assert.equal(challengeGuestFromActivity(PADEL_ACTIVITY), "Alex");
    assert.equal(
      challengeGuestFromActivity({ players: [{ userId: "u1", displayName: "Alex", isGuest: false }] }, "u1"),
      undefined,
    );
  });

  it("formats relative lockedAt without inventing a timestamp", () => {
    const now = Date.parse("2026-09-07T09:00:00.000Z");
    assert.equal(formatActivityWhen("2026-09-07T08:59:30.000Z", now), "just now");
    assert.equal(formatActivityWhen("2026-09-07T08:10:00.000Z", now), "50m ago");
    assert.equal(formatActivityWhen("not-a-date", now), "");
  });
});

describe("community activity client", () => {
  it("lists activity from GET /api/communities/:id/activity", async () => {
    const result = await listCommunityActivityWith("c1", {
      fetch: async (url) => {
        assert.match(String(url), /\/api\/communities\/c1\/activity$/);
        return new Response(JSON.stringify({ items: [PADEL_ACTIVITY] }), {
          status: 200,
        });
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.length, 1);
    assert.equal(result.value[0]?.summary, PADEL_ACTIVITY.summary);
    assert.equal(result.value[0]?.path, "/padel/m1");
  });

  it("soft-fails activity on 404 / 503 instead of throwing", async () => {
    const missing = await listCommunityActivityWith("c1", {
      fetch: async () =>
        new Response(JSON.stringify({ error: "Community not found" }), {
          status: 404,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(missing.ok, false);
    if (missing.ok) return;
    assert.equal(missing.status, 404);
    assert.equal(missing.error, "Community not found");

    const down = await listCommunityActivityWith("c1", {
      fetch: async () => new Response("nope", { status: 503 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(down.ok, false);
    if (down.ok) return;
    assert.equal(down.status, 503);
  });

  it("returns an empty list for 200 { items: [] }", async () => {
    const result = await listCommunityActivityWith("c1", {
      fetch: async () =>
        new Response(JSON.stringify({ items: [] }), { status: 200 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.value, []);
  });

  it("does not invent activity when the payload is malformed", async () => {
    const result = await listCommunityActivityWith("c1", {
      fetch: async () =>
        new Response(JSON.stringify({ items: [{ summary: "fake" }] }), {
          status: 200,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.value, []);
  });

  it("loads latest hub lines only for the preview cap and skips failures", async () => {
    const seen: string[] = [];
    const latest = await listLatestCommunityActivityByIdsWith(
      ["c1", "c2", "c3", "c1", ""],
      {
        limit: 2,
        baseUrl: "https://api.example.test",
        fetch: async (url) => {
          const href = String(url);
          seen.push(href);
          if (href.endsWith("/c1/activity")) {
            return new Response(JSON.stringify({ items: [PADEL_ACTIVITY] }), {
              status: 200,
            });
          }
          return new Response("nope", { status: 503 });
        },
      },
    );

    assert.equal(seen.length, 2);
    assert.equal(latest.c1?.id, "m1");
    assert.equal(latest.c2, undefined);
    assert.equal(latest.c3, undefined);
  });
});
