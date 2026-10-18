/**
 * Ably token grants for /api/realtime/token.
 *
 * Golf game day is subscribe + history on one channel. Other sports may
 * publish only when they are on the scorecard allowlist — unknown `sport`
 * values must not receive publish on `${sport}:*`.
 */

export const REALTIME_PUBLISH_SPORTS = ["padel", "golf", "darts"] as const;

export type RealtimePublishSport = (typeof REALTIME_PUBLISH_SPORTS)[number];

/** UUID check from league-sports-api PR #74. Version nibble 1–8, RFC variant. */
export const GAME_DAY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REALTIME_CAPABILITIES = [
  "publish",
  "subscribe",
  "presence",
  "history",
] as const;

export type RealtimeCapability = (typeof REALTIME_CAPABILITIES)[number];

const PUBLISH_CAPABILITIES: RealtimeCapability[] = [
  "publish",
  "subscribe",
  "presence",
  "history",
];

const READ_CAPABILITIES: RealtimeCapability[] = ["subscribe", "history"];

export function isRealtimePublishSport(
  sport: string,
): sport is RealtimePublishSport {
  return (REALTIME_PUBLISH_SPORTS as readonly string[]).includes(sport);
}

export type RealtimeGrant =
  | {
      ok: true;
      channelPattern: string;
      capabilities: RealtimeCapability[];
    }
  | { ok: false; error: string; status: 400 };

/**
 * Golf game day branch from PR #74.
 * Client: GET /api/realtime/token?sport=golf-gameday&gameDayId=<uuid>
 * Subscribe and history only. No publish, no presence, no wildcard.
 */
export function golfGameDayChannel(
  gameDayIdRaw: string | null | undefined,
): RealtimeGrant {
  const gameDayId = gameDayIdRaw?.trim() ?? "";
  if (!GAME_DAY_ID_PATTERN.test(gameDayId)) {
    return { ok: false, error: "Invalid game day", status: 400 };
  }
  return {
    ok: true,
    channelPattern: `golf-gameday:${gameDayId}`,
    capabilities: [...READ_CAPABILITIES],
  };
}

/**
 * Publish grant for scorecard sports. Unknown sports are rejected so a
 * caller cannot mint publish on `${sport}:*` (or `${sport}:${matchId}`).
 */
export function publishSportGrant(
  sport: string,
  matchId: string | null | undefined,
): RealtimeGrant {
  if (!isRealtimePublishSport(sport)) {
    return { ok: false, error: "Unknown sport", status: 400 };
  }
  const id = matchId?.trim() ?? "";
  if (id) {
    return {
      ok: true,
      channelPattern: `${sport}:${id}`,
      capabilities: [...PUBLISH_CAPABILITIES],
    };
  }
  return {
    ok: true,
    channelPattern: `${sport}:*`,
    capabilities: [...PUBLISH_CAPABILITIES],
  };
}
