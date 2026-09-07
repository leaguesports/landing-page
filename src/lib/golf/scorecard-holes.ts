import type {
  GolfCourseCms,
  GolfCourseCmsHole,
  GolfCourseHole,
  ScorecardHole,
  ScorecardTeeDistance,
} from "../../types/golf-round.ts";

/** Common SA tee colours, longest → shortest as stored on GolfPass cards. */
const CANONICAL_TEE_ORDER = ["yellow", "white", "blue", "red"] as const;

function normalizeTee(value: string): string {
  return value.trim().toLowerCase();
}

function isPlayablePar(par: number): boolean {
  return Number.isInteger(par) && par >= 3 && par <= 5;
}

function isPlayableStrokeIndex(strokeIndex: number): boolean {
  return Number.isInteger(strokeIndex) && strokeIndex >= 1 && strokeIndex <= 18;
}

function isSelectedTee(
  teeName: string,
  color: string | null,
  selectedTeeName: string | null | undefined,
): boolean {
  const selected = selectedTeeName?.trim();
  if (!selected) return false;
  const key = normalizeTee(selected);
  return (
    normalizeTee(teeName) === key ||
    (color != null && normalizeTee(color) === key)
  );
}

function canonicalTeeIndex(teeName: string, color: string | null): number {
  const nameKey = normalizeTee(teeName);
  const colorKey = color ? normalizeTee(color) : "";
  return CANONICAL_TEE_ORDER.findIndex(
    (entry) => entry === nameKey || entry === colorKey,
  );
}

function teeSortKey(
  teeName: string,
  color: string | null,
  courseTeeOrder: string[],
): number {
  const canonical = canonicalTeeIndex(teeName, color);
  if (canonical >= 0) return canonical;
  const nameKey = normalizeTee(teeName);
  const fromCourse = courseTeeOrder.findIndex(
    (name) => normalizeTee(name) === nameKey,
  );
  if (fromCourse >= 0) return CANONICAL_TEE_ORDER.length + fromCourse;
  return CANONICAL_TEE_ORDER.length + courseTeeOrder.length + 50;
}

function overlayParAndSi(
  roundHole: GolfCourseHole,
  cms: GolfCourseCmsHole | undefined,
): Pick<GolfCourseHole, "par" | "strokeIndex"> {
  const par =
    cms && typeof cms.par === "number" && isPlayablePar(cms.par)
      ? cms.par
      : roundHole.par;
  const strokeIndex =
    cms &&
    typeof cms.strokeIndex === "number" &&
    isPlayableStrokeIndex(cms.strokeIndex)
      ? cms.strokeIndex
      : roundHole.strokeIndex;
  return { par, strokeIndex };
}

function teeDistancesForHole(
  cms: GolfCourseCmsHole | undefined,
  course: GolfCourseCms | null | undefined,
  selectedTeeName: string | null | undefined,
): ScorecardTeeDistance[] {
  const courseTeeOrder: string[] = [];
  const teeMeta = new Map<string, { name: string; color: string | null }>();
  for (const tee of course?.tees ?? []) {
    if (!tee?.name?.trim()) continue;
    const name = tee.name.trim();
    const color = tee.color?.trim() || null;
    courseTeeOrder.push(name);
    teeMeta.set(normalizeTee(name), { name, color });
    if (color) teeMeta.set(normalizeTee(color), { name, color });
  }

  const tees: ScorecardTeeDistance[] = [];
  const seen = new Set<string>();
  for (const dist of cms?.distances ?? []) {
    if (!dist?.teeName?.trim()) continue;
    if (
      typeof dist.meters !== "number" ||
      !Number.isFinite(dist.meters) ||
      dist.meters <= 0
    ) {
      continue;
    }
    const key = normalizeTee(dist.teeName);
    if (seen.has(key)) continue;
    seen.add(key);
    const meta = teeMeta.get(key);
    const teeName = meta?.name ?? dist.teeName.trim();
    const color =
      meta?.color ??
      (canonicalTeeIndex(dist.teeName, null) >= 0 ? dist.teeName.trim() : null);
    tees.push({
      teeName,
      color,
      meters: dist.meters,
      selected: isSelectedTee(teeName, color, selectedTeeName),
    });
  }

  tees.sort(
    (a, b) =>
      teeSortKey(a.teeName, a.color, courseTeeOrder) -
      teeSortKey(b.teeName, b.color, courseTeeOrder),
  );
  return tees;
}

/**
 * Map a round's hole list + optional Sanity golfCourse onto the live
 * scorecard hole UI model (par, men's SI, tee distances, selected tee).
 *
 * When `golfCourse` is missing, returns snapshot holes with empty tees so
 * the current scorecard UI is unchanged.
 */
export function toScorecardHoles(
  roundHoles: GolfCourseHole[],
  course: GolfCourseCms | null | undefined,
  selectedTeeName: string | null | undefined = null,
): ScorecardHole[] {
  const cmsByNumber = new Map<number, GolfCourseCmsHole>();
  for (const hole of course?.holes ?? []) {
    if (!hole || typeof hole.number !== "number") continue;
    cmsByNumber.set(hole.number, hole);
  }

  return roundHoles.map((roundHole) => {
    const cms = cmsByNumber.get(roundHole.number);
    const { par, strokeIndex } = overlayParAndSi(roundHole, cms);
    return {
      number: roundHole.number,
      par,
      strokeIndex,
      tees: teeDistancesForHole(cms, course, selectedTeeName),
    };
  });
}
