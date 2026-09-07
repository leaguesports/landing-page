import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { HUB_PLAY_HREF } from "../sports/hub-ia.ts";
import {
  applyInboxAllRead,
  applyInboxNotificationRead,
  dispatchInboxChanged,
  emptyInboxPage,
  formatUnreadBadge,
  INBOX_CHANGED_EVENT,
  inboxListUrl,
  inboxNotificationCopy,
  inboxNotificationHref,
  inboxReadAllUrl,
  inboxReadPath,
  inboxReadUrl,
  INBOX_LIST_PATH,
  INBOX_PROXY_SOURCES,
  INBOX_READ_ALL_PATH,
  isOrganisedGameInvite,
  listInboxNotificationsWith,
  markAllInboxNotificationsReadWith,
  markInboxNotificationReadWith,
  organisedGameInviteHref,
  parseInboxNotification,
  parseInboxNotificationsPage,
  type InboxNotificationsPage,
  type OrganisedGameInviteNotification,
} from "./inbox.ts";

const ACTOR = {
  id: "host-1",
  displayName: "Alex",
  handle: "alex",
  avatarUrl: null,
};

const INVITE: OrganisedGameInviteNotification = {
  id: "n-1",
  type: "organised_game_invite",
  actor: ACTOR,
  payload: {
    organisedGameId: "game-1",
    sport: "padel",
    startsAt: "2026-09-07T18:00:00.000Z",
    venueCmsId: "sanity-court-1",
  },
  readAt: null,
  createdAt: "2026-09-07T10:00:00.000Z",
};

describe("inbox paths", () => {
  it("builds list, read, and read-all URLs", () => {
    assert.equal(INBOX_LIST_PATH, "/api/me/notifications");
    assert.equal(INBOX_READ_ALL_PATH, "/api/me/notifications/read-all");
    assert.equal(inboxReadPath("n-1"), "/api/me/notifications/n-1/read");
    assert.equal(
      inboxListUrl("https://api.example.test"),
      "https://api.example.test/api/me/notifications",
    );
    assert.equal(
      inboxListUrl("https://api.example.test", { limit: 20, cursor: "abc" }),
      "https://api.example.test/api/me/notifications?limit=20&cursor=abc",
    );
    assert.equal(
      inboxReadUrl("https://api.example.test", "n-1"),
      "https://api.example.test/api/me/notifications/n-1/read",
    );
    assert.equal(
      inboxReadAllUrl("https://api.example.test"),
      "https://api.example.test/api/me/notifications/read-all",
    );
    assert.deepEqual(INBOX_PROXY_SOURCES, [
      "/api/me/notifications",
      "/api/me/notifications/read-all",
      "/api/me/notifications/:id/read",
    ]);
  });
});

describe("formatUnreadBadge", () => {
  it("hides a zero count and caps at 9+", () => {
    assert.equal(formatUnreadBadge(0), null);
    assert.equal(formatUnreadBadge(-1), null);
    assert.equal(formatUnreadBadge(1), "1");
    assert.equal(formatUnreadBadge(9), "9");
    assert.equal(formatUnreadBadge(10), "9+");
    assert.equal(formatUnreadBadge(99), "9+");
  });
});

describe("organisedGameInviteHref", () => {
  it("deep-links to organised game detail from payload", () => {
    assert.equal(
      organisedGameInviteHref({ organisedGameId: "game-1" }),
      "/play/organised/game-1",
    );
    assert.equal(
      inboxNotificationHref(INVITE),
      "/play/organised/game-1",
    );
    assert.equal(organisedGameInviteHref({ organisedGameId: "  " }), HUB_PLAY_HREF);
  });

  it("returns null for unknown types", () => {
    assert.equal(
      inboxNotificationHref({
        id: "n-x",
        type: "future_type",
        actor: ACTOR,
        payload: {},
        readAt: null,
        createdAt: INVITE.createdAt,
      }),
      null,
    );
  });
});

