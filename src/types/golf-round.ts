/** Golf round domain types (UI + league-sports-api sync). */

export type GolfPlayerSlot = 1 | 2 | 3 | 4;

export type GolfHolesPlayed = 9 | 18;

export type GolfRoundStatus = "live" | "locked";

export type GolfPlayer = {
  slot: GolfPlayerSlot;
  displayName: string;
  isGuest: boolean;
  userId?: string | null;
};

export type GolfCourseHole = {
  number: number;
  par: number;
  strokeIndex: number;
  /** Tee distance in meters when known from CMS (used by shot planner). */
  meters?: number | null;
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
  slope?: number | null;
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

/** POST /api/golf-rounds body. */
export type CreateGolfRoundInput = {
  venueCmsId: string;
  startsAt: string;
  holesPlayed: GolfHolesPlayed;
  startingHole?: number;
  teeName?: string | null;
  course: GolfCourseSnapshot;
  players: GolfPlayer[];
};

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
  course: GolfCourseSnapshot;
  players: GolfPlayer[];
  score: GolfScore | null;
};

/** In-progress hole strokes while scoring (localStorage). */
export type GolfLiveStrokes = Record<number, Record<string, number>>;
