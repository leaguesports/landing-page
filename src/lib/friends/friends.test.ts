import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  acceptFriendWith,
  listFriendsWith,
  removeFriendWith,
  requestFriendWith,
} from "./friends.ts";

describe("friends client", () => {
  it("lists friends, incoming, and outgoing requests", async () => {
    const snapshot = await listFriendsWith({
      fetch: async () =>
        new Response(
          JSON.stringify({
            friends: [
              {
                id: "b",
                displayName: "Blake",
                handle: "blake",
                avatarUrl: null,
                since: "2026-09-04T12:00:00.000Z",
              },
            ],
            incoming: [
              {
                id: "req-1",
                direction: "incoming",
                createdAt: "2026-09-04T11:00:00.000Z",
                user: {
                  id: "c",
                  displayName: "Casey",
                  handle: "casey",
                  avatarUrl: null,
                },
              },
            ],
            outgoing: [],
          }),
          { status: 200 },
        ),
      baseUrl: "https://api.example.test",
    });

    assert.equal(snapshot.friends.length, 1);
    assert.equal(snapshot.friends[0]?.handle, "blake");
    assert.equal(snapshot.incoming[0]?.user.handle, "casey");
    assert.deepEqual(snapshot.outgoing, []);
  });

  it("POSTs a friend request by handle", async () => {
    let sawBody = "";
    const result = await requestFriendWith("@blake", {
      fetch: async (_url, init) => {
        sawBody = String(init?.body ?? "");
        return new Response(
          JSON.stringify({
            status: "pending",
            request: {
              id: "req-1",
              direction: "outgoing",
              createdAt: "2026-09-04T12:00:00.000Z",
              user: {
                id: "b",
                displayName: "Blake",
                handle: "blake",
                avatarUrl: null,
              },
            },
          }),
          { status: 201 },
        );
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(sawBody, JSON.stringify({ handle: "blake" }));
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.status, "pending");
    }
  });

  it("accepts and removes friends", async () => {
    const accepted = await acceptFriendWith("user-a", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/me\/friends\/user-a\/accept$/);
        assert.equal(init?.method, "POST");
        return new Response(
          JSON.stringify({
            friend: {
              id: "user-a",
              displayName: "Alex",
              handle: "alex",
              avatarUrl: null,
              since: "2026-09-04T12:00:00.000Z",
            },
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(accepted.ok, true);

    const removed = await removeFriendWith("user-a", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/me\/friends\/user-a$/);
        assert.equal(init?.method, "DELETE");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(removed.ok, true);
  });
});
