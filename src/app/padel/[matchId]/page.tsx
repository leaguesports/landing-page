import type { Metadata } from "next";
import { PadelScorecardClientLoader } from "@/components/padel/PadelScorecardClientLoader";
import { getMatch } from "@/lib/match-store";

type PageProps = {
  params: Promise<{ matchId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { matchId } = await params;
  return {
    title: `Live Padel · ${matchId} | LeagueSports`,
    robots: { index: false, follow: false },
  };
}

export default async function LivePadelMatchPage({ params }: PageProps) {
  const { matchId } = await params;
  const match = await getMatch(matchId);

  return (
    <main className="min-h-dvh bg-[#050705]">
      <PadelScorecardClientLoader matchId={matchId} initialMatch={match} />
    </main>
  );
}
