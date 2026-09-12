export const VENUE_LEADERBOARD_BOARDS = [
  "records",
  "potm",
  "grinder",
  "streak",
] as const;

export type VenueLeaderboardBoard = (typeof VENUE_LEADERBOARD_BOARDS)[number];

export const VENUE_LEADERBOARD_WINDOWS = ["month", "all"] as const;

export type VenueLeaderboardWindow = (typeof VENUE_LEADERBOARD_WINDOWS)[number];

export type VenueLeaderboardStats = Record<string, number | string | null>;

export type VenueLeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  stats: VenueLeaderboardStats;
};

export type VenueLeaderboardGolfTeeRecord = {
  teeId: string | null;
  teeName: string | null;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  stats: VenueLeaderboardStats;
};

export type VenueLeaderboardRecords = {
  golf: {
    bestGrossByTee: VenueLeaderboardGolfTeeRecord[];
    bestNetByTee: VenueLeaderboardGolfTeeRecord[];
  };
  padel: {
    mostWins: VenueLeaderboardEntry[];
    bestWinStreak: VenueLeaderboardEntry[];
  };
  darts: {
    mostWins: VenueLeaderboardEntry[];
    bestWinStreak: VenueLeaderboardEntry[];
  };
};

export type VenueLeaderboardResponse = {
  venue: { id: string; cmsId: string; name: string };
  board: VenueLeaderboardBoard;
  window: VenueLeaderboardWindow;
  windowKey: string;
  timezone: string;
  computedAt: string;
  first: VenueLeaderboardEntry | null;
  entries: VenueLeaderboardEntry[];
  records?: VenueLeaderboardRecords;
};

export type VenueLeaderboardResult =
  | { ok: true; board: VenueLeaderboardResponse }
  | { ok: false; error: string; status: number };
