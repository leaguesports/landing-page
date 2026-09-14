import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FRIENDS_PLAYED_DEFAULT_CTA,
  FRIENDS_PLAYED_EMPTY_CTA,
  FRIENDS_PLAYED_SECTION_TITLE,
  friendFirstName,
  friendsPlayedCtaLabel,
  friendsPlayedOverflow,
  friendsPlayedOverflowLabel,
  friendsPlayedStartHref,
  friendsPlayedView,
  getVenueFriendsPlayedWith,
  listedFriendsPlayed,
  parseFriendsPlayedResponse,
  type FriendsPlayedFriend,
  type FriendsPlayedResponse,
} from "./friends-played.ts";

const venue = { id: "v1", cmsId: "sanity-court-1", name: "Padel Club" };

function friend(
  extras: Partial<FriendsPlayedFriend> & { userId: string },
): FriendsPlayedFriend {
  return {
    displayName: "Alex P.",
    avatarUrl: null,
    lastPlayedAt: "2026-09-10T14:00:00.000Z",
    summary: { sport: "golf", bestGross: 78, bestNet: 72 },
    ...extras,
  };
}

const payload: FriendsPlayedResponse = {
  venue,
  total: 1,
  friends: [friend({ userId: "user-alex" })],
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("friends-played API client", () => {
  it("GETs /api/venues/:id/friends-played with credentials", async () => {
    const calls: Array<{ url: string; credentials?: RequestCredentials }> = [];
    const result = await getVenueFriendsPlayedWith("sanity-court-1", {
      baseUrl: "https://app.test",
      cookie: "token=abc",
      fetch: async (input, init) => {
        calls.push({
          url: String(input),
          credentials: init?.credentials,
        });
        return jsonResponse(200, payload);
      },
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.payload.friends[0]?.displayName, "Alex P.");
      assert.equal(result.payload.friends[0]?.summary?.bestGross, 78);
    }
    assert.equal(
      calls[0]?.url,
      "https://app.test/api/venues/sanity-court-1/friends-played",
    );
    assert.equal(calls[0]?.credentials, "include");
  });

  it("treats 401 as signed-out without inventing rows", async () => {
    const result = await getVenueFriendsPlayedWith("sanity-court-1", {
      baseUrl: "https://app.test",
      fetch: async () => jsonResponse(401, { error: "Unauthorized" }),
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 401);
      assert.equal(result.error, "Unauthorized");
    }
  });

  it("parses a 200 empty list and null summaries", () => {
    const parsed = parseFriendsPlayedResponse({
      venue,
      total: 0,
      friends: [
        {
          userId: "user-skip-me-if-invalid",
        },
        {
          userId: "user-blake",
          displayName: "Blake G.",
          avatarUrl: null,
          lastPlayedAt: "2026-09-01T10:00:00.000Z",
          summary: null,
        },
      ],
    });
    assert.equal(parsed?.total, 0);
    assert.equal(parsed?.friends.length, 1);
    assert.equal(parsed?.friends[0]?.summary, null);
    assert.equal(parsed?.friends[0]?.displayName, "Blake G.");
  });
});

describe("friends-played visibility", () => {
  const startHref = "/padel/new?venue=the-grid";

  it("hides the block when anonymous", () => {
    const view = friendsPlayedView({
      isAuthenticated: false,
      result: { ok: true, payload, status: 200 },
      startHref,
    });
    assert.deepEqual(view, { visible: false, reason: "anonymous" });
  });

  it("hides the block while auth is loading", () => {
    const view = friendsPlayedView({
      isAuthenticated: false,
      authLoading: true,
      result: null,
      startHref,
    });
    assert.equal(view.visible, false);
    if (!view.visible) assert.equal(view.reason, "loading");
  });

  it("hides the block on 401 (signed-out)", () => {
    const view = friendsPlayedView({
      isAuthenticated: true,
      result: { ok: false, error: "Unauthorized", status: 401 },
      startHref,
    });
    assert.deepEqual(view, { visible: false, reason: "unauthorized" });
  });
});

describe("friends-played CTA copy", () => {
  it("uses Beat FirstName's score for one clear named target", () => {
    assert.equal(friendFirstName("Alex P."), "Alex");
    assert.equal(
      friendsPlayedCtaLabel([friend({ userId: "user-alex" })]),
      "Beat Alex's score",
    );
  });

  it("uses Beat their score when the name is not a clear target", () => {
    assert.equal(friendFirstName("A."), null);
    assert.equal(
      friendsPlayedCtaLabel([
        friend({ userId: "user-a", displayName: "A." }),
      ]),
      FRIENDS_PLAYED_DEFAULT_CTA,
    );
    assert.equal(
      friendsPlayedCtaLabel([
        friend({ userId: "user-alex" }),
        friend({ userId: "user-blake", displayName: "Blake G." }),
      ]),
      FRIENDS_PLAYED_DEFAULT_CTA,
    );
  });

  it("uses the empty-state CTA when no friends have played", () => {
    assert.equal(friendsPlayedCtaLabel([]), FRIENDS_PLAYED_EMPTY_CTA);
  });
});

describe("friends-played overflow +N from total", () => {
  it("caps the list at 6 and derives +N from total", () => {
    const friends = Array.from({ length: 6 }, (_, i) =>
      friend({ userId: `user-${i}`, displayName: `Friend ${i}` }),
    );
    const listed = listedFriendsPlayed(friends);
    assert.equal(listed.length, 6);
    assert.equal(friendsPlayedOverflow(12, listed.length), 6);
    assert.equal(friendsPlayedOverflowLabel(6), "+6");
    assert.equal(friendsPlayedOverflow(6, 6), 0);
    assert.equal(friendsPlayedOverflowLabel(0), null);
  });

  it("does not invent overflow when total is missing or smaller", () => {
    assert.equal(friendsPlayedOverflow(0, 0), 0);
    assert.equal(friendsPlayedOverflow(3, 6), 0);
  });
});

describe("friends-played Start href with venue prefilled", () => {
  it("opens the primary play sport start flow with ?venue=", () => {
    assert.equal(
      friendsPlayedStartHref({
        venueSlug: "glendower-golf-club",
        primarySport: "golf",
      }),
      "/golf/new?venue=glendower-golf-club",
    );
    assert.equal(
      friendsPlayedStartHref({
        venueSlug: "the-grid",
        primarySport: "padel",
      }),
      "/padel/new?venue=the-grid",
    );
    assert.equal(
      friendsPlayedStartHref({
        venueSlug: "the-dartboard",
        primarySport: "darts",
      }),
      "/darts/new?venue=the-dartboard",
    );
  });

  it("encodes the venue slug on the start URL", () => {
    assert.equal(
      friendsPlayedStartHref({
        venueSlug: "padel & co",
        primarySport: "padel",
      }),
      `/padel/new?venue=${encodeURIComponent("padel & co")}`,
    );
    assert.equal(
      friendsPlayedStartHref({
        venueSlug: "tigers-milk",
        primarySport: "rugby",
      }),
      "/play",
    );
  });
});

describe("friendsPlayedView signed-in states", () => {
  const startHref = "/golf/new?venue=glendower";

  it("shows the empty section with the first-to-play CTA", () => {
    const view = friendsPlayedView({
      isAuthenticated: true,
      result: {
        ok: true,
        payload: { venue, total: 0, friends: [] },
        status: 200,
      },
      startHref,
    });
    assert.equal(view.visible, true);
    if (!view.visible) return;
    assert.equal(view.empty, true);
    assert.equal(view.title, FRIENDS_PLAYED_SECTION_TITLE);
    assert.equal(view.ctaLabel, FRIENDS_PLAYED_EMPTY_CTA);
    assert.equal(view.startHref, startHref);
    assert.equal(view.overflow, 0);
  });

  it("shows listed friends, +N, named CTA, and the start href", () => {
    const friends = Array.from({ length: 6 }, (_, i) =>
      friend({
        userId: `user-${i}`,
        displayName: i === 0 ? "Alex P." : `Friend ${i}`,
      }),
    );
    const view = friendsPlayedView({
      isAuthenticated: true,
      result: {
        ok: true,
        payload: { venue, total: 12, friends },
        status: 200,
      },
      startHref,
    });
    assert.equal(view.visible, true);
    if (!view.visible) return;
    assert.equal(view.empty, false);
    assert.equal(view.friends.length, 6);
    assert.equal(view.overflow, 6);
    assert.equal(view.overflowLabel, "+6");
    assert.equal(view.ctaLabel, FRIENDS_PLAYED_DEFAULT_CTA);
    assert.equal(view.startHref, "/golf/new?venue=glendower");
  });
});
