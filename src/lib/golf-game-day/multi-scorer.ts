import type {
  CardHole,
  GameDayCard,
  HolePutBody,
  HoleScoreConflict,
  HoleScoreSlot,
  QueuedHolePut,
} from "../../types/golf-game-day.ts";
import type { FlushOutcome } from "./queue.ts";

export function gameDayUserMessage(status: number, serverMessage?: string | null): string {
  const server = typeof serverMessage === "string" ? serverMessage.trim() : "";
  if (status === 401) return "Sign in to continue.";
  if (status === 403) {
    if (!server || server === "Forbidden") return "You can't do that.";
    return server;
  }
  if (status === 409) {
    if (!server || server === "Conflict") return "That was already updated.";
    return server;
  }
  if (status === 429) {
    if (!server || /^too many requests\.?$/i.test(server)) {
      return "Too many requests. Try again in a little while.";
    }
    return server;
  }
  if (status === 0) return server || "You are offline. Scores stay on this phone.";
  return server || "Something went wrong. Try again.";
}

/** Per-slot updatedAt the client last saw. Null means the slot looked empty. */
export function expectedUpdatedAtFor(
  hole: Pick<CardHole, "strokes" | "scores"> | null | undefined,
  slots: readonly string[],
): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const slot of slots) {
    const score = hole?.scores?.find((item) => String(item.slot) === slot);
    if (score?.updatedAt) {
      map[slot] = score.updatedAt;
      continue;
    }
    if (hole?.strokes?.[slot] == null) map[slot] = null;
  }
  return map;
}

export function changedHoleStrokes(
  draft: Record<string, number>,
  saved: Record<string, number> | null | undefined,
): Record<string, number> {
  const changed: Record<string, number> = {};
  for (const [slot, strokes] of Object.entries(draft)) {
    if (saved?.[slot] !== strokes) changed[slot] = strokes;
  }
  return changed;
}

/** Keep the first expectedUpdatedAt for a slot already waiting in the queue. */
export function nextQueuedHole(
  pending: Pick<QueuedHolePut, "strokes" | "expectedUpdatedAt"> | null,
  draft: Record<string, number>,
  hole: Pick<CardHole, "strokes" | "scores"> | null | undefined,
): { strokes: Record<string, number>; expectedUpdatedAt: Record<string, string | null> } {
  const saved = hole?.strokes;
  const strokes = { ...(pending?.strokes ?? {}) };
  for (const [slot, value] of Object.entries(draft)) {
    if (saved?.[slot] === value) delete strokes[slot];
    else strokes[slot] = value;
  }
  const fresh = expectedUpdatedAtFor(hole, Object.keys(strokes));
  const expectedUpdatedAt: Record<string, string | null> = {};
  for (const slot of Object.keys(strokes)) {
    if (pending?.expectedUpdatedAt && slot in pending.expectedUpdatedAt) {
      expectedUpdatedAt[slot] = pending.expectedUpdatedAt[slot] ?? null;
    } else if (slot in fresh) {
      expectedUpdatedAt[slot] = fresh[slot] ?? null;
    }
  }
  return { strokes, expectedUpdatedAt };
}

export function holePutBody(item: Pick<QueuedHolePut, "clientTimestamp" | "strokes" | "expectedUpdatedAt">): HolePutBody {
  const body: HolePutBody = {
    clientTimestamp: item.clientTimestamp,
    strokes: item.strokes,
  };
  if (item.expectedUpdatedAt && Object.keys(item.expectedUpdatedAt).length > 0) {
    body.expectedUpdatedAt = item.expectedUpdatedAt;
  }
  return body;
}

/** Applied and replay both finish the queued write. Replay is not an error. */
export function holePutOutcome(response: { reason: string }): FlushOutcome {
  if (response.reason === "replay") return { ok: true, reason: "replay" };
  return { ok: true, reason: "applied" };
}

export function conflictNotice(
  conflicts: readonly HoleScoreConflict[],
  holeNumber: number,
  context: {
    strokes?: Record<string, number>;
    names?: Readonly<Record<number, string>>;
  } = {},
): string | null {
  if (conflicts.length === 0) return null;
  const strokes = context.strokes ?? {};
  const names = context.names ?? {};
  return conflicts
    .map((conflict) => {
      const name = names[conflict.slot] || "Player";
      const was = conflict.previous ? String(conflict.previous.strokes) : "empty";
      const now = strokes[String(conflict.slot)];
      const nowLabel = typeof now === "number" ? String(now) : "a new score";
      return `${name} · hole ${holeNumber} was ${was} on another phone, now ${nowLabel}`;
    })
    .join(". ");
}

