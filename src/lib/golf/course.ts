import type {
  GolfCourseCms,
  GolfCourseCmsHole,
  GolfCourseHole,
  GolfCourseSnapshot,
  GolfHolesPlayed,
} from "../../types/golf-round.ts";

function isPlayableHole(
  hole: GolfCourseCmsHole | null | undefined,
): hole is GolfCourseCmsHole {
  return (
    Boolean(hole) &&
    typeof hole?.number === "number" &&
    Number.isInteger(hole.number) &&
    hole.number >= 1 &&
    hole.number <= 18 &&
    typeof hole.par === "number" &&
    Number.isInteger(hole.par) &&
    hole.par >= 3 &&
    hole.par <= 5 &&
    typeof hole.strokeIndex === "number" &&
    Number.isInteger(hole.strokeIndex) &&
    hole.strokeIndex >= 1 &&
    hole.strokeIndex <= 18
  );
}

/** True when CMS golfCourse has enough playable holes for a round. */
export function hasPlayableGolfCourse(
  course: GolfCourseCms | null | undefined,
): boolean {
  if (!course?.holes?.length) return false;
  const playable = course.holes.filter(isPlayableHole);
  return playable.length >= 9;
}

function holeSequence(
  holesPlayed: GolfHolesPlayed,
  startingHole: number,
): number[] {
  return Array.from({ length: holesPlayed }, (_, index) => {
    const number = startingHole + index;
    return number > 18 ? number - 18 : number;
  });
}

/**
 * Pick consecutive holes for 9/18 from a CMS course.
 * Returns [] when any expected hole is missing or not playable.
 */
export function selectHoles(
  course: GolfCourseCms | null | undefined,
  holesPlayed: GolfHolesPlayed,
  startingHole = 1,
): GolfCourseHole[] {
  if (!course?.holes?.length) return [];
  if (holesPlayed !== 9 && holesPlayed !== 18) return [];
  if (!Number.isInteger(startingHole) || startingHole < 1 || startingHole > 18) {
    return [];
  }

  const byNumber = new Map<number, GolfCourseHole>();
  for (const hole of course.holes) {
    if (!isPlayableHole(hole)) continue;
    const meters = pickHoleMeters(hole, undefined);
    byNumber.set(hole.number, {
      number: hole.number,
      par: hole.par,
      strokeIndex: hole.strokeIndex,
      ...(meters != null ? { meters } : {}),
    });
  }

  const selected: GolfCourseHole[] = [];
  for (const number of holeSequence(holesPlayed, startingHole)) {
    const hole = byNumber.get(number);
    if (!hole) return [];
    selected.push(hole);
  }
  return selected;
}

export function courseParTotal(holes: GolfCourseHole[]): number {
  return holes.reduce((sum, hole) => sum + hole.par, 0);
}

/**
 * Prefer the named tee distance, else the first positive meters entry.
 */
export function pickHoleMeters(
  hole: Pick<GolfCourseCmsHole, "distances"> | null | undefined,
  teeName?: string | null,
): number | null {
  const distances = hole?.distances;
  if (!distances?.length) return null;
  const wanted = teeName?.trim().toLowerCase();
  if (wanted) {
    const match = distances.find(
      (d) =>
        d.teeName?.trim().toLowerCase() === wanted &&
        typeof d.meters === "number" &&
        d.meters > 0,
    );
    if (match) return match.meters;
  }
  const first = distances.find(
    (d) => typeof d.meters === "number" && d.meters > 0,
  );
  return first?.meters ?? null;
}

/** Snapshot sent to POST /api/golf-rounds. */
export function toCourseSnapshot(
  course: GolfCourseCms | null | undefined,
  holesPlayed: GolfHolesPlayed,
  startingHole = 1,
  teeName?: string | null,
): GolfCourseSnapshot | null {
  const holes = selectHoles(course, holesPlayed, startingHole).map((hole) => {
    const cms = course?.holes?.find((h) => h.number === hole.number);
    const meters = pickHoleMeters(cms, teeName) ?? hole.meters ?? null;
    return meters != null ? { ...hole, meters } : hole;
  });
  if (holes.length !== holesPlayed) return null;
  const name = course?.courseName?.trim() || null;
  return { name, holes };
}
