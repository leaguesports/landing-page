import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { QueuedHolePut, QueuedLooksRight } from "../../types/golf-game-day.ts";
import {
  applyFlushResult,
  applyLooksRightFlush,
  enqueueHolePut,
  enqueueLooksRight,
  flushHoleQueue,
  flushLooksRightQueue,
} from "./queue.ts";
import {
  HOLE_QUEUE_KEY,
  LOOKS_RIGHT_QUEUE_KEY,
  memoryStore,
  readHoleQueue,
  readLooksRightQueue,
  writeHoleQueue,
  writeLooksRightQueue,
} from "./storage.ts";

function put(overrides: Partial<QueuedHolePut> = {}): QueuedHolePut {
  return {
    gameDayId: "day-1",
    cardId: "card-1",
    holeNumber: 8,
    clientTimestamp: "2026-11-01T07:12:00.000Z",
    strokes: { "1": 4 },
    state: "queued",
    attempts: 0,
    ...overrides,
  };
}

describe("hole put queue", () => {
  it("stores clientTimestamp and replaces the same hole with a newer write", () => {
    const first = put();
    const newer = put({
      clientTimestamp: "2026-11-01T07:13:00.000Z",
      strokes: { "1": 5 },
    });
    const queue = enqueueHolePut(enqueueHolePut([], first), newer);
    assert.equal(queue.length, 1);
    assert.equal(queue[0]?.clientTimestamp, newer.clientTimestamp);
    assert.deepEqual(queue[0]?.strokes, { "1": 5 });
  });

  it("keeps the newer queued write when an older timestamp arrives", () => {
    const newer = put({ clientTimestamp: "2026-11-01T07:13:00.000Z", strokes: { "1": 5 } });
    const older = put({ clientTimestamp: "2026-11-01T07:12:00.000Z", strokes: { "1": 6 } });
    const queue = enqueueHolePut(enqueueHolePut([], newer), older);
    assert.equal(queue.length, 1);
    assert.equal(queue[0]?.clientTimestamp, newer.clientTimestamp);
    assert.deepEqual(queue[0]?.strokes, { "1": 5 });
  });

  it("round-trips the queue through localStorage-shaped storage", () => {
    const store = memoryStore();
    const queue = [
      put({ holeNumber: 1, clientTimestamp: "2026-11-01T07:00:00.000Z" }),
      put({ holeNumber: 8, clientTimestamp: "2026-11-01T07:12:00.000Z", state: "offline" }),
    ];
    writeHoleQueue(store, queue);
    assert.ok(store.get(HOLE_QUEUE_KEY)?.includes("2026-11-01T07:12:00.000Z"));
    assert.deepEqual(readHoleQueue(store), queue);
  });

  it("drops applied, replay, and stale writes", () => {
    for (const reason of ["applied", "replay", "stale"] as const) {
      const item = put();
      const result = applyFlushResult([item], item, { ok: true, reason });
      assert.deepEqual(result.queue, [], reason);
      assert.equal(result.stop, false);
    }
  });

  it("keeps a network failure, marks it offline, and stops the flush", () => {
    const first = put({ holeNumber: 1, clientTimestamp: "2026-11-01T07:00:00.000Z" });
    const second = put({ holeNumber: 2, clientTimestamp: "2026-11-01T07:01:00.000Z" });
    const result = applyFlushResult([first, second], first, {
      ok: false,
      kind: "network",
    });
    assert.equal(result.stop, true);
    assert.equal(result.queue[0]?.state, "offline");
    assert.equal(result.queue[0]?.attempts, 1);
    assert.equal(result.queue[1]?.holeNumber, 2);
  });

  it("retries a stored offline put once the send succeeds", async () => {
    const item = put({ state: "offline", attempts: 1 });
    const sent: string[] = [];
    let online = false;
    const failed = await flushHoleQueue([item], async (queued) => {
      sent.push(queued.clientTimestamp);
      if (!online) return { ok: false, kind: "network" };
      return { ok: true, reason: "applied" };
    });
    assert.equal(failed.length, 1);
    assert.equal(failed[0]?.state, "offline");
    online = true;
    const cleared = await flushHoleQueue(failed, async (queued) => {
      sent.push(queued.clientTimestamp);
      return { ok: true, reason: "applied" };
    });
    assert.deepEqual(cleared, []);
    assert.deepEqual(sent, [item.clientTimestamp, item.clientTimestamp]);
  });

  it("sends oldest clientTimestamp first and keeps a later hole when the first fails", async () => {
    const early = put({ holeNumber: 3, clientTimestamp: "2026-11-01T07:00:00.000Z" });
    const late = put({ holeNumber: 4, clientTimestamp: "2026-11-01T07:05:00.000Z" });
    const order: number[] = [];
    const remaining = await flushHoleQueue([late, early], async (queued) => {
      order.push(queued.holeNumber);
      return { ok: false, kind: "network" };
    });
    assert.deepEqual(order, [3]);
    assert.equal(remaining.length, 2);
    assert.equal(remaining.find((item) => item.holeNumber === 3)?.state, "offline");
  });
});

function mark(overrides: Partial<QueuedLooksRight> = {}): QueuedLooksRight {
  return {
    gameDayId: "day-1",
    cardId: "card-2",
    playerId: "kabelo",
    clientTimestamp: "2026-11-01T09:00:00.000Z",
    state: "queued",
    attempts: 0,
    ...overrides,
  };
}

describe("looks right queue", () => {
  it("keeps one mark per player and replaces it with a newer timestamp", () => {
    const first = mark();
    const newer = mark({ clientTimestamp: "2026-11-01T09:05:00.000Z" });
    const queue = enqueueLooksRight(enqueueLooksRight([], first), newer);
    assert.equal(queue.length, 1);
    assert.equal(queue[0]?.clientTimestamp, newer.clientTimestamp);
  });

  it("round-trips the offline queue and marks a network failure", async () => {
    const store = memoryStore();
    const queued = mark({ state: "offline" });
    writeLooksRightQueue(store, [queued]);
    assert.ok(store.get(LOOKS_RIGHT_QUEUE_KEY)?.includes("kabelo"));
    assert.deepEqual(readLooksRightQueue(store), [queued]);

    const failed = applyLooksRightFlush([queued], queued, { ok: false, kind: "network" });
    assert.equal(failed.stop, true);
    assert.equal(failed.queue[0]?.state, "offline");
    assert.equal(failed.queue[0]?.attempts, 1);

    const sent: string[] = [];
    const remaining = await flushLooksRightQueue([queued], async (item) => {
      sent.push(item.playerId);
      return { ok: true, reason: "applied" };
    });
    assert.deepEqual(sent, ["kabelo"]);
    assert.deepEqual(remaining, []);
  });
});
