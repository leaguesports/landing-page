import { CardClient } from "@/components/golf-game-day/CardClient";

export const dynamic = "force-dynamic";

export default async function GameDayScorePage({
  params,
}: {
  params: Promise<{ id: string; cardId: string }>;
}) {
  const { id, cardId } = await params;
  return <CardClient gameDayId={id} cardId={cardId} mode="score" />;
}
