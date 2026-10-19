import type { GolfCourseCms, GolfCourseCmsHole } from "../../types/golf-course.ts";

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
