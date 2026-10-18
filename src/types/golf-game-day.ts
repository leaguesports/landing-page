import type { GolfCourseCms } from "@/types/golf-round";

export type GameDayStatus = "setup" | "in_play" | "final";
export type GameDayCardStatus = "live" | "locked";
export type GameDayAccess = "organiser" | "player" | "watch";
export type GameDayFormat = "stroke";
export type BoardTab = "gross" | "net" | "stableford";

export type GameDayPlayerSummary = {
  id: string;
  displayName: string;
  handicapIndex: number | null;
  teeName: string;
  joined: boolean;
  cardId: string | null;
  cardNumber: number | null;
  slot: number | null;
};

export type GameDayCreated = {
  id: string;
  inviteCode: string;
  watchToken: string;
  watchPath: string;
  venueCmsId: string;
  venueName: string;
  date: string;
  dateLabel: string;
  headline: string;
  defaultTee: string;
  teeOptions: string[];
  format: GameDayFormat;
  status: GameDayStatus;
  version: number;
  weekendEventId: string | null;
  players: GameDayPlayerSummary[];
};

export type CreateGameDayInput = {
  venueCmsId: string;
  date: string;
  defaultTee: string;
  teeOptions: string[];
  format: GameDayFormat;
  players: Array<{
    displayName: string;
    handicapIndex?: number | null;
    teeName?: string;
  }>;
  weekendEvent?: { name: string };
};

export type InvitePlayer = {
  id: string;
  displayName: string;
  taken: boolean;
  cardId: string | null;
  cardNumber: number | null;
};

export type InviteCard = {
  id: string;
  number: number;
  status: GameDayCardStatus;
  openSlots: number;
  full: boolean;
  /** Preview copy such as "08:10 · 1st tee". Absent on the live invite payload. */
  teeTime?: string | null;
  players: Array<{
    displayName: string;
    slot: number | null;
    scoring: boolean;
    handicapLabel?: string | null;
    teeName?: string | null;
  }>;
};

export type GameDayPreview = {
  id: string;
  venueName: string;
  venueCmsId: string;
  date: string;
  dateLabel: string;
  headline: string;
  defaultTee: string;
  teeOptions: string[];
  format: GameDayFormat;
  status: GameDayStatus;
  players: InvitePlayer[];
  cards: InviteCard[];
};

export type JoinResult = {
  gameDayId: string;
  deviceToken: string;
  playerId: string;
  displayName: string;
  teeName: string;
  handicapIndex: number | null;
};

export type CardPlayer = {
  playerId: string;
  slot: number;
  displayName: string;
  handicapIndex: number | null;
  playingHandicap: number | null;
  courseHandicap: number | null;
  teeName: string;
  looksRight: boolean;
  isScorer: boolean;
  you: boolean;
};

export type CardHole = {
  number: number;
  strokes: Record<string, number>;
  clientTimestamp: string;
  synced: boolean;
};

export type CardTee = {
  name: string;
  courseRating: number | null;
  slopeRating: number | null;
  teePar: number | null;
};

export type GameDayCard = {
  id: string;
  gameDayId: string;
  number: number;
  status: GameDayCardStatus;
  golfRoundId: string | null;
  holesPlayed: 9 | 18;
  startingHole: number;
  scoring: boolean;
  scorer: { playerId: string; displayName: string };
  players: CardPlayer[];
  course: {
    name: string | null;
    holes: Array<{ number: number; par: number; strokeIndex: number }>;
  };
  tees: CardTee[];
  holes: CardHole[];
  missingHoles: number[];
};

export type HolePutResponse = {
  applied: boolean;
  reason: "applied" | "replay" | "stale";
  version: number;
  card: GameDayCard;
};

export type RankingRow = {
  position: string | null;
  positionNumber: number | null;
  tied: boolean;
  playerId: string;
  displayName: string;
  you: boolean;
  cardId: string;
  cardNumber: number;
  handicapIndex: number | null;
  playingHandicap: number | null;
  thru: number;
  gross: number | null;
  toPar: number | null;
  net: number | null;
  stableford: number | null;
  countbackNote: string | null;
  /** Places gained since the previous board. Positive is up. */
  move?: number | null;
};

export type GameDayFeedItem = {
  id: string;
  type: string;
  message: string;
  at: string;
  playerName?: string;
  cardNumber?: number;
  holeNumber?: number;
  relative?: string;
  leaderName?: string;
  metric?: string;
  value?: number;
};

export type LeaderboardCard = {
  id: string;
  number: number;
  status: GameDayCardStatus;
  thru: number;
  playerCount: number;
  syncedAt: string | null;
};

export type GameDayLeaderboard = {
  gameDayId: string;
  version: number;
  access: GameDayAccess;
  status: GameDayStatus;
  format: GameDayFormat;
  venueName: string;
  venueCmsId: string;
  date: string;
  dateLabel: string;
  headline: string;
  cardsConfirmed: number;
  cardsTotal: number;
  countback: string | null;
  countbackApplied: boolean;
  rankings: Record<BoardTab, RankingRow[]>;
  podium: Record<BoardTab, RankingRow[]> | null;
  feed: GameDayFeedItem[];
  cards: LeaderboardCard[];
  updatedLabel?: string | null;
  watchLabel?: string | null;
};

export type WeekendRankingRow = {
  position: string;
  positionNumber: number;
  tied: boolean;
  displayName: string;
  roundsPlayed: number;
  gross: number | null;
  net: number | null;
  stableford: number | null;
};

export type WeekendLeaderboard = {
  weekendEventId: string;
  name: string | null;
  gameDays: Array<{
    id: string;
    date: string;
    dateLabel: string;
    venueName: string;
    status: GameDayStatus;
  }>;
  countback: null;
  rankings: Record<BoardTab, WeekendRankingRow[]>;
};

export type CachedGameDayCourse = {
  gameDayId: string;
  venueCmsId: string;
  venueName: string;
  course: GolfCourseCms;
  savedAt: string;
};

export type DeviceSession = {
  gameDayId: string;
  deviceToken: string;
  playerId: string;
  displayName: string;
  teeName: string;
  handicapIndex: number | null;
  inviteCode: string | null;
  cardId: string | null;
};

export type QueuedHolePut = {
  gameDayId: string;
  cardId: string;
  holeNumber: number;
  clientTimestamp: string;
  strokes: Record<string, number>;
  state: "queued" | "saving" | "offline";
  attempts: number;
};

/** One pending "looks right" mark per player. The server only sets the flag true. */
export type QueuedLooksRight = {
  gameDayId: string;
  cardId: string;
  playerId: string;
  clientTimestamp: string;
  state: "queued" | "saving" | "offline";
  attempts: number;
};
