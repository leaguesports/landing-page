import type {
  FixtureBoardStatus,
  FixtureLiveBoard,
} from "../../../types/fixture-feed.ts";

/** CMS / events-feed fixture fields the ingest matcher needs. */
export type IngestFixture = {
  slug: string;
  title: string;
  sportSlug: string | null;
  startsAt: string | null;
  teams?: ReadonlyArray<{ name: string }>;
  competition?: string | null;
  series?: string | null;
};

export type ProviderMatchSides = {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
};

export type ProviderMotorsportLeaders = {
  meetingName: string;
  circuit?: string | null;
  leaders: Array<{
    pos: 1 | 2 | 3;
    driver: string;
    team?: string | null;
    gap?: string | null;
  }>;
  sessionLabel?: string | null;
};

export type ProviderLiveUpdate = {
  provider: string;
  providerEventId: string;
  sportFamily: "match" | "motorsport";
  status: FixtureBoardStatus;
  /** Kickoff / session start for matching. */
  startsAt: string | null;
  clock?: string | null;
  period?: string | null;
  match?: ProviderMatchSides;
  motorsport?: ProviderMotorsportLeaders;
};

export type MatchedIngest = {
  fixture: IngestFixture;
  update: ProviderLiveUpdate;
  /** Provider home/away is swapped vs the CMS title sides. */
  swapped: boolean;
};

export type IngestApplyResult = {
  slug: string;
  action: "skipped" | "board" | "announced";
  board: FixtureLiveBoard | null;
};

export type IngestSummary = {
  liveFixtures: number;
  providerEvents: number;
  matched: number;
  applied: IngestApplyResult[];
  errors: string[];
};
