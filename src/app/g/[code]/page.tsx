import { JoinGameDay } from "@/components/golf-game-day/JoinGameDay";
import { lookupGolfCourse } from "@/lib/golf/lookup-course";
import { getRailwayApiOrigin } from "@/lib/api-origin";
import type { GameDayPreview } from "@/types/golf-game-day";
import type { GolfCourseCms } from "@/types/golf-round";

export const dynamic = "force-dynamic";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const inviteCode = code.trim().toUpperCase();
  let preview: GameDayPreview | null = null;
  let course: GolfCourseCms | null = null;
  const origin = getRailwayApiOrigin();
  if (origin) {
    try {
      const response = await fetch(
        `${origin}/api/golf-game-days/invite/${encodeURIComponent(inviteCode)}`,
        { cache: "no-store" },
      );
      if (response.ok) preview = (await response.json()) as GameDayPreview;
    } catch {
      preview = null;
    }
  }
  if (preview?.venueCmsId) {
    course = await lookupGolfCourse(preview.venueCmsId);
  }
  return <JoinGameDay code={inviteCode} initialPreview={preview} initialCourse={course} />;
}
