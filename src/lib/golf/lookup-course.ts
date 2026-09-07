import { getGolfCourseByVenueCmsId } from "@/services/venues";
import type { GolfCourseCms } from "@/types/golf-round";

/**
 * Read-only Sanity golfCourse for a round's venueCmsId (id or slug).
 * Returns null when unset, missing, or the CMS request fails.
 */
export async function lookupGolfCourse(
  venueCmsId: string | null | undefined,
): Promise<GolfCourseCms | null> {
  const id = venueCmsId?.trim() ?? "";
  if (!id) return null;
  return getGolfCourseByVenueCmsId(id);
}
