import { BoardClient } from "@/components/golf-game-day/BoardClient";

export const dynamic = "force-dynamic";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <BoardClient watchToken={token} />;
}
