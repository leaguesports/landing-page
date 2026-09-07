"use server";

import { lookupGolfCourse } from "@/lib/golf/lookup-course";
import type { GolfCourseCms } from "@/types/golf-round";

/** Client fallback when `/golf/[id]` hydrates the round from cache. */
export async function loadGolfCourseByVenueCmsId(
  venueCmsId: string,
): Promise<GolfCourseCms | null> {
  return lookupGolfCourse(venueCmsId);
}
