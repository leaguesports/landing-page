import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import type { GameDayCard, GameDayCreated, HoleScoreSlot } from "../../types/golf-game-day.ts";
import {
  claimGameDay,
  confirmCard,
  fetchOrganiserGameDay,
  GAME_DAY_ORGANISER_HEADER,
  GAME_DAY_TOKEN_HEADER,
  GameDayApiError,
  patchGameDayPlayer,
  putHole,
  unlockCard,
} from "./api.ts";
import {
  applyCardUnlocked,
  applyScoreUpdated,
  cardActions,
  changedByNote,
  conflictNotice,
  gameDayUserMessage,
  holePutBody,
  holePutOutcome,
  nextQueuedHole,
} from "./multi-scorer.ts";
import { applyFlushResult } from "./queue.ts";
import { mergeCard } from "./scoring-ui.ts";
import {
  DEVICE_KEY,
  memoryStore,
  ORGANISER_KEY,
  readDevice,
  readOrganiser,
  rememberCreatedGameDay,
} from "./storage.ts";

function slot(overrides: Partial<HoleScoreSlot> = {}): HoleScoreSlot {
  return {
    slot: 1,
    strokes: 4,
    updatedByPlayerId: "mike",
    updatedByName: "Mike",
    updatedAt: "2026-11-01T07:12:01.000Z",
    ...overrides,
  };
}

function card(overrides: Partial<GameDayCard> = {}): GameDayCard {
  return {
    id: "card-2",
    gameDayId: "day-1",
    number: 2,
    status: "live",
    golfRoundId: null,
    holesPlayed: 18,
    startingHole: 1,
    scoring: true,
    scorer: { playerId: "pieter", displayName: "Pieter" },
    players: [
      {
        playerId: "mike",
        slot: 1,
        displayName: "Mike",
        handicapIndex: 6,
        playingHandicap: 7,
        courseHandicap: 7,
        teeName: "White",
        looksRight: false,
        isScorer: true,
        you: true,
      },
      {
        playerId: "lerato",
        slot: 2,
        displayName: "Lerato",
        handicapIndex: null,
        playingHandicap: 0,
        courseHandicap: null,
        teeName: "White",
        looksRight: false,
        isScorer: true,
        you: false,
      },
    ],
    course: { name: "Zebula", holes: [{ number: 8, par: 4, strokeIndex: 9 }] },
    tees: [],
    holes: [
      {
        number: 8,
        strokes: { "1": 4, "2": 5 },
        clientTimestamp: "2026-11-01T07:12:00.000Z",
        synced: true,
        scores: [
          slot(),
          slot({
            slot: 2,
            strokes: 5,
            updatedByPlayerId: "lerato",
            updatedByName: "Lerato",
            updatedAt: "2026-11-01T07:13:01.000Z",
          }),
        ],
      },
    ],
    missingHoles: [1],
    ...overrides,
  };
}

function created(overrides: Partial<GameDayCreated> = {}): GameDayCreated {
  return {
    id: "day-1",
    inviteCode: "ZB47",
    organiserToken: "org-secret",
    watchToken: "watch-secret",
    watchPath: "/api/golf-game-days/watch/watch-secret/leaderboard",
    claimed: false,
    organiserPlayerId: "brandon",
    venueCmsId: "sanity-course-1",
    venueName: "Zebula Golf Estate & Spa",
    date: "2026-11-01",
    dateLabel: "Sun 1 Nov",
    headline: "ZEBULA · SUN 1 NOV",
    defaultTee: "White",
    teeOptions: ["White"],
    format: "stroke",
    status: "setup",
    version: 0,
    weekendEventId: null,
    players: [
      {
        id: "brandon",
        displayName: "Brandon",
        handicapIndex: 14,
        teeName: "White",
        joined: true,
        isOrganiser: true,
        cardId: null,
        cardNumber: null,
        slot: null,
      },
    ],
    ...overrides,
  };
}

