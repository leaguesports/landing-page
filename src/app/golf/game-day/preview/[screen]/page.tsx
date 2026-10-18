import { PreviewScreen } from "@/components/golf-game-day/PreviewScreen";

export default async function GameDayPreviewPage({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  return <PreviewScreen screen={screen} />;
}
