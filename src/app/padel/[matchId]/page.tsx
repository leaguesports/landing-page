import type { Metadata } from "next";
import { headers } from "next/headers";
import { PadelScorecardClientLoader } from "@/components/padel/PadelScorecardClientLoader";
import { lookupPadelMatch } from "@/lib/padel/lookup-match";

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
  const cookie = (await headers()).get("cookie") ?? undefined;
  const match = await lookupPadelMatch(matchId, { cookie });

  return (
    <main className="min-h-dvh bg-[#050705]">
      <PadelScorecardClientLoader matchId={matchId} initialMatch={match} />
    </main>
  );
}