describe("organiser token storage and headers", () => {
  it("stores the organiser token per game day and uses it as the player's device token", () => {
    const store = memoryStore();
    rememberCreatedGameDay(store, created());
    rememberCreatedGameDay(
      store,
      created({
        id: "day-2",
        organiserToken: "other-secret",
        organiserPlayerId: null,
        players: [],
      }),
    );
    assert.equal(ORGANISER_KEY, "golf-gameday:v1:organiser");
    assert.equal(DEVICE_KEY, "golf-gameday:v1:device");
    assert.equal(readOrganiser(store, "day-1")?.organiserToken, "org-secret");
    assert.equal(readOrganiser(store, "day-2")?.organiserToken, "other-secret");
    assert.equal(readDevice(store, "day-1")?.deviceToken, "org-secret");
    assert.equal(readDevice(store, "day-1")?.playerId, "brandon");
    assert.equal(readDevice(store, "day-2"), null);
  });

  it("sends X-Game-Day-Organiser-Token on organiser calls and X-Game-Day-Token for the player", async () => {
    const calls: Array<{ url: string; headers: Record<string, string>; method?: string }> = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({
        url: String(url),
        method: init?.method,
        headers: (init?.headers ?? {}) as Record<string, string>,
      });
      const path = String(url);
      if (path.endsWith("/unlock")) {
        return new Response(JSON.stringify({ card: card(), version: 5, leaderboard: { gameDayId: "day-1" } }), {
          status: 200,
        });
      }
      if (path.includes("/holes/")) {
        return new Response(
          JSON.stringify({
            applied: true,
            reason: "applied",
            conflict: false,
            conflicts: [],
            version: 4,
            card: card(),
          }),
          { status: 200 },
        );
      }
      if (path.endsWith("/confirm")) {
        return new Response(
          JSON.stringify({ card: card(), golfRoundId: "round-1", version: 4, leaderboard: { gameDayId: "day-1" } }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify(created({ organiserToken: undefined, claimed: true })), { status: 200 });
    };
    const transport = { fetchImpl, baseUrl: "https://api.example" };
    await fetchOrganiserGameDay("day-1", "org-secret", transport);
    await claimGameDay("day-1", "org-secret", transport);
    await patchGameDayPlayer("day-1", "brandon", { displayName: "Hosty" }, "org-secret", transport);
    await unlockCard("day-1", "card-2", "org-secret", transport);
    await putHole(
      "day-1",
      "card-2",
      8,
      { deviceToken: "org-secret" },
      { clientTimestamp: "2026-11-01T07:12:00.000Z", strokes: { "1": 4 }, expectedUpdatedAt: { "1": null } },
      transport,
    );
    await confirmCard("day-1", "card-2", { deviceToken: "org-secret" }, transport);

    assert.equal(calls[0]?.headers[GAME_DAY_ORGANISER_HEADER], "org-secret");
    assert.equal(calls[0]?.headers[GAME_DAY_TOKEN_HEADER], undefined);
    assert.equal(calls[1]?.method, "POST");
    assert.match(calls[1]?.url ?? "", /\/claim$/);
    assert.equal(calls[1]?.headers[GAME_DAY_ORGANISER_HEADER], "org-secret");
    assert.equal(calls[2]?.method, "PATCH");
    assert.match(calls[2]?.url ?? "", /\/players\/brandon$/);
    assert.equal(calls[2]?.headers[GAME_DAY_ORGANISER_HEADER], "org-secret");
    assert.equal(calls[3]?.headers[GAME_DAY_ORGANISER_HEADER], "org-secret");
    assert.equal(calls[3]?.headers[GAME_DAY_TOKEN_HEADER], undefined);
    assert.equal(calls[4]?.headers[GAME_DAY_TOKEN_HEADER], "org-secret");
    assert.equal(calls[4]?.headers[GAME_DAY_ORGANISER_HEADER], undefined);
    assert.equal(calls[5]?.headers[GAME_DAY_TOKEN_HEADER], "org-secret");
    assert.equal(calls[5]?.headers[GAME_DAY_ORGANISER_HEADER], undefined);
  });
});

describe("offline score queue", () => {
  it("sends expectedUpdatedAt per slot and keeps a conflict as a successful write", async () => {
    const bodies: string[] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      bodies.push(String(init?.body));
      return new Response(
        JSON.stringify({
          applied: true,
          reason: "applied",
          conflict: true,
          conflicts: [
            {
              slot: 1,
              previous: {
                strokes: 5,
                updatedByPlayerId: "mike",
                updatedByName: "Mike",
                updatedAt: "2026-11-01T07:11:00.000Z",
              },
            },
          ],
          version: 4,
          card: card(),
        }),
        { status: 200 },
      );
    };
    const queued = nextQueuedHole(
      null,
      { "1": 4, "2": 5 },
      {
        strokes: { "2": 5 },
        scores: [slot({ slot: 2, updatedAt: "2026-11-01T07:13:01.000Z" })],
      },
    );
    assert.deepEqual(queued.strokes, { "1": 4 });
    assert.deepEqual(queued.expectedUpdatedAt, { "1": null });
    const response = await putHole(
      "day-1",
      "card-2",
      8,
      { deviceToken: "device-secret" },
      holePutBody({
        clientTimestamp: "2026-11-01T07:12:00.000Z",
        strokes: queued.strokes,
        expectedUpdatedAt: queued.expectedUpdatedAt,
      }),
      { fetchImpl, baseUrl: "https://api.example" },
    );
    assert.deepEqual(JSON.parse(bodies[0] ?? "{}"), {
      clientTimestamp: "2026-11-01T07:12:00.000Z",
      strokes: { "1": 4 },
      expectedUpdatedAt: { "1": null },
    });
    assert.equal(response.conflict, true);
    assert.equal(response.conflicts[0]?.previous?.strokes, 5);
    const outcome = holePutOutcome(response);
    assert.deepEqual(outcome, { ok: true, reason: "applied" });
    const queuedItem = {
      gameDayId: "day-1",
      cardId: "card-2",
      holeNumber: 8,
      clientTimestamp: "2026-11-01T07:12:00.000Z",
      strokes: { "1": 4 },
      expectedUpdatedAt: { "1": null },
      state: "queued" as const,
      attempts: 0,
    };
    assert.deepEqual(applyFlushResult([queuedItem], queuedItem, outcome).queue, []);
    assert.equal(
      conflictNotice(response.conflicts, 8, {
        strokes: queued.strokes,
        names: { 1: "Lerato" },
      }),
      "Lerato · hole 8 was 5 on another phone, now 4",
    );
    assert.equal(
      conflictNotice([{ slot: 2, previous: null }], 8, {
        strokes: { "2": 4 },
        names: { 2: "Lerato" },
      }),
      "Lerato · hole 8 was empty on another phone, now 4",
    );
  });

  it("treats replay as success and does not surface a conflict", () => {
    const outcome = holePutOutcome({ reason: "replay" });
    assert.deepEqual(outcome, { ok: true, reason: "replay" });
    const item = {
      gameDayId: "day-1",
      cardId: "card-2",
      holeNumber: 8,
      clientTimestamp: "2026-11-01T07:12:00.000Z",
      strokes: { "1": 4 },
      state: "queued" as const,
      attempts: 0,
    };
    const flushed = applyFlushResult([item], item, outcome);
    assert.deepEqual(flushed.queue, []);
    assert.equal(flushed.stop, false);
    assert.equal(conflictNotice([], 8), null);
  });
});

