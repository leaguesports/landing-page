/** Darts 501 domain types (UI + league-sports-api sync). */

export const DARTS_STARTING_SCORE = 501 as const;
export const DARTS_CHECKOUT_RULE = "double_out" as const;
export const DARTS_MIN_PLAYERS = 2;
export const DARTS_MAX_PLAYERS = 8;
export const DARTS_MIN_TURN_SCORE = 0;
export const DARTS_MAX_TURN_SCORE = 180;

export type DartsPlayerSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DartsMatchStatus = "live" | "locked";

export type DartsCheckoutRule = typeof DARTS_CHECKOUT_RULE;

export type DartsPlayer = {
  slot: DartsPlayerSlot;
  displayName: string;
  isGuest: boolean;
  userId?: string | null;
  remaining: number;
};

export type DartsTurn = {
  turnNumber: number;
  playerSlot: DartsPlayerSlot;
  score: number;
  bust: boolean;
  checkout: boolean;
  remainingAfter: number;
};

export type DartsMatchVenue = {
  id: string;
  slug: string;
  name: string;
  suburb?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type DartsMatch = {
  id: string;
  sport: "darts";
  venueCmsId: string | null;
  startsAt: string;
  startingScore: typeof DARTS_STARTING_SCORE;
  checkoutRule: DartsCheckoutRule;
  status: DartsMatchStatus;
  players: DartsPlayer[];
  turns: DartsTurn[];
  winnerSlot: DartsPlayerSlot | null;
  winnerUserId: string | null;
  lockedAt: string | null;
  nextSuggestedSlot: DartsPlayerSlot | null;
  venue?: DartsMatchVenue | null;
};

/** POST /api/darts body. Venue is optional (home / pub game). */
export type CreateDartsMatchInput = {
  venueCmsId?: string | null;
  startsAt: string;
  players: Array<{
    slot: DartsPlayerSlot;
    displayName: string;
    isGuest: boolean;
    userId?: string | null;
  }>;
};

/** POST /api/darts/:id/turns body. */
export type DartsTurnInput = {
  playerSlot?: DartsPlayerSlot;
  userId?: string | null;
  score: number;
  checkout?: boolean;
};

/** Capture visit — playerSlot required so the log can be replayed. */
export type CaptureDartsTurnInput = {
  playerSlot: DartsPlayerSlot;
  score: number;
  checkout?: boolean;
};

/** POST /api/darts/capture — prefer a finishing turns log. */
export type CaptureDartsMatchInput = {
  venueCmsId?: string | null;
  startsAt?: string;
  playedAt?: string;
  players: Array<{
    slot: DartsPlayerSlot;
    displayName: string;
    isGuest: boolean;
    userId?: string | null;
  }>;
  turns: CaptureDartsTurnInput[];
};

/** Locked history row from GET /api/darts?playerUserId=. */
export type DartsHistoryItem = {
  id: string;
  startsAt: string;
  venueCmsId: string | null;
  venueName: string | null;
  venueSlug: string | null;
  startingScore: typeof DARTS_STARTING_SCORE;
  checkoutRule: DartsCheckoutRule;
  players: DartsPlayer[];
  turns: DartsTurn[];
  winnerSlot: DartsPlayerSlot | null;
  winnerUserId: string | null;
};
