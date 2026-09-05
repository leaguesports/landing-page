import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  notificationsFromFriends,
  unreadNotificationCount,
} from "./notifications.ts";

describe("notificationsFromFriends", () => {
  it("maps incoming friend requests newest first", () => {
    const items = notificationsFromFriends({
      incoming: [
        {
          id: "older",
          direction: "incoming",
          createdAt: "2026-09-04T10:00:00.000Z",
          user: {
            id: "a",
            displayName: "Alex",
            handle: "alex",
            avatarUrl: null,
          },
        },
        {
          id: "newer",
          direction: "incoming",
          createdAt: "2026-09-04T12:00:00.000Z",
          user: {
            id: "b",
            displayName: "Blake",
            handle: "blake",
            avatarUrl: "https://example.test/b.jpg",
          },
        },
      ],
    });

    assert.equal(items.length, 2);
    assert.equal(items[0]?.id, "friend_request:newer");
    assert.equal(items[0]?.kind, "friend_request");
    assert.equal(items[0]?.title, "Blake");
    assert.equal(items[0]?.body, "@blake wants to connect");
    assert.equal(items[0]?.request.id, "newer");
    assert.equal(items[1]?.request.id, "older");
    assert.equal(unreadNotificationCount(items), 2);
  });

  it("returns an empty inbox when there are no incoming requests", () => {
    const items = notificationsFromFriends({ incoming: [] });
    assert.deepEqual(items, []);
    assert.equal(unreadNotificationCount(items), 0);
  });
});
