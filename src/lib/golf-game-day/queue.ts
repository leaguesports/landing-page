import type { QueuedHolePut } from "../../types/golf-game-day.ts";
import type { KeyValueStore } from "./storage.ts";
import { readHoleQueue, writeHoleQueue } from "./storage.ts";

export type FlushOutcome =
  | { ok: true; reason: "applied" | "replay" | "stale" }
  | { ok: false; kind: "network" | "auth" | "rejected"; message?: string };

function sameHole(left: QueuedHolePut, right: Pick<QueuedHolePut, "cardId" | "holeNumber">): boolean {
  return left.cardId === right.cardId && left.holeNumber === right.holeNumber;
}

/**
 * One pending PUT per hole. A newer clientTimestamp replaces the queued
 * write. An older timestamp does not.
 */
export function enqueueHolePut(
  queue: QueuedHolePut[],
  next: QueuedHolePut,
): QueuedHolePut[] {
  const existing = queue.find((item) => sameHole(item, next));
  if (existing && existing.clientTimestamp > next.clientTimestamp) {
    return queue;
  }
  const rest = queue.filter((item) => !sameHole(item, next));
  return [...rest, next].sort((left, right) => {
    const byTime = left.clientTimestamp.localeCompare(right.clientTimestamp);
    if (byTime !== 0) return byTime;
    return left.holeNumber - right.holeNumber;
  });
}

export function applyFlushResult(
  queue: QueuedHolePut[],
  item: QueuedHolePut,
  outcome: FlushOutcome,
): { queue: QueuedHolePut[]; stop: boolean } {
  const exact = (row: QueuedHolePut) =>
    sameHole(row, item) && row.clientTimestamp === item.clientTimestamp;

  if (outcome.ok || (!outcome.ok && outcome.kind === "rejected")) {
    return { queue: queue.filter((row) => !exact(row)), stop: false };
  }
  if (outcome.kind === "network") {
    return {
      stop: true,
      queue: queue.map((row) =>
        exact(row)
          ? { ...row, state: "offline", attempts: row.attempts + 1 }
          : row,
      ),
    };
  }
  return { queue, stop: true };
}

/** Send oldest first. Stop on network or auth so a later hole is not skipped. */
export async function flushHoleQueue(
  queue: QueuedHolePut[],
  send: (item: QueuedHolePut) => Promise<FlushOutcome>,
): Promise<QueuedHolePut[]> {
  let next = [...queue];
  const ordered = [...queue].sort((left, right) =>
    left.clientTimestamp.localeCompare(right.clientTimestamp),
  );
  for (const snapshot of ordered) {
    const live = next.find(
      (row) =>
        sameHole(row, snapshot) && row.clientTimestamp === snapshot.clientTimestamp,
    );
    if (!live) continue;
    let outcome: FlushOutcome;
    try {
      outcome = await send(live);
    } catch {
      outcome = { ok: false, kind: "network", message: "offline" };
    }
    const applied = applyFlushResult(next, live, outcome);
    next = applied.queue;
    if (applied.stop) break;
  }
  return next;
}

export function queueForCard(
  queue: QueuedHolePut[],
  cardId: string,
): QueuedHolePut[] {
  return queue.filter((item) => item.cardId === cardId);
}

/** Replace one card's pending puts without dropping other cards. */
export function writeCardQueue(
  store: KeyValueStore,
  cardId: string,
  cardQueue: QueuedHolePut[],
): void {
  const others = readHoleQueue(store).filter((item) => item.cardId !== cardId);
  writeHoleQueue(store, [...others, ...cardQueue]);
}
