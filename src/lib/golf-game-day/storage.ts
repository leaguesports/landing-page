import type {
  CachedGameDayCourse,
  DeviceSession,
  GameDayCard,
  GameDayCreated,
  OrganiserSession,
  QueuedHolePut,
  QueuedLooksRight,
} from "../../types/golf-game-day.ts";

export const HOLE_QUEUE_KEY = "golf-gameday:v1:queue";
export const LOOKS_RIGHT_QUEUE_KEY = "golf-gameday:v1:looks-right";
export const DEVICE_KEY = "golf-gameday:v1:device";
export const ORGANISER_KEY = "golf-gameday:v1:organiser";
export const COURSE_PREFIX = "golf-gameday:v1:course:";
export const CARD_PREFIX = "golf-gameday:v1:card:";
export const WATCH_SESSION_KEY = "golf-gameday:v1:watch-session";
export const META_PREFIX = "golf-gameday:v1:meta:";

export type KeyValueStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

export function memoryStore(seed?: Record<string, string>): KeyValueStore {
  const map = new Map(Object.entries(seed ?? {}));
  return {
    get(key) {
      return map.get(key) ?? null;
    },
    set(key, value) {
      map.set(key, value);
    },
    remove(key) {
      map.delete(key);
    },
  };
}

export function localStorageStore(): KeyValueStore {
  return {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Private mode or a full quota: scoring still works in memory.
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore.
      }
    },
  };
}

export function sessionStore(): KeyValueStore {
  return {
    get(key) {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.sessionStorage.setItem(key, value);
      } catch {
        // Ignore.
      }
    },
    remove(key) {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // Ignore.
      }
    },
  };
}