export function changedByNote(
  score: Pick<HoleScoreSlot, "updatedByName" | "updatedByPlayerId"> | null | undefined,
  current: { playerId?: string | null; displayName?: string | null },
): string | null {
  const name = score?.updatedByName?.trim();
  if (!name) return null;
  if (current.playerId && score?.updatedByPlayerId === current.playerId) return null;
  const mine = current.displayName?.trim();
  if (mine && name.toLowerCase() === mine.toLowerCase()) return null;
  return `changed by ${name}`;
}

/** Merge only the slots in this event. Other slots, holes, and YOU marks stay. */
export function applyScoreUpdated(
  card: GameDayCard,
  event: { cardId: string; holeNumber: number; scores: readonly HoleScoreSlot[] },
): GameDayCard {
  if (event.cardId !== card.id || event.scores.length === 0) return card;
  const holes = card.holes.map((hole) => ({
    ...hole,
    strokes: { ...hole.strokes },
    scores: hole.scores?.map((score) => ({ ...score })),
  }));
  let hole = holes.find((item) => item.number === event.holeNumber);
  if (!hole) {
    hole = {
      number: event.holeNumber,
      strokes: {},
      clientTimestamp: event.scores[0]?.updatedAt ?? "",
      synced: true,
      scores: [],
    };
    holes.push(hole);
    holes.sort((left, right) => left.number - right.number);
  }
  const scores = [...(hole.scores ?? [])];
  for (const slot of event.scores) {
    const index = scores.findIndex((item) => item.slot === slot.slot);
    if (index >= 0) scores[index] = { ...slot };
    else scores.push({ ...slot });
    hole.strokes[String(slot.slot)] = slot.strokes;
  }
  hole.scores = scores;
  hole.synced = true;
  const latest = scores.reduce(
    (max, score) => (score.updatedAt > max ? score.updatedAt : max),
    hole.clientTimestamp,
  );
  hole.clientTimestamp = latest;
  const seated = card.players.map((player) => player.slot);
  const complete =
    seated.length > 0 &&
    seated.every((slot) => scores.some((score) => score.slot === slot));
  const missingHoles = complete
    ? card.missingHoles.filter((number) => number !== event.holeNumber)
    : card.missingHoles.includes(event.holeNumber)
      ? card.missingHoles
      : [...card.missingHoles, event.holeNumber].sort((left, right) => left - right);
  return { ...card, holes, missingHoles };
}

export function applyCardUnlocked(card: GameDayCard, event: { cardId: string }): GameDayCard {
  if (event.cardId !== card.id || card.status === "live") return card;
  return { ...card, status: "live" };
}

export function holesBlockingConfirm(
  missingHoles: readonly number[],
  queuedHoleNumbers: readonly number[],
): number[] {
  const queued = new Set(queuedHoleNumbers);
  return missingHoles.filter((hole) => !queued.has(hole));
}

export type CardActionDecision = {
  canConfirm: boolean;
  canUnlock: boolean;
  canScore: boolean;
  reason: string | null;
};

/** Any seated player can confirm a live card. The organiser unlocks a locked one. */
export function cardActions(input: {
  status: "live" | "locked";
  seated: boolean;
  organiser: boolean;
  pendingSync: boolean;
  openHoles: readonly number[];
}): CardActionDecision {
  const canScore = input.status === "live" ? input.seated : input.organiser;
  const canUnlock = input.status === "locked" && input.organiser;
  const allowed = input.status === "live" && (input.seated || input.organiser);
  if (!allowed) {
    return { canConfirm: false, canUnlock, canScore, reason: null };
  }
  if (input.pendingSync) {
    return {
      canConfirm: false,
      canUnlock,
      canScore,
      reason: "Scores are still on this phone. They'll confirm once they sync.",
    };
  }
  if (input.openHoles.length > 0) {
    return {
      canConfirm: false,
      canUnlock,
      canScore,
      reason: `Still to score: ${input.openHoles.join(", ")}`,
    };
  }
  return { canConfirm: true, canUnlock, canScore, reason: null };
}
