export type FixtureStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export type PoolScoringRule =
  | "EXACT_SCORE_THREE_CORRECT_RESULT_ONE"
  | "CORRECT_RESULT_ONLY";

export type PredictionType = "EXACT_SCORE" | "TOTAL_SCORE" | "MARGIN";

export type PredictionWinnerSide = "HOME" | "AWAY" | "DRAW";

export interface Fixture {
  id: string;
  title: string;
  sport: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: FixtureStatus;
  resultSubmittedAt: string | null;
}

/** @deprecated Use Fixture */
export type PoolFixture = Fixture;

export interface PredictionView {
  predictionType: PredictionType;
  summary: string | null;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  predictedTotalScore: number | null;
  predictedWinnerSide: PredictionWinnerSide | null;
  predictedMargin: number | null;
  pointsEarned: number | null;
}

export interface PoolMemberView {
  id: string;
  displayName: string;
  totalPoints: number;
  joinedAt: string;
  isGuest: boolean;
  prediction: PredictionView | null;
}

export interface PoolView {
  id: string;
  name: string;
  inviteCode: string;
  scoringRule: PoolScoringRule;
  createdAt: string;
  createdByUserId: string | null;
  memberCount: number;
  predictionsOpen: boolean;
  fixture: Fixture;
  members: PoolMemberView[];
}

export interface LeaderboardMember {
  rank: number;
  id: string;
  displayName: string;
  totalPoints: number;
  prediction: PredictionView | null;
}

export interface Leaderboard {
  pool: {
    id: string;
    name: string;
    inviteCode: string;
    scoringRule: PoolScoringRule;
  };
  fixture: Fixture;
  members: LeaderboardMember[];
  winner: Array<{
    id: string;
    displayName: string;
    totalPoints: number;
  }>;
}

export interface PoolMember {
  id: string;
  poolId: string;
  userId: string | null;
  displayName: string;
  totalPoints: number;
  joinedAt: string;
}

export interface CreatePoolFixtureInput {
  title: string;
  sport: string;
  homeTeamName: string;
  awayTeamName: string;
  matchDate: string;
}

export interface CreatePoolInput {
  name: string;
  hostDisplayName: string;
  scoringRule?: PoolScoringRule;
  fixture?: CreatePoolFixtureInput;
  fixtureId?: string;
}

export type PoolUiState = "open" | "locked" | "results";

export type PredictionFormState =
  | { type: "EXACT_SCORE"; home: number; away: number }
  | { type: "TOTAL_SCORE"; total: number }
  | { type: "MARGIN"; side: PredictionWinnerSide; margin?: number };
