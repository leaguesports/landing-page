import { PlayHubChrome } from "@/components/play/PlayHubChrome";
import { PlaySportGrid } from "@/components/play/PlaySportGrid";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import { hubPlayGridItems } from "@/lib/sports/hub-ia";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Pick padel, golf, or darts to find a place to play.",
};

export default function PlayGridPage() {
  return (
    <PlayHubChrome>
      <PlaySportGrid items={hubPlayGridItems(SPORT_CATALOG)} />
    </PlayHubChrome>
  );
}
