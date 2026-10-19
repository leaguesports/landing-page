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
