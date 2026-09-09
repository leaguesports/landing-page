/** Golf round domain types (UI + league-sports-api sync). */

export type GolfPlayerSlot = 1 | 2 | 3 | 4;

export type GolfHolesPlayed = 9 | 18;

export type GolfRoundStatus = "live" | "locked";

export type GolfPlayer = {
  slot: GolfPlayerSlot;
  displayName: string;
  isGuest: boolean;
  userId?: string | null;
  /** HI used at create/capture snapshot. */
  handicapIndexUsed?: number | null;
  courseHandicap?: number | null;
  playingHandicap?: number | null;
  /** Present after lock / capture. Prefer API values over local sums. */
  grossTotal?: number | null;
  netTotal?: number | null;
};

export type GolfCourseHole = {
  number: number;
  par: number;
  strokeIndex: number;
};

/** Per-tee yardage shown on the live scorecard (meters as stored in CMS). */
export type ScorecardTeeDistance = {
  teeName: string;
  color: string | null;
  meters: number;
  selected: boolean;
};

/** Round hole + optional CMS overlay for the live scorecard hole UI. */
export type ScorecardHole = GolfCourseHole & {
  tees: ScorecardTeeDistance[];
};

export type GolfCourseSnapshot = {
  name?: string | null;
  holes: GolfCourseHole[];
};

/** CMS golf course block on a Sanity venue. */
export type GolfCourseCmsTee = {
  name: string;
  color?: string | null;
  courseRating?: number | null;
  /** WHS slope. Prefer this; GROQ coalesces legacy `slope`. */
  slopeRating?: number | null;
  /** Legacy CMS slope. Kept so published tee documents stay readable. */
  slope?: number | null;
  /** Optional tee-specific total par when it differs from course parTotal. */
  par?: number | null;
  totalMeters?: number | null;
};

export type GolfCourseCmsHole = {
  number: number;
  par: number;
  strokeIndex: number;
  distances?: Array<{ teeName: string; meters: number }> | null;
};

export type GolfCourseCms = {
  courseName?: string | null;
  holesTotal?: number | null;
  parTotal?: number | null;
  notes?: string | null;
  tees?: GolfCourseCmsTee[] | null;
  holes?: GolfCourseCmsHole[] | null;
};

export type GolfHoleScore = {
  number: number;
  /** Slot string keys ("1"…"4") → strokes. */
  strokes: Record<string, number>;
  /** Slot string keys → net when PH and stroke indexes were snapshotted. */
  netStrokes?: Record<string, number>;
};

/** Client-supplied Sanity tee ratings. All optional — missing means gross-only. */
export type GolfTeeRatings = {
  teeId?: string | null;
  courseRating?: number | null;
  slopeRating?: number | null;
  teePar?: number | null;
};

export type GolfNestedTee = {
  id?: string | null;
  teeId?: string | null;
  courseRating?: number | null;
  slopeRating?: number | null;
  par?: number | null;
  teePar?: number | null;
};

export type GolfTeeRatingsInput = GolfTeeRatings & {
  tee?: GolfNestedTee | null;
};

export type GolfScore = {
  holes: GolfHoleScore[];
};

export type GolfRoundVenue = {
  id: string;
  slug: string;
  name: string;
  suburb?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type GolfRound = {
  id: string;
  sport: "golf";
  status: GolfRoundStatus;
  venueCmsId: string;
  startsAt: string;
  holesPlayed: GolfHolesPlayed;
  startingHole: number;
  teeName: string | null;
  teeId?: string | null;
  courseRating?: number | null;
  slopeRating?: number | null;
  teePar?: number | null;
  handicapDisclaimer?: string | null;
  course: GolfCourseSnapshot;
  players: GolfPlayer[];
  score: GolfScore | null;
  lockedAt: string | null;
  venue?: GolfRoundVenue | null;
};

/** POST /api/golf-rounds/:id/lock body. */
export type LockGolfRoundBody = {
  score: GolfScore;
};

/** POST /api/golf-rounds body. Live API requires teeName (1–40). */
export type CreateGolfRoundInput = {
  venueCmsId: string;
  startsAt: string;
  holesPlayed: GolfHolesPlayed;
  startingHole?: number;
  teeName: string;
  course: GolfCourseSnapshot;
  players: GolfPlayer[];
} & GolfTeeRatingsInput;

/** POST /api/golf-rounds/capture — finished round, no live scorecard. */
export type CaptureGolfRoundInput = {
  venueCmsId: string;
  startsAt?: string;
  playedAt?: string;
  holesPlayed: GolfHolesPlayed;
  startingHole?: number;
  teeName: string;
  course: GolfCourseSnapshot;
  players: GolfPlayer[];
  score: GolfScore;
} & GolfTeeRatingsInput;

/** Locked history row from GET /api/golf-rounds?playerUserId=. */
export type GolfHistoryItem = {
  id: string;
  startsAt: string;
  venueCmsId: string;
  venueName: string | null;
  venueSlug: string | null;
  holesPlayed: GolfHolesPlayed | number;
  startingHole: number;
  teeName: string | null;
  teeId?: string | null;
  courseRating?: number | null;
  slopeRating?: number | null;
  teePar?: number | null;
  handicapDisclaimer?: string | null;
  course: GolfCourseSnapshot;
  players: GolfPlayer[];
  score: GolfScore | null;
};

/** In-progress hole strokes while scoring (localStorage). */
export type GolfLiveStrokes = Record<number, Record<string, number>>;
