import { ShareClient } from "@/components/golf-game-day/ShareClient";

export const dynamic = "force-dynamic";

export default async function GameDaySharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShareClient gameDayId={id} />;
}
