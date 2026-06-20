export type FixtureStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export type PoolScoringRule =
  | "EXACT_SCORE_THREE_CORRECT_RESULT_ONE"
  | "CORRECT_RESULT_ONLY";

export interface PoolFixture {
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

export interface PoolMemberPrediction {
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  pointsEarned: number | null;
}

export interface PoolMemberView {
  id: string;
  displayName: string;
  totalPoints: number;
  joinedAt: string;
  isGuest: boolean;
  prediction: PoolMemberPrediction | null;
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
  fixture: PoolFixture;
  members: PoolMemberView[];
}

export interface LeaderboardMember {
  rank: number;
  id: string;
  displayName: string;
  totalPoints: number;
  prediction: PoolMemberPrediction | null;
}

export interface Leaderboard {
  pool: {
    id: string;
    name: string;
    inviteCode: string;
    scoringRule: PoolScoringRule;
  };
  fixture: PoolFixture;
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
  predictions: Array<{
    id: string;
    poolId: string;
    poolMemberId: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
    pointsEarned: number | null;
    createdAt: string;
    updatedAt: string;
  }>;
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
