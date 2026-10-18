import { WeekendClient } from "@/components/golf-game-day/WeekendClient";

export const dynamic = "force-dynamic";

export default async function WeekendPage({
  params,
}: {
  params: Promise<{ weekendEventId: string }>;
}) {
  const { weekendEventId } = await params;
  return <WeekendClient weekendEventId={weekendEventId} />;
}