function readJson<T>(store: KeyValueStore, key: string): T | null {
  const raw = store.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isQueuedHolePut(value: unknown): value is QueuedHolePut {
  if (!value || typeof value !== "object") return false;
  const item = value as QueuedHolePut;
  return (
    typeof item.gameDayId === "string" &&
    typeof item.cardId === "string" &&
    typeof item.holeNumber === "number" &&
    typeof item.clientTimestamp === "string" &&
    item.strokes != null &&
    typeof item.strokes === "object"
  );
}

export function readHoleQueue(store: KeyValueStore): QueuedHolePut[] {
  const parsed = readJson<unknown>(store, HOLE_QUEUE_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isQueuedHolePut).map((item) => ({
    ...item,
    state: item.state === "offline" || item.state === "saving" ? item.state : "queued",
    attempts: typeof item.attempts === "number" ? item.attempts : 0,
  }));
}

export function writeHoleQueue(store: KeyValueStore, queue: QueuedHolePut[]): void {
  store.set(HOLE_QUEUE_KEY, JSON.stringify(queue));
}

function isQueuedLooksRight(value: unknown): value is QueuedLooksRight {
  if (!value || typeof value !== "object") return false;
  const item = value as QueuedLooksRight;
  return (
    typeof item.gameDayId === "string" &&
    typeof item.cardId === "string" &&
    typeof item.playerId === "string" &&
    typeof item.clientTimestamp === "string"
  );
}

export function readLooksRightQueue(store: KeyValueStore): QueuedLooksRight[] {
  const parsed = readJson<unknown>(store, LOOKS_RIGHT_QUEUE_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isQueuedLooksRight).map((item) => ({
    ...item,
    state: item.state === "offline" || item.state === "saving" ? item.state : "queued",
    attempts: typeof item.attempts === "number" ? item.attempts : 0,
  }));
}

export function writeLooksRightQueue(store: KeyValueStore, queue: QueuedLooksRight[]): void {
  store.set(LOOKS_RIGHT_QUEUE_KEY, JSON.stringify(queue));
}

export function readDevices(store: KeyValueStore): Record<string, DeviceSession> {
  const parsed = readJson<unknown>(store, DEVICE_KEY);
  if (!parsed || typeof parsed !== "object") return {};
  return parsed as Record<string, DeviceSession>;
}

export function readDevice(
  store: KeyValueStore,
  gameDayId: string,
): DeviceSession | null {
  return readDevices(store)[gameDayId] ?? null;
}

export function writeDevice(store: KeyValueStore, session: DeviceSession): void {
  const all = readDevices(store);
  all[session.gameDayId] = session;
  store.set(DEVICE_KEY, JSON.stringify(all));
}

export function readOrganisers(store: KeyValueStore): Record<string, OrganiserSession> {
  const parsed = readJson<unknown>(store, ORGANISER_KEY);
  if (!parsed || typeof parsed !== "object") return {};
  return parsed as Record<string, OrganiserSession>;
}

export function readOrganiser(
  store: KeyValueStore,
  gameDayId: string,
): OrganiserSession | null {
  return readOrganisers(store)[gameDayId] ?? null;
}

export function writeOrganiser(store: KeyValueStore, session: OrganiserSession): void {
  const all = readOrganisers(store);
  all[session.gameDayId] = session;
  store.set(ORGANISER_KEY, JSON.stringify(all));
}

/**
 * The create response shows organiserToken once. Keep it beside the device
 * map, keyed by game day. When the creator is also a player, that same secret
 * is their device token.
 */
export function rememberCreatedGameDay(store: KeyValueStore, created: GameDayCreated): void {
  if (!created.organiserToken) return;
  writeOrganiser(store, {
    gameDayId: created.id,
    organiserToken: created.organiserToken,
    organiserPlayerId: created.organiserPlayerId ?? null,
    claimed: created.claimed === true,
  });
  if (!created.organiserPlayerId) return;
  const self = created.players.find((player) => player.id === created.organiserPlayerId);
  if (!self) return;
  writeDevice(store, {
    gameDayId: created.id,
    deviceToken: created.organiserToken,
    playerId: self.id,
    displayName: self.displayName,
    teeName: self.teeName,
    handicapIndex: self.handicapIndex,
    inviteCode: created.inviteCode,
    cardId: self.cardId,
  });
}

export function cacheCourse(store: KeyValueStore, course: CachedGameDayCourse): void {
  store.set(`${COURSE_PREFIX}${course.gameDayId}`, JSON.stringify(course));
}

export function readCachedCourse(
  store: KeyValueStore,
  gameDayId: string,
): CachedGameDayCourse | null {
  return readJson<CachedGameDayCourse>(store, `${COURSE_PREFIX}${gameDayId}`);
}

export function cacheCard(store: KeyValueStore, card: GameDayCard): void {
  store.set(`${CARD_PREFIX}${card.id}`, JSON.stringify(card));
}

export function readCachedCard(
  store: KeyValueStore,
  cardId: string,
): GameDayCard | null {
  return readJson<GameDayCard>(store, `${CARD_PREFIX}${cardId}`);
}

export function rememberWatchToken(
  store: KeyValueStore,
  gameDayId: string,
  watchToken: string,
): void {
  const current = readJson<Record<string, string>>(store, WATCH_SESSION_KEY) ?? {};
  current[gameDayId] = watchToken;
  store.set(WATCH_SESSION_KEY, JSON.stringify(current));
}

export function writeGameDayMeta(
  store: KeyValueStore,
  gameDayId: string,
  meta: { weekendEventId: string | null },
): void {
  store.set(`${META_PREFIX}${gameDayId}`, JSON.stringify(meta));
}

export function readGameDayMeta(
  store: KeyValueStore,
  gameDayId: string,
): { weekendEventId: string | null } | null {
  return readJson<{ weekendEventId: string | null }>(store, `${META_PREFIX}${gameDayId}`);
}

export function readWatchToken(
  store: KeyValueStore,
  gameDayId: string,
): string | null {
  const current = readJson<Record<string, string>>(store, WATCH_SESSION_KEY);
  return current?.[gameDayId] ?? null;
}
