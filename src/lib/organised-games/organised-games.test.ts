import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCreateOrganisedGamePayload,
  createOrganisedGameWith,
  emptyOrganisedGamesSnapshot,
  formatOrganisedGameRsvp,
  formatOrganisedGameSport,
  formatOrganisedGameStatus,
  getOrganisedGameWith,
  joinOrganisedGameInviteWith,
  listMyOrganisedGamesWith,
  organisedGameOccupiedCount,
  ORGANISED_GAME_CAPACITY_DEFAULT,
  ORGANISED_GAME_NOTES_MAX,
  parseOrganisedGame,
  previewOrganisedGameInviteWith,
  rsvpOrganisedGameWith,
  startOrganisedGameWith,
  type OrganisedGame,
} from "./organised-games.ts";

const HOST = {
  id: "user-a",
  displayName: "Alex",
  handle: "alex",
  avatarUrl: null,
};

const INVITEE = {
  id: "user-b",
  displayName: "Blake",
  handle: "blake",
  avatarUrl: null,
  inviteId: "inv-1",
  rsvp: "pending" as const,
  invitedAt: "2026-09-07T10:00:00.000Z",
  respondedAt: null,
};

const GAME: OrganisedGame = {
  id: "game-1",
  sport: "padel",
  status: "open",
  venueCmsId: "sanity-court-1",
  startsAt: "2026-09-07T18:00:00.000Z",
  notes: "Sunday hit",
  capacity: 4,
  host: HOST,
  invitees: [INVITEE],
  inviteToken: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  viewer: { role: "host", rsvp: null },
  live: null,
  createdAt: "2026-09-07T10:00:00.000Z",
  updatedAt: "2026-09-07T10:00:00.000Z",
};

describe("organised game parsers and helpers", () => {
  it("parses a host game and rejects unknown sports or invalid live paths", () => {
    const parsed = parseOrganisedGame(GAME);
    assert.deepEqual(parsed, GAME);
    assert.equal(parseOrganisedGame({ ...GAME, sport: "darts" }), null);
    assert.equal(parseOrganisedGame({ ...GAME, invitees: [{ id: "x" }] }), null);
    assert.equal(
      parseOrganisedGame({
        ...GAME,
        live: { sport: "padel", id: "m1", path: "padel/m1" },
      }),
      null,
    );
  });

  it("counts host plus non-declined invitees", () => {
    assert.equal(organisedGameOccupiedCount(GAME), 2);
    assert.equal(
      organisedGameOccupiedCount({
        ...GAME,
        invitees: [
          { ...INVITEE, rsvp: "accepted" },
          { ...INVITEE, id: "user-c", inviteId: "inv-2", rsvp: "declined" },
        ],
      }),
      2,
    );
  });

  it("formats sport, status, and RSVP labels", () => {
    assert.equal(formatOrganisedGameSport("padel"), "Padel");
    assert.equal(formatOrganisedGameSport("golf"), "Golf");
    assert.equal(formatOrganisedGameStatus("open"), "Open");
    assert.equal(formatOrganisedGameStatus("started"), "Started");
    assert.equal(formatOrganisedGameStatus("cancelled"), "Cancelled");
    assert.equal(formatOrganisedGameRsvp("accepted"), "In");
    assert.equal(formatOrganisedGameRsvp("declined"), "Out");
    assert.equal(formatOrganisedGameRsvp("pending"), "Pending");
    assert.equal(formatOrganisedGameRsvp(null), "Host");
  });
});