describe("realtime score.updated and card.unlocked", () => {
  it("applies only the changed slots", () => {
    const before = card();
    const next = applyScoreUpdated(before, {
      cardId: "card-2",
      holeNumber: 8,
      scores: [
        slot({
          strokes: 6,
          updatedByPlayerId: "lerato",
          updatedByName: "Lerato",
          updatedAt: "2026-11-01T07:14:01.000Z",
        }),
      ],
    });
    assert.equal(next.holes[0]?.strokes["1"], 6);
    assert.equal(next.holes[0]?.strokes["2"], 5);
    assert.equal(next.holes[0]?.scores?.find((score) => score.slot === 2)?.strokes, 5);
    assert.equal(next.holes[0]?.scores?.find((score) => score.slot === 1)?.updatedByName, "Lerato");
    assert.equal(next.players[0]?.you, true);
    assert.equal(next.scoring, true);
    assert.equal(before.holes[0]?.strokes["1"], 4);
  });

  it("opens a locked card on card.unlocked and leaves a different card alone", () => {
    const locked = card({ status: "locked" });
    const opened = applyCardUnlocked(locked, { cardId: "card-2" });
    assert.equal(opened.status, "live");
    assert.equal(opened.holes[0]?.strokes["2"], 5);
    assert.equal(applyCardUnlocked(locked, { cardId: "card-9" }).status, "locked");
  });

  it("notes a score written by someone else", () => {
    assert.equal(
      changedByNote(slot({ updatedByName: "Lerato", updatedByPlayerId: "lerato" }), {
        playerId: "mike",
        displayName: "Mike",
      }),
      "changed by Lerato",
    );
    assert.equal(
      changedByNote(slot(), { playerId: "mike", displayName: "Mike" }),
      null,
    );
  });
});

