import type { Metadata } from "next";
import { headers } from "next/headers";
import { GolfScorecardClientLoader } from "@/components/golf/GolfScorecardClientLoader";
import { lookupGolfRound } from "@/lib/golf/lookup-round";

type PageProps = {
  params: Promise<{ roundId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { roundId } = await params;
  return {
    title: `Golf round · ${roundId} | LeagueSports`,
    robots: { index: false, follow: false },
  };
}

export default async function GolfRoundPage({ params }: PageProps) {
  const { roundId } = await params;
  const cookie = (await headers()).get("cookie") ?? undefined;
  const round = await lookupGolfRound(roundId, { cookie });

  return (
    <div className="min-h-dvh bg-[#050705]">
      <GolfScorecardClientLoader roundId={roundId} initialRound={round} />
    </div>
  );
}
