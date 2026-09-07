import type {
  GolfCourseCms,
  GolfCourseCmsHole,
  GolfCourseHole,
  GolfCourseSnapshot,
  GolfHolesPlayed,
} from "../../types/golf-round.ts";
import { holeOrder, isHolesPlayed, isStartingHole } from "./pre-round.ts";

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
  if (!isHolesPlayed(holesPlayed) || !isStartingHole(startingHole)) {
    return [];
  }

  const byNumber = new Map<number, GolfCourseHole>();
  for (const hole of course.holes) {
    if (!isPlayableHole(hole)) continue;
    byNumber.set(hole.number, {
      number: hole.number,
      par: hole.par,
      strokeIndex: hole.strokeIndex,
    });
  }

  const selected: GolfCourseHole[] = [];
  for (const number of holeOrder(holesPlayed, startingHole)) {
    const hole = byNumber.get(number);
    if (!hole) return [];
    selected.push(hole);
  }
  return selected;
}

export function courseParTotal(holes: GolfCourseHole[]): number {
  return holes.reduce((sum, hole) => sum + hole.par, 0);
}

/** Snapshot sent to POST /api/golf-rounds. */
export function toCourseSnapshot(
  course: GolfCourseCms | null | undefined,
  holesPlayed: GolfHolesPlayed,
  startingHole = 1,
): GolfCourseSnapshot | null {
  const holes = selectHoles(course, holesPlayed, startingHole);
  if (holes.length !== holesPlayed) return null;
  const name = course?.courseName?.trim() || null;
  return { name, holes };
}
