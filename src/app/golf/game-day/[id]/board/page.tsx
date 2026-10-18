import { BoardClient } from "@/components/golf-game-day/BoardClient";

export const dynamic = "force-dynamic";

export default async function GameDayBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BoardClient gameDayId={id} />;
}