describe("confirm permissions", () => {
  it("lets any seated player confirm and lets the organiser unlock", () => {
    const ready = { pendingSync: false, openHoles: [] as number[] };
    assert.equal(cardActions({ status: "live", seated: true, organiser: false, ...ready }).canConfirm, true);
    assert.equal(cardActions({ status: "live", seated: false, organiser: true, ...ready }).canConfirm, true);
    assert.equal(cardActions({ status: "live", seated: false, organiser: false, ...ready }).canConfirm, false);
    assert.equal(cardActions({ status: "live", seated: false, organiser: false, ...ready }).reason, null);
    const locked = cardActions({ status: "locked", seated: true, organiser: true, ...ready });
    assert.equal(locked.canConfirm, false);
    assert.equal(locked.canUnlock, true);
    assert.equal(locked.canScore, true);
    assert.equal(cardActions({ status: "locked", seated: true, organiser: false, ...ready }).canScore, false);
    assert.equal(cardActions({ status: "locked", seated: true, organiser: false, ...ready }).canUnlock, false);
    assert.match(
      cardActions({ status: "live", seated: true, organiser: false, pendingSync: false, openHoles: [3] }).reason ?? "",
      /Still to score: 3/,
    );
  });

  it("keeps scoring for every seated player, including someone who did not start the card", () => {
    const merged = mergeCard(card({ scoring: false }), "lerato");
    assert.equal(merged.scoring, true);
    assert.equal(merged.players.find((player) => player.playerId === "lerato")?.you, true);
    assert.equal(mergeCard(card({ scoring: false }), "spectator").scoring, false);
  });
});

describe("game day error copy", () => {
  it("maps 401, 403, 409 and 429 to clean messages", async () => {
    assert.equal(gameDayUserMessage(401, "Unauthorized"), "Sign in to continue.");
    assert.equal(gameDayUserMessage(403, "Watch token is read-only"), "Watch token is read-only");
    assert.equal(gameDayUserMessage(403, "Forbidden"), "You can't do that.");
    assert.equal(gameDayUserMessage(409, "Card is confirmed"), "Card is confirmed");
    assert.equal(gameDayUserMessage(409, "Conflict"), "That was already updated.");
    assert.equal(
      gameDayUserMessage(429, "Too many requests"),
      "Too many requests. Try again in a little while.",
    );
    assert.equal(
      gameDayUserMessage(429, "Too many game days created. Try again in a little while."),
      "Too many game days created. Try again in a little while.",
    );

    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await assert.rejects(
      () => fetchOrganiserGameDay("day-1", null, { fetchImpl, baseUrl: "https://api.example" }),
      (error: unknown) => {
        assert.ok(error instanceof GameDayApiError);
        assert.equal(error.status, 401);
        assert.equal(error.message, "Sign in to continue.");
        return true;
      },
    );
  });
});

describe("exclusive scorer copy", () => {
  it("is gone from the joined, score, and review screens", () => {
    const read = (name: string) =>
      readFileSync(new URL(`../../components/golf-game-day/${name}`, import.meta.url), "utf8");
    const join = read("JoinGameDay.tsx");
    const score = read("ScoreEntry.tsx");
    const review = read("CardReview.tsx");
    assert.equal(join.includes("Take over scoring"), false);
    assert.equal(join.includes(">Scoring<"), false);
    assert.equal(score.includes("is now scoring"), false);
    assert.equal(review.includes("Only the scorer confirms"), false);
  });
});