describe("buildCreateOrganisedGamePayload", () => {
  it("requires sport, venue, and a valid startsAt ISO", () => {
    assert.equal(
      buildCreateOrganisedGamePayload({
        sport: "darts",
        venueCmsId: "v1",
        startsAt: "2026-09-07T18:00:00.000Z",
      }).ok,
      false,
    );
    assert.equal(
      buildCreateOrganisedGamePayload({
        sport: "padel",
        venueCmsId: "  ",
        startsAt: "2026-09-07T18:00:00.000Z",
      }).ok,
      false,
    );
    assert.equal(
      buildCreateOrganisedGamePayload({
        sport: "golf",
        venueCmsId: "v1",
        startsAt: "not-a-date",
      }).ok,
      false,
    );
  });

  it("defaults capacity to 4, omits blank notes, and unique-ifies invites", () => {
    const result = buildCreateOrganisedGamePayload({
      sport: "padel",
      venueCmsId: "  sanity-court-1  ",
      startsAt: "2026-09-07T18:00:00.000Z",
      notes: "   ",
      inviteUserIds: ["b", "b", "  ", "c"],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.payload, {
      sport: "padel",
      venueCmsId: "sanity-court-1",
      startsAt: "2026-09-07T18:00:00.000Z",
      capacity: ORGANISED_GAME_CAPACITY_DEFAULT,
      inviteUserIds: ["b", "c"],
    });
  });

  it("keeps trimmed notes and rejects over-length notes or capacity", () => {
    const notes = buildCreateOrganisedGamePayload({
      sport: "golf",
      venueCmsId: "course-1",
      startsAt: "2026-09-07T18:00:00.000Z",
      notes: "  Sunday hit  ",
      capacity: 6,
    });
    assert.equal(notes.ok, true);
    if (!notes.ok) return;
    assert.equal(notes.payload.notes, "Sunday hit");
    assert.equal(notes.payload.capacity, 6);

    assert.equal(
      buildCreateOrganisedGamePayload({
        sport: "padel",
        venueCmsId: "v1",
        startsAt: "2026-09-07T18:00:00.000Z",
        notes: "x".repeat(ORGANISED_GAME_NOTES_MAX + 1),
      }).ok,
      false,
    );
    assert.equal(
      buildCreateOrganisedGamePayload({
        sport: "padel",
        venueCmsId: "v1",
        startsAt: "2026-09-07T18:00:00.000Z",
        capacity: 1,
      }).ok,
      false,
    );
    assert.equal(
      buildCreateOrganisedGamePayload({
        sport: "padel",
        venueCmsId: "v1",
        startsAt: "2026-09-07T18:00:00.000Z",
        capacity: 9,
      }).ok,
      false,
    );
  });
});

describe("organised games client", () => {
  it("lists hosted and invited from GET /api/me/organised-games", async () => {
    const result = await listMyOrganisedGamesWith({
      fetch: async (url) => {
        assert.equal(String(url), "https://api.example.test/api/me/organised-games");
        return new Response(
          JSON.stringify({ hosted: [GAME], invited: [] }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.hosted[0]?.id, "game-1");
    assert.deepEqual(result.value.invited, []);
  });

  it("returns empty snapshot helper", () => {
    assert.deepEqual(emptyOrganisedGamesSnapshot(), { hosted: [], invited: [] });
  });

  it("creates a game with venue + startsAt and optional invites", async () => {
    let sawBody = "";
    const built = buildCreateOrganisedGamePayload({
      sport: "padel",
      venueCmsId: "sanity-court-1",
      startsAt: "2026-09-07T18:00:00.000Z",
      inviteUserIds: ["user-b"],
    });
    assert.equal(built.ok, true);
    if (!built.ok) return;

    const result = await createOrganisedGameWith(built.payload, {
      fetch: async (url, init) => {
        assert.equal(String(url), "https://api.example.test/api/organised-games");
        assert.equal(init?.method, "POST");
        sawBody = String(init?.body ?? "");
        return new Response(JSON.stringify({ game: GAME }), { status: 201 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.id, "game-1");
    const body = JSON.parse(sawBody) as Record<string, unknown>;
    assert.equal(body.sport, "padel");
    assert.equal(body.venueCmsId, "sanity-court-1");
    assert.equal(body.startsAt, "2026-09-07T18:00:00.000Z");
    assert.deepEqual(body.inviteUserIds, ["user-b"]);
  });

  it("loads detail, RSVPs, starts into live.path, and joins via token", async () => {
    const detail = await getOrganisedGameWith("game-1", {
      fetch: async (url) => {
        assert.match(String(url), /\/api\/organised-games\/game-1$/);
        return new Response(JSON.stringify({ game: GAME }), { status: 200 });
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(detail.ok, true);

    const rsvp = await rsvpOrganisedGameWith("game-1", "accepted", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/rsvp$/);
        assert.equal(init?.method, "POST");
        assert.equal(String(init?.body), JSON.stringify({ rsvp: "accepted" }));
        return new Response(
          JSON.stringify({
            game: {
              ...GAME,
              viewer: { role: "invitee", rsvp: "accepted" },
              invitees: [{ ...INVITEE, rsvp: "accepted" }],
              inviteToken: null,
            },
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(rsvp.ok, true);
    if (rsvp.ok) assert.equal(rsvp.value.viewer.rsvp, "accepted");

    const started = await startOrganisedGameWith("game-1", {
      fetch: async (url) => {
        assert.match(String(url), /\/start$/);
        return new Response(
          JSON.stringify({
            game: {
              ...GAME,
              status: "started",
              live: { sport: "padel", id: "m1", path: "/padel/m1" },
            },
            live: { sport: "padel", id: "m1", path: "/padel/m1" },
          }),
          { status: 201 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(started.ok, true);
    if (!started.ok) return;
    assert.equal(started.value.live.path, "/padel/m1");

    const preview = await previewOrganisedGameInviteWith("tok", {
      fetch: async (url) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/organised-games/invite/tok",
        );
        return new Response(
          JSON.stringify({
            game: {
              ...GAME,
              inviteToken: null,
              viewer: { role: "guest", rsvp: null },
            },
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(preview.ok, true);
    if (preview.ok) assert.equal(preview.value.viewer.role, "guest");

    const joined = await joinOrganisedGameInviteWith("tok", {
      fetch: async (url, init) => {
        assert.equal(
          String(url),
          "https://api.example.test/api/organised-games/invite/tok/join",
        );
        assert.equal(init?.method, "POST");
        return new Response(
          JSON.stringify({
            game: {
              ...GAME,
              inviteToken: null,
              viewer: { role: "invitee", rsvp: "pending" },
            },
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(joined.ok, true);
    if (joined.ok) assert.equal(joined.value.viewer.role, "invitee");
  });

  it("surfaces API error copy on start-window 400", async () => {
    const result = await startOrganisedGameWith("game-1", {
      fetch: async () =>
        new Response(
          JSON.stringify({
            error:
              "Host can start from 12 hours before startsAt until 24 hours after",
          }),
          { status: 400 },
        ),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /12 hours before startsAt/i);
    assert.equal(result.status, 400);
  });
});
