/** Padel Quick-Start match domain types (UI + Ably + API sync). */

export type PadelRuleset = "golden_point" | "advantage";

export type PadelPointValue = 0 | 15 | 30 | 40;

export type PadelTeamId = "A" | "B";

export type PadelPlayer = {
  id: string;
  displayName: string;
  /** Guest players are lightweight names entered on court */
  isGuest: boolean;
  /** Optional link to authenticated LeagueSports user */
  userId?: string | null;
};

export type PadelPairing = {
  teamA: [PadelPlayer, PadelPlayer];
  teamB: [PadelPlayer, PadelPlayer];
};

export type SetScore = {
  gamesA: number;
  gamesB: number;
  /** Present when the set went to a 6–6 tie-break */
  tieBreak?: { pointsA: number; pointsB: number } | null;
  winner?: PadelTeamId | null;
};

export type GameScore = {
  pointsA: PadelPointValue;
  pointsB: PadelPointValue;
  /** Advantage side when ruleset is advantage and both at 40 */
  advantage: PadelTeamId | null;
  /** True during a set tie-break (first to 7, win by 2) */
  isTieBreak: boolean;
  tieBreakPointsA: number;
  tieBreakPointsB: number;
};

export type PadelMatchStatus = "ready" | "live" | "finalized";

export type PadelMatchVenue = {
  id: string;
  slug: string;
  name: string;
  suburb?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type PadelMatch = {
  id: string;
  sport: "padel";
  status: PadelMatchStatus;
  ruleset: PadelRuleset;
  venue: PadelMatchVenue | null;
  /** Sanity venue `_id` sent to league-sports-api as `venueCmsId`. */
  venueCmsId?: string | null;
  /** Scheduled start (ISO). Distinct from `createdAt`. */
  startsAt?: string | null;
  pairings: PadelPairing;
  /** Team currently serving */
  servingTeam: PadelTeamId;
  sets: SetScore[];
  /** Index into `sets` for the active set (0-based) */
  currentSetIndex: number;
  game: GameScore;
  /** Best-of sets — default best of 3 (first to 2) */
  setsToWin: number;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string | null;
  version: number;
  /** Set when POST /api/matches/:id/lock succeeds. Immutable result. */
  lockedAt?: string | null;
  /** Winning team once the match is locked (or locally finalized). */
  winner?: PadelTeamId | null;
};

/** POST /api/matches/:id/lock body (league-sports-api). */
export type LockPadelMatchBody = {
  score: {
    sets: Array<{
      gamesA: number;
      gamesB: number;
      tieBreak: { pointsA: number; pointsB: number } | null;
      winner: PadelTeamId | null;
    }>;
  };
  winner: PadelTeamId;
};

export type MatchChannelEventType =
  | "POINT_SCORED"
  | "UNDO_POINT"
  | "SET_COMPLETED"
  | "MATCH_FINALIZED"
  | "STATE_SYNC";

export type MatchChannelEvent = {
  type: MatchChannelEventType;
  matchId: string;
  /** Full match snapshot after applying the event (source of truth for subscribers) */
  state: PadelMatch;
  /** Optional metadata for UI / analytics */
  meta?: {
    scoringTeam?: PadelTeamId;
    clientEventId?: string;
    emittedAt?: string;
  };
};

/** POST /api/matches body for league-sports-api (issue #7). */
export type CreatePadelMatchInput = {
  venueCmsId: string;
  startsAt: string;
  ruleset: PadelRuleset;
  pairings: PadelPairing;
  servingTeam?: PadelTeamId;
};

export type PadelPointAction =
  | { type: "POINT"; team: PadelTeamId }
  | { type: "UNDO"; previous: PadelMatch };