describe("parseInboxNotification", () => {
  it("parses organised_game_invite and keeps unknown types", () => {
    assert.deepEqual(parseInboxNotification(INVITE), INVITE);

    const unknown = parseInboxNotification({
      id: "n-2",
      type: "something_else",
      actor: ACTOR,
      payload: { foo: 1 },
      readAt: "2026-09-07T11:00:00.000Z",
      createdAt: INVITE.createdAt,
    });
    assert.equal(unknown?.type, "something_else");
    assert.equal(unknown?.id, "n-2");
    assert.equal(inboxNotificationHref(unknown!), null);

    assert.equal(parseInboxNotification({ id: "x" }), null);
    assert.equal(
      parseInboxNotification({
        ...INVITE,
        payload: { organisedGameId: "game-1", sport: "darts" },
      }),
      null,
    );
  });

  it("builds invite copy and treats a missing venue as null", () => {
    const parsed = parseInboxNotification({
      ...INVITE,
      payload: { ...INVITE.payload, venueCmsId: null },
    });
    assert.ok(parsed && isOrganisedGameInvite(parsed));
    if (parsed && isOrganisedGameInvite(parsed)) {
      assert.equal(parsed.payload.venueCmsId, null);
    }
    assert.deepEqual(inboxNotificationCopy(INVITE), {
      title: "Alex",
      body: "invited you to padel",
    });
  });
});

describe("parseInboxNotificationsPage", () => {
  it("keeps well-formed rows and drops junk", () => {
    const page = parseInboxNotificationsPage({
      notifications: [INVITE, { nope: true }, { id: "n-x", type: "x", createdAt: INVITE.createdAt }],
      unreadCount: 2,
      nextCursor: "next",
    });
    assert.equal(page?.notifications.length, 2);
    assert.equal(page?.unreadCount, 2);
    assert.equal(page?.nextCursor, "next");
    assert.equal(parseInboxNotificationsPage({}), null);
  });
});

describe("applyInboxNotificationRead", () => {
  it("marks one item and decrements unreadCount", () => {
    const page: InboxNotificationsPage = {
      notifications: [INVITE],
      unreadCount: 1,
      nextCursor: null,
    };
    const next = applyInboxNotificationRead(page, "n-1", "2026-09-07T12:00:00.000Z");
    assert.equal(next.notifications[0]?.readAt, "2026-09-07T12:00:00.000Z");
    assert.equal(next.unreadCount, 0);

    const again = applyInboxNotificationRead(next, "n-1", "2026-09-07T13:00:00.000Z");
    assert.equal(again.unreadCount, 0);

    const all = applyInboxAllRead(page, "2026-09-07T12:00:00.000Z");
    assert.equal(all.unreadCount, 0);
    assert.equal(all.notifications[0]?.readAt, "2026-09-07T12:00:00.000Z");
    assert.deepEqual(emptyInboxPage(), {
      notifications: [],
      unreadCount: 0,
      nextCursor: null,
    });
  });
});

describe("inbox-changed event", () => {
  it("notifies listeners so the header can refetch", () => {
    const previous = globalThis.window;
    const target = new EventTarget();
    // @ts-expect-error test shim
    globalThis.window = target;

    let seen = 0;
    target.addEventListener(INBOX_CHANGED_EVENT, () => {
      seen += 1;
    });
    dispatchInboxChanged();
    assert.equal(seen, 1);

    globalThis.window = previous;
  });
});

describe("inbox client", () => {
  it("lists from GET /api/me/notifications with credentials", async () => {
    const result = await listInboxNotificationsWith(
      {
        fetch: async (url, init) => {
          assert.equal(
            String(url),
            "https://api.example.test/api/me/notifications?limit=20",
          );
          assert.equal(init?.method, "GET");
          assert.equal(init?.credentials, "include");
          return new Response(
            JSON.stringify({
              notifications: [INVITE],
              unreadCount: 1,
              nextCursor: null,
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
      { limit: 20 },
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.unreadCount, 1);
    assert.equal(result.value.notifications[0]?.id, "n-1");
  });

  it("POSTs /:id/read and /read-all", async () => {
    const read = await markInboxNotificationReadWith("n-1", {
      fetch: async (url, init) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/me/notifications/n-1/read",
        );
        assert.equal(init?.method, "POST");
        assert.equal(init?.credentials, "include");
        return new Response(
          JSON.stringify({
            notification: {
              ...INVITE,
              readAt: "2026-09-07T12:00:00.000Z",
            },
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(read.ok, true);
    if (read.ok) assert.equal(read.value.readAt, "2026-09-07T12:00:00.000Z");

    const all = await markAllInboxNotificationsReadWith({
      fetch: async (url, init) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/me/notifications/read-all",
        );
        assert.equal(init?.method, "POST");
        return new Response(
          JSON.stringify({ ok: true, unreadCount: 0 }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(all.ok, true);
    if (all.ok) assert.equal(all.value.unreadCount, 0);
  });

  it("returns ok:false on list failures", async () => {
    const result = await listInboxNotificationsWith({
      fetch: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.status, 401);
    assert.equal(result.error, "Unauthorized");
  });
});
