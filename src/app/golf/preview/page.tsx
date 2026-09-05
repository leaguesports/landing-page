import type { Metadata } from "next";
import { GolfScorecard } from "@/components/golf/GolfScorecard";
import type { GolfRound } from "@/types/golf-round";

export const metadata: Metadata = {
  title: "Golf shot plan preview | LeagueSports",
  robots: { index: false, follow: false },
};

/** Local preview round — no API required. */
const previewRound: GolfRound = {
  id: "preview-shot",
  sport: "golf",
  status: "live",
  venueCmsId: "preview",
  startsAt: new Date().toISOString(),
  holesPlayed: 9,
  startingHole: 1,
  teeName: "White",
  course: {
    name: "Demo Links",
    holes: [
      { number: 1, par: 4, strokeIndex: 9, meters: 257 },
      { number: 2, par: 5, strokeIndex: 3, meters: 470 },
      { number: 3, par: 3, strokeIndex: 15, meters: 148 },
      { number: 4, par: 4, strokeIndex: 7, meters: 340 },
      { number: 5, par: 4, strokeIndex: 11, meters: 312 },
      { number: 6, par: 3, strokeIndex: 17, meters: 165 },
      { number: 7, par: 4, strokeIndex: 5, meters: 365 },
      { number: 8, par: 5, strokeIndex: 1, meters: 490 },
      { number: 9, par: 4, strokeIndex: 13, meters: 295 },
    ],
  },
  players: [
    { slot: 1, displayName: "You", isGuest: true, userId: null },
    { slot: 2, displayName: "Partner", isGuest: true, userId: null },
  ],
  score: null,
  lockedAt: null,
  venue: {
    id: "preview",
    slug: "demo-links",
    name: "Demo Links",
    suburb: null,
    city: null,
    latitude: null,
    longitude: null,
  },
};

export default function GolfShotPreviewPage() {
  return (
    <div className="min-h-dvh bg-[#050705]">
      <GolfScorecard initialRound={previewRound} />
    </div>
  );
}
